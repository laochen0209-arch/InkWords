/**
 * @file route.ts
 * @description 自动翻译 API - 供 n8n 调用，自动翻译新添加的题目
 * @author InkWords Team
 * @date 2026-02-08
 * 
 * 使用方法:
 * POST /api/auto-translate
 * Body: { examId?: string, questionId?: string }
 * 
 * n8n 集成:
 * 1. 在 n8n 中添加 HTTP Request 节点
 * 2. 方法: POST
 * 3. URL: https://your-domain.com/api/auto-translate
 * 4. Body: 根据触发条件传入 examId 或 questionId
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 检测文本是否包含中文字符
const containsChinese = (text: string): boolean => {
  if (!text) return false;
  return /[\u4e00-\u9fa5]/.test(text);
};

// 调用 DeepSeek API 翻译
const translateWithDeepSeek = async (text: string): Promise<string> => {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY 未设置');
  }

  const prompt = `请将以下中文解析翻译成英文，保持专业性和准确性，只返回翻译结果：

${text}`;

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: '你是一个专业的教育内容翻译助手，擅长将中文考试解析翻译成英文。' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API 失败: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content?.trim() || text;
};

// 处理单个题目的翻译
const translateQuestion = async (
  supabase: any,
  examId: string,
  sectionIndex: number,
  questionIndex: number,
  question: any
): Promise<{ success: boolean; message: string }> => {
  try {
    // 检查是否需要翻译
    if (!question.analysis || !containsChinese(question.analysis)) {
      return { success: true, message: '无需翻译（非中文）' };
    }

    if (question.analysis_en && question.analysis_en.trim() !== '') {
      return { success: true, message: '已有英文解析' };
    }

    // 调用翻译 API
    const translatedText = await translateWithDeepSeek(question.analysis);

    // 更新数据库
    const { data: exam, error: fetchError } = await supabase
      .from('mock_exams')
      .select('sections')
      .eq('id', examId)
      .single();

    if (fetchError) {
      throw new Error(`获取试卷失败: ${fetchError.message}`);
    }

    // 更新特定题目的 analysis_en
    const updatedSections = [...exam.sections];
    updatedSections[sectionIndex].questions[questionIndex].analysis_en = translatedText;

    const { error: updateError } = await supabase
      .from('mock_exams')
      .update({ sections: updatedSections })
      .eq('id', examId);

    if (updateError) {
      throw new Error(`更新失败: ${updateError.message}`);
    }

    return { success: true, message: '翻译完成' };
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : '翻译失败' 
    };
  }
};

// 处理整个试卷的翻译
const translateExam = async (supabase: any, examId: string) => {
  const results = [];
  
  const { data: exam, error } = await supabase
    .from('mock_exams')
    .select('sections, exam_type')
    .eq('id', examId)
    .single();

  if (error) {
    return { success: false, error: `获取试卷失败: ${error.message}` };
  }

  if (!exam.sections || !Array.isArray(exam.sections)) {
    return { success: false, error: '试卷没有 sections 数据' };
  }

  let translatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (let sIdx = 0; sIdx < exam.sections.length; sIdx++) {
    const section = exam.sections[sIdx];
    if (!section.questions || !Array.isArray(section.questions)) continue;

    for (let qIdx = 0; qIdx < section.questions.length; qIdx++) {
      const question = section.questions[qIdx];
      
      const result = await translateQuestion(supabase, examId, sIdx, qIdx, question);
      
      if (result.success) {
        if (result.message === '翻译完成') {
          translatedCount++;
        } else {
          skippedCount++;
        }
      } else {
        errorCount++;
      }
      
      results.push({
        questionId: question.id,
        ...result
      });

      // 延迟避免 API 限制
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return {
    success: true,
    examId,
    examType: exam.exam_type,
    total: results.length,
    translated: translatedCount,
    skipped: skippedCount,
    errors: errorCount,
    details: results
  };
};

// POST 处理自动翻译请求
export async function POST(request: NextRequest) {
  try {
    // 验证环境变量
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { error: 'Supabase 配置缺失' },
        { status: 500 }
      );
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: 'DEEPSEEK_API_KEY 未设置' },
        { status: 500 }
      );
    }

    // 创建 Supabase 客户端
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // 解析请求体
    const body = await request.json();
    const { examId, processAll } = body;

    // 如果指定了 examId，处理单个试卷
    if (examId) {
      const result = await translateExam(supabase, examId);
      return NextResponse.json(result, { status: result.success ? 200 : 500 });
    }

    // 如果 processAll 为 true，处理所有未翻译的试卷
    if (processAll) {
      const { data: exams, error } = await supabase
        .from('mock_exams')
        .select('id, exam_type');

      if (error) {
        return NextResponse.json(
          { error: `获取试卷列表失败: ${error.message}` },
          { status: 500 }
        );
      }

      const allResults = [];
      for (const exam of exams) {
        const result = await translateExam(supabase, exam.id);
        allResults.push(result);
      }

      return NextResponse.json({
        success: true,
        totalExams: exams.length,
        results: allResults
      });
    }

    return NextResponse.json(
      { error: '请提供 examId 或设置 processAll: true' },
      { status: 400 }
    );

  } catch (error) {
    console.error('自动翻译错误:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '处理失败' },
      { status: 500 }
    );
  }
}

// GET 获取待翻译的试卷列表
export async function GET(request: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { error: 'Supabase 配置缺失' },
        { status: 500 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: exams, error } = await supabase
      .from('mock_exams')
      .select('id, exam_type, title');

    if (error) {
      return NextResponse.json(
        { error: `获取试卷列表失败: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      total: exams.length,
      exams: exams.map((e: any) => ({
        id: e.id,
        type: e.exam_type,
        title: e.title
      }))
    });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '获取失败' },
      { status: 500 }
    );
  }
}
