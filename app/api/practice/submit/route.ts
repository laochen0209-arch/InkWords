/**
 * @file route.ts
 * @description 练习提交接口 - 支持考试阅卷和AI评分
 * @author InkWords Team
 * @date 2026-02-01
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * 题目类型
 */
type QuestionType = 'multiple_choice' | 'true_false' | 'fill_blank' | 'essay'

/**
 * 题目接口
 */
interface Question {
  id: string
  type: QuestionType
  stem: string
  options?: string[]
  answer: string
  analysis: string
  userAnswer?: string
}

/**
 * Section 接口
 */
interface Section {
  type: 'listening' | 'reading' | 'vocabulary' | 'writing'
  title: string
  questions: Question[]
}

/**
 * 考试数据接口
 */
interface ExamData {
  examType: string
  sections: Section[]
}

/**
 * AI 评分结果
 */
interface AIGradingResult {
  score: number
  feedback: string
  grammarIssues?: string[]
  vocabularySuggestions?: string[]
}

/**
 * 考试结果详情
 */
interface ExamResultDetails {
  sections: {
    type: string
    title: string
    score: number
    maxScore: number
    correctCount: number
    totalQuestions: number
    wrongAnswers: {
      questionId: string
      stem: string
      userAnswer: string
      correctAnswer: string
      analysis: string
    }[]
  }[]
  aiGrading?: AIGradingResult
}

/**
 * 客观题评分
 * @param question 题目
 * @param userAnswer 用户答案
 * @returns 是否正确
 */
function gradeObjectiveQuestion(question: Question, userAnswer: string): boolean {
  if (!userAnswer || !question.answer) return false

  const userAns = userAnswer.trim().toLowerCase()
  const correctAns = question.answer.trim().toLowerCase()

  if (question.type === 'multiple_choice' || question.type === 'true_false') {
    // 选择题和判断题：匹配选项首字母或完整内容
    return userAns === correctAns || userAns.startsWith(correctAns.charAt(0))
  } else if (question.type === 'fill_blank') {
    // 填空题：完全匹配
    return userAns === correctAns
  }

  return false
}

/**
 * 调用 AI API 评分主观题
 * @param question 题目
 * @param userAnswer 用户答案
 * @returns AI 评分结果
 */
async function gradeWithAI(question: Question, userAnswer: string): Promise<AIGradingResult> {
  try {
    const prompt = `你是一位专业的语言考试阅卷老师。

请对以下答案进行评分（0-10分）：

题目：${question.stem}
用户答案：${userAnswer}

请按以下格式返回 JSON：
{
  "score": 7,
  "feedback": "优点：...\\n改进建议：...",
  "grammarIssues": ["语法问题1", "语法问题2"],
  "vocabularySuggestions": ["词汇建议1", "词汇建议2"]
}

评分标准：
- 9-10分：优秀，表达清晰，语法正确，词汇丰富
- 7-8分：良好，有小错误但不影响理解
- 5-6分：及格，有明显错误但能表达基本意思
- 3-4分：较差，错误较多，影响理解
- 0-2分：很差，几乎无法理解

只返回 JSON，不要其他内容。`

    // 调用 DeepSeek API
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY || ''}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是一个专业的语言考试阅卷老师。' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' }
      })
    })

    if (!response.ok) {
      throw new Error(`AI API 调用失败: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content

    // 解析 AI 返回的 JSON
    const result: AIGradingResult = JSON.parse(content)
    
    // 确保分数在 0-10 范围内
    result.score = Math.max(0, Math.min(10, result.score))
    
    return result
  } catch (error) {
    console.error('AI 评分失败:', error)
    // 返回默认评分
    return {
      score: 5,
      feedback: 'AI 评分服务暂时不可用，已给出默认分数。',
      grammarIssues: [],
      vocabularySuggestions: []
    }
  }
}

/**
 * POST 处理考试提交
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    let { userId, examData, userAnswers } = body as {
      userId: string
      examData: ExamData
      userAnswers: Record<string, Record<string, string>>
    }

    if (!examData || !userAnswers) {
      return NextResponse.json(
        { error: '参数不完整' },
        { status: 400 }
      )
    }

    // 如果用户未登录，使用系统 guest 用户 ID
    if (!userId || userId === 'guest-user') {
      userId = '00000000-0000-0000-0000-000000000000'
    }

    // 初始化结果详情
    const details: ExamResultDetails = {
      sections: []
    }

    let totalScore = 0
    let totalMaxScore = 0
    let hasEssay = false

    // 遍历所有 section 进行评分
    for (const section of examData.sections) {
      const sectionResult = {
        type: section.type,
        title: section.title,
        score: 0,
        maxScore: section.questions.length * 10, // 每题10分
        correctCount: 0,
        totalQuestions: section.questions.length,
        wrongAnswers: [] as any[]
      }

      const sectionAnswers = userAnswers[section.type] || {}

      for (const question of section.questions) {
        const userAnswer = sectionAnswers[question.id] || ''

        if (question.type === 'essay') {
          // 主观题：调用 AI 评分
          hasEssay = true
          const aiResult = await gradeWithAI(question, userAnswer)
          sectionResult.score += aiResult.score
          
          // 保存 AI 评分结果
          if (!details.aiGrading) {
            details.aiGrading = aiResult
          }
        } else {
          // 客观题：自动评分
          const isCorrect = gradeObjectiveQuestion(question, userAnswer)
          
          if (isCorrect) {
            sectionResult.correctCount++
            sectionResult.score += 10
          } else {
            // 记录错题
            sectionResult.wrongAnswers.push({
              questionId: question.id,
              stem: question.stem,
              userAnswer: userAnswer || '(未作答)',
              correctAnswer: question.answer,
              analysis: question.analysis
            })
          }
        }
      }

      details.sections.push(sectionResult)
      totalScore += sectionResult.score
      totalMaxScore += sectionResult.maxScore
    }

    // 将总分转换为百分制
    const finalScore = Math.round((totalScore / totalMaxScore) * 100)

    // 保存考试结果到数据库
    const examResult = await prisma.examResult.create({
      data: {
        userId,
        examType: examData.examType,
        score: finalScore,
        maxScore: 100,
        details: details as any,
        aiFeedback: details.aiGrading?.feedback || null
      }
    })

    // 同时记录到 PracticeLog（向后兼容）
    await prisma.practiceLog.create({
      data: {
        userId,
        score: finalScore,
        mode: examData.examType
      }
    })

    // 【新增】保存错题到错题本
    for (const section of details.sections) {
      for (const wrong of section.wrongAnswers) {
        // 查找原始题目以获取完整信息
        const originalSection = examData.sections.find(s => s.type === section.type)
        const originalQuestion = originalSection?.questions.find(q => q.id === wrong.questionId)

        await prisma.mistakeBook.create({
          data: {
            userId,
            examType: examData.examType,
            sectionType: section.type,
            questionContent: {
              id: wrong.questionId,
              type: originalQuestion?.type || 'multiple_choice',
              stem: wrong.stem,
              options: originalQuestion?.options || [],
              answer: wrong.correctAnswer,
              analysis: wrong.analysis
            },
            userAnswer: wrong.userAnswer,
            correctAnswer: wrong.correctAnswer,
            analysis: wrong.analysis
          }
        })
      }
    }

    console.log('[Practice Submit] 保存了', details.sections.reduce((sum, s) => sum + s.wrongAnswers.length, 0), '道错题')

    return NextResponse.json(
      {
        message: '考试提交成功',
        resultId: examResult.id,
        score: finalScore,
        maxScore: 100,
        details: details,
        aiFeedback: details.aiGrading?.feedback || null
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Exam submit error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
