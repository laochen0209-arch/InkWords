'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/contexts/auth-context';

// ============================================================================
// 🚨 关键修复：把 QuestionPanel 组件移到主函数 OUTSIDE (外面)
// 这样 React 就不会在每次打字时销毁它，光标就不会跑了！
// ============================================================================

// 【新增】检测文本是否包含中文字符
const containsChinese = (text: string): boolean => {
  if (!text) return false;
  return /[\u4e00-\u9fa5]/.test(text);
};

// 【新增】解析翻译函数 - 将英文解析翻译为中文
const translateAnalysis = (analysis: string): string => {
  if (!analysis) return '';
  
  const translations: Record<string, string> = {
    'the first paragraph': '第一段',
    'the second paragraph': '第二段',
    'the third paragraph': '第三段',
    'the fourth paragraph': '第四段',
    'the passage': '文章',
    'the text': '文本',
    'mentions': '提到',
    'states': '说明',
    'indicates': '表明',
    'suggests': '暗示',
    'shows': '显示',
    'describes': '描述',
    'explains': '解释',
    'discusses': '讨论',
    'refers to': '指的是',
    'according to': '根据',
    'based on': '基于',
    'therefore': '因此',
    'however': '然而',
    'because': '因为',
    'since': '由于',
    'although': '虽然',
    'but': '但是',
    'so': '所以',
    'the correct answer is': '正确答案是',
    'the answer is': '答案是',
    'is not mentioned': '没有提到',
    'paragraph': '段落',
    'sentence': '句子',
    'word': '单词',
    'context': '上下文',
    'meaning': '意思',
    'topic': '主题',
    'conclusion': '结论',
    'example': '例子',
    'reason': '原因',
    'result': '结果'
  };
  
  let translated = analysis;
  const sortedKeys = Object.keys(translations).sort((a, b) => b.length - a.length);
  
  sortedKeys.forEach((en) => {
    const zh = translations[en];
    const regex = new RegExp(en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    translated = translated.replace(regex, zh);
  });
  
  return translated;
};

// 【新增】反向翻译函数 - 将中文解析翻译为英文
const translateAnalysisToEn = (analysis: string): string => {
  if (!analysis) return '';
  
  const translations: Record<string, string> = {
    '第一段': 'the first paragraph',
    '第二段': 'the second paragraph',
    '第三段': 'the third paragraph',
    '第四段': 'the fourth paragraph',
    '文章': 'the passage',
    '提到': 'mentions',
    '说明': 'states',
    '表明': 'indicates',
    '暗示': 'suggests',
    '显示': 'shows',
    '描述': 'describes',
    '解释': 'explains',
    '讨论': 'discusses',
    '指的是': 'refers to',
    '根据': 'according to',
    '因此': 'therefore',
    '然而': 'however',
    '因为': 'because',
    '但是': 'but',
    '所以': 'so',
    '正确答案是': 'The correct answer is',
    '没有提到': 'is not mentioned',
    '段落': 'paragraph',
    '句子': 'sentence',
    '单词': 'word',
    '上下文': 'context',
    '主题': 'topic',
    '结论': 'conclusion',
    '例子': 'example',
    '原因': 'reason',
    '结果': 'result'
  };
  
  let translated = analysis;
  const sortedKeys = Object.keys(translations).sort((a, b) => b.length - a.length);
  
  sortedKeys.forEach((zh) => {
    const en = translations[zh];
    if (en) {
      const regex = new RegExp(zh.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      translated = translated.replace(regex, en);
    }
  });
  
  return translated;
};

/**
 * QuestionPanel 组件 - 题目面板
 * 
 * 核心渲染逻辑：
 * 1. 数据准备阶段 - 兼容多种答案字段格式，清洗解析数据
 * 2. 通用题干渲染 - 所有题型必须优先渲染 content 字段
 * 3. 题型特定交互 - 根据题型渲染不同的答题组件
 * 4. 解析区域渲染 - 条件渲染解析块，严禁裸露标题
 */
const QuestionPanel = ({
  currentQ,
  currentIdx,
  totalQuestions,
  selectedOption,
  showResult,
  onOptionSelect,
  onSubmit,
  onNext,
  examCategory
}: any) => {

  // ============================================================================
  // 第一步：数据准备 (Data Preparation)
  // ============================================================================

  // 1.1 兼容所有可能的答案字段
  const finalAnswer = currentQ.correct_answer || currentQ.answer || "暂无答案";
  const displayAnswer = typeof finalAnswer === 'object' ? JSON.stringify(finalAnswer) : finalAnswer;

  // 1.2 解析清洗辅助函数
  const hasText = (t: any) => t && typeof t === 'string' && t.trim().length > 0;
  const isCleanEn = (t: string) => hasText(t) && !/[\u4e00-\u9fa5]/.test(t); // 剔除含中文的脏英文数据

  // 1.3 决定显示哪些解析块
  const showEn = isCleanEn(currentQ.explanation_en);
  const showCn = hasText(currentQ.explanation_cn);
  // 仅当新字段全空时，回退到旧字段
  const showLegacy = !showEn && !showCn && hasText(currentQ.explanation);

  // ============================================================================
  // 第二步：渲染辅助函数
  // ============================================================================

  /**
   * 渲染配对题答案
   */
  const renderMatchingAnswer = (answer: string, isChinese = false) => {
    if (!answer) return null;
    
    // 尝试解析 JSON 格式的配对答案
    if (answer.startsWith('{')) {
      try {
        const pairs = JSON.parse(answer);
        return (
          <div className="space-y-1.5">
            {Object.entries(pairs).map(([key, value], idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <span className={`font-medium ${isChinese ? 'font-serif text-stone-700' : 'text-stone-800'}`}>{key}</span>
                <span className="text-stone-400">→</span>
                <span className={isChinese ? 'font-serif text-stone-600' : 'text-stone-700'}>{String(value)}</span>
              </div>
            ))}
          </div>
        );
      } catch {
        // 解析失败，显示原文
        return <span className={isChinese ? 'font-serif text-stone-600' : ''}>{answer}</span>;
      }
    }
    
    // 普通答案
    return <span className={isChinese ? 'font-serif text-stone-600' : ''}>{answer}</span>;
  };

  /**
   * 渲染题型特定的交互组件
   */
  const renderInteractionArea = () => {
    switch (currentQ.type) {
      // --- 1. 单选题 / 判断题 ---
      case 'choice':
      case 'true_false':
        if (!Array.isArray(currentQ.options)) return null;
        
        return currentQ.options.map((opt: string, idx: number) => {
          const isSelected = selectedOption === opt;
          const isCorrect = opt === currentQ.correct_answer;
          
          let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all text-stone-700 relative overflow-hidden ";
          
          if (showResult) {
            if (isCorrect) btnClass += "bg-green-50 border-green-500 text-green-700 font-medium";
            else if (isSelected) btnClass += "bg-red-50 border-red-500 text-red-700";
            else btnClass += "border-stone-200 opacity-50";
          } else {
            if (isSelected) btnClass += "border-[#C23E32] bg-[#C23E32]/5 text-[#C23E32] ring-1 ring-[#C23E32]";
            else btnClass += "border-stone-200 hover:border-stone-300 hover:bg-stone-50";
          }

          return (
            <button key={idx} onClick={() => onOptionSelect(opt)} className={btnClass}>
              <div className="flex items-center z-10 relative">
                <span className={`w-8 h-8 flex items-center justify-center rounded-lg border text-sm mr-3 shrink-0 font-medium ${isSelected || (showResult && isCorrect) ? 'border-current bg-white' : 'border-stone-300 bg-stone-50'}`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="font-serif">{opt}</span>
              </div>
            </button>
          );
        });

      // --- 2. 填空题 / 简答题 ---
      case 'fill_blank':
      case 'short_answer':
        return (
          <div className="relative">
            <input 
              type="text" 
              className="w-full p-4 border-2 border-stone-200 rounded-xl outline-none focus:border-[#C23E32] focus:ring-2 focus:ring-[#C23E32]/10 transition-all text-lg bg-white/50 font-serif"
              placeholder="Type your answer here..." 
              value={selectedOption || ''} 
              onChange={(e) => onOptionSelect(e.target.value)} 
              disabled={showResult} 
              autoComplete="off"
            />
          </div>
        );

      // --- 3. 写作题 ---
      case 'essay':
        return (
          <textarea 
            className="w-full p-4 border-2 border-stone-200 rounded-xl h-48 outline-none focus:border-[#C23E32] focus:ring-2 focus:ring-[#C23E32]/10 transition-all text-base leading-relaxed resize-none bg-white/50 font-serif"
            placeholder="Write your essay here (min 150 words)..." 
            value={selectedOption || ''} 
            onChange={(e) => onOptionSelect(e.target.value)} 
            disabled={showResult} 
          />
        );

      // --- 4. 配对题 ---
      case 'matching':
        return (
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 text-blue-800 text-sm rounded-lg mb-4">
              Please match the following pairs (enter your answer in the box below):
            </div>
            {Array.isArray(currentQ.options) && currentQ.options.map((opt: string, idx: number) => (
              <div key={idx} className="p-4 bg-white border-2 border-stone-200 rounded-xl shadow-sm text-stone-700 font-medium">
                {opt}
              </div>
            ))}
            <textarea 
              className="w-full p-4 border-2 border-stone-200 rounded-xl h-32 outline-none focus:border-[#C23E32] focus:ring-2 focus:ring-[#C23E32]/10 transition-all text-base leading-relaxed resize-none bg-white/50 font-serif mt-4"
              placeholder="Enter your answer here (e.g., Paris - Haussmann renovation, New York - Grid system...)" 
              value={selectedOption || ''} 
              onChange={(e) => onOptionSelect(e.target.value)} 
              disabled={showResult} 
            />
          </div>
        );

      // --- 默认：未知题型显示提示 ---
      default:
        return (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-700 text-sm">
            Unknown question type: {currentQ.type}. Please contact support.
          </div>
        );
    }
  };
  
  return (
    <div className="h-full overflow-y-auto p-6 pb-24 custom-scrollbar">
      {/* 题号与标签 - 水墨风格 */}
      <div className="mb-6 flex justify-between items-center text-sm text-stone-500">
        <span className="bg-stone-100 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase text-stone-600">
          {currentQ.type || 'QUESTION'}
        </span>
        <span className="text-stone-400">Question {currentIdx + 1} / {totalQuestions}</span>
      </div>

      {/* ============================================================================
          核心修复：题干文字显示区 - 无条件渲染
          ============================================================================ */}
      <div className="mb-8">
        {currentQ.content && (
          <div className="text-xl md:text-2xl text-stone-800 font-medium leading-relaxed font-serif">
            {currentQ.content}
          </div>
        )}
      </div>

      {/* 交互区域 (选项/输入框) */}
      <div className="mb-8 space-y-4">
        {renderInteractionArea()}
      </div>

      {/* ============================================================================
          核心修复：解析区域 (仅在 showResult 模式下显示)
          ============================================================================ */}
      {showResult && (
        <div className="mt-8 pt-6 border-t border-red-50 bg-red-50/30 rounded-xl p-6">
          {/* 正确答案 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
              <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest">Correct Answer</h4>
            </div>
            <div className="text-lg font-bold text-red-700 font-mono bg-white/60 p-3 rounded-lg border border-red-100/50 inline-block">
              {displayAnswer}
            </div>
          </div>

          {/* 英文解析 (条件渲染) */}
          {showEn && (
            <div className="mb-4 last:mb-0">
              <h4 className="text-xs font-bold text-stone-400 uppercase mb-2 ml-1">Explanation (EN)</h4>
              <div className="p-4 bg-white rounded-xl border border-stone-100 text-stone-700 text-sm leading-relaxed shadow-sm">
                {currentQ.explanation_en}
              </div>
            </div>
          )}

          {/* 中文解析 (条件渲染) */}
          {showCn && (
            <div className="mb-4 last:mb-0">
              <h4 className="text-xs font-bold text-stone-400 uppercase mb-2 ml-1">解析 (中文)</h4>
              <div className="p-4 bg-white rounded-xl border border-stone-100 text-stone-600 text-sm leading-relaxed font-serif shadow-sm">
                {currentQ.explanation_cn}
              </div>
            </div>
          )}

          {/* 旧版回退 */}
          {showLegacy && (
            <div className="mb-4 last:mb-0">
              <h4 className="text-xs font-bold text-stone-400 uppercase mb-2 ml-1">Explanation</h4>
              <div className="p-4 bg-white rounded-xl border border-stone-100 text-stone-700 text-sm leading-relaxed shadow-sm">
                {currentQ.explanation}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 底部操作按钮 - 水墨风格 */}
      <div className="flex justify-end pt-6">
        {!showResult ? (
          <button 
            onClick={onSubmit} 
            disabled={!selectedOption && currentQ.type !== 'matching'} 
            className="px-8 py-3 bg-[#C23E32] text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#A8352B] transition-all shadow-lg shadow-[#C23E32]/20 font-medium font-serif"
          >
            Submit Answer
          </button>
        ) : (
          <button 
            onClick={onNext} 
            className="px-8 py-3 bg-stone-800 text-white rounded-xl hover:bg-stone-700 transition-all shadow-lg shadow-stone-200 font-medium flex items-center gap-2 font-serif"
          >
            {currentIdx === totalQuestions - 1 ? 'Finish Exam' : 'Next Question →'}
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 主页面组件
// ============================================================================
export default function ExamDrillPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth(); // 获取用户状态

  const [supabase] = useState(() =>
    createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );

  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 答案状态
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  // ============================================================================
  // 【关键修复】建立"用户状态即时通道" (Live Ref)
  // 使用 Ref 穿透闭包，始终获取最新用户状态
  // ============================================================================
  const userRef = useRef(user);
  // Effect 确保 Ref 永远存着最新的 User，不受闭包限制
  useEffect(() => {
    userRef.current = user;
    console.log('[Auth] userRef 已更新:', user?.id || 'null');
  }, [user]);
  
  // 1. 加载数据 - 【修复】从 mock_exams 表获取数据
  useEffect(() => {
    const fetchExamData = async () => {
      if (!params.examId) return;

      try {
        // 【修复】从 mock_exams 表获取试卷数据
        const { data: examData, error: examError } = await supabase
          .from('mock_exams')
          .select('*')
          .eq('id', params.examId)
          .single();

        if (examError || !examData) throw new Error('Exam not found');
        
        // 【修复】转换 mock_exams 数据格式以匹配组件期望的格式
        const formattedExam = {
          id: examData.id,
          title: `${examData.exam_type} 模拟试卷`,
          category: examData.exam_type,
          content: examData.rewritten_content || '',
          difficulty: 'medium',
          exam_type: examData.exam_type,
          sections: examData.sections,
          questions: examData.questions,
          created_at: examData.created_at,
          updated_at: examData.updated_at
        };
        setExam(formattedExam);

        // 【修复】从 sections 或 questions 字段提取题目数据
        let extractedQuestions: any[] = [];
        
        if (examData.sections && Array.isArray(examData.sections)) {
          // 从 sections 中提取所有 questions
          examData.sections.forEach((section: any) => {
            if (section.questions && Array.isArray(section.questions)) {
              const sectionQuestions = section.questions.map((q: any, idx: number) => ({
                id: q.id || `${section.type}-q${idx}`,
                content: q.content || q.stem || '题目内容缺失',
                options: q.options || [],
                correct_answer: q.answer || q.correct_answer || '',
                explanation: q.analysis || q.explanation || '',
                explanation_cn: q.analysis_cn || q.explanation_cn || '',
                explanation_en: q.analysis_en || q.explanation_en || '',
                type: q.type || (q.options?.length > 0 ? 'choice' : 'fill_blank'),
                section_type: section.type
              }));
              extractedQuestions = [...extractedQuestions, ...sectionQuestions];
            }
          });
        }
        
        // 如果没有从 sections 提取到题目，尝试从 questions 字段获取
        if (extractedQuestions.length === 0 && examData.questions) {
          const oldQuestions = typeof examData.questions === 'string' 
            ? JSON.parse(examData.questions) 
            : examData.questions;
          
          if (Array.isArray(oldQuestions)) {
            extractedQuestions = oldQuestions.map((q: any, idx: number) => ({
              id: q.id || `q${idx}`,
              content: q.content || q.stem || '题目内容缺失',
              options: q.options || [],
              correct_answer: q.answer || q.correct_answer || '',
              explanation: q.analysis || q.explanation || '',
              explanation_cn: q.analysis_cn || q.explanation_cn || '',
              explanation_en: q.analysis_en || q.explanation_en || '',
              type: q.type || (q.options?.length > 0 ? 'choice' : 'fill_blank'),
              section_type: 'reading'
            }));
          }
        }

        // 解析 options 字段（如果是字符串）
        const parsedQuestions = extractedQuestions.map(q => ({
          ...q,
          options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
          type: q.type || 'choice'
        }));
        
        setQuestions(parsedQuestions);
        console.log('[ExamDetail] 加载题目数量:', parsedQuestions.length);
      } catch (error) {
        console.error('Failed to load:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchExamData();
  }, [params.examId, supabase]);

  // 2. 交互 Handler
  const handleOptionSelect = (val: any) => {
    if (showResult) return;
    setSelectedOption(val);
  };

  const handleSubmit = () => {
    setShowResult(true);
  };

  const handleNext = async () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      // 最后一题：计算成绩并保存
      await submitExam();
    }
  };

  const submitExam = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // ============================================================================
      // 【核心修复】直接从 Ref 读取，穿透闭包，拿到最新用户
      // ============================================================================
      const activeUser = userRef.current;
      const currentUserId = activeUser?.id;

      console.log('[Finish] 尝试提交，当前用户ID:', currentUserId);

      // 1. 严格检查：如果 Ref 里都没人，那就是真没登录
      if (!currentUserId) {
        console.error('[Finish] userRef 中无用户，当前 user state:', user?.id);
        alert('无法获取用户信息，请刷新页面后重试！\n(System unable to verify identity)');
        setIsSubmitting(false);
        return;
      }

      // 2. 计算正确题数
      let correctCount = 0;
      questions.forEach(q => {
        const userAns = answers[q.id];
        if (userAns === q.correct_answer) correctCount++;
      });

      // 3. 调用 RPC 函数保存成绩 (使用 Ref 拿到的 ID)
      console.log('[Finish] 调用 RPC 提交成绩，用户ID:', currentUserId);
      const { error } = await supabase.rpc('submit_exam_attempt', {
        p_exam_id: params.examId,
        p_total_questions: questions.length,
        p_correct_count: correctCount,
      });

      if (error) {
        console.error('[Finish] RPC 调用失败:', error);
        throw error;
      }

      // 4. 成功提示
      console.log('[Finish] 提交成功！');
      alert(`考试完成！得分: ${correctCount} / ${questions.length}`);

      // 5. 跳转回练习页
      router.push('/practice');
    } catch (err: any) {
      console.error('[Finish] 提交失败:', err);
      alert('提交失败，请截图联系管理员：' + (err.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-[#F5F0E8] to-[#E8E0D5] bg-cover bg-center bg-fixed bg-no-repeat" style={{ backgroundImage: "url('/bg3.png')" }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-[#C23E32]/20 border-t-[#C23E32] rounded-full animate-spin"></div>
        <div className="text-[#666] font-medium font-serif">Preparing Exam Room...</div>
      </div>
    </div>
  );

  if (!exam || questions.length === 0) return null;

  // 3. 渲染逻辑
  if (exam.content) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-[#F5F0E8] to-[#E8E0D5] bg-cover bg-center bg-fixed bg-no-repeat" style={{ backgroundImage: "url('/bg3.png')" }}>
        {/* Header - 水墨风格 */}
        <div className="h-16 bg-white/90 backdrop-blur-md border-b border-stone-200 flex items-center px-6 shrink-0 z-20 shadow-sm justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-stone-100 rounded-full text-stone-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <h1 className="font-bold text-stone-800 truncate max-w-md text-lg font-serif">{exam.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-500 bg-stone-100/80 px-3 py-1 rounded-full">Reading Mode</span>
            <span className="text-sm text-[#C23E32] font-medium">{currentIdx + 1} / {questions.length}</span>
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative">
          <div className="h-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-6 p-0 lg:p-4">
            {/* 左侧：阅读文章 - 水墨风格 */}
            <div className="bg-white/95 backdrop-blur-sm lg:rounded-2xl shadow-lg border border-stone-200/60 overflow-y-auto h-full hidden lg:block custom-scrollbar">
              <div className="p-8 max-w-none">
                <div className="mb-6 pb-4 border-b border-stone-200">
                  <span className="text-xs font-medium text-[#C23E32] uppercase tracking-wider">Reading Passage</span>
                  <h2 className="text-2xl font-bold mt-2 text-stone-800 font-serif">{exam.title}</h2>
                </div>
                <div className="whitespace-pre-wrap text-stone-700 leading-8 font-serif text-lg">
                  {exam.content}
                </div>
              </div>
            </div>

            {/* 右侧：答题区 */}
            <div className="h-full relative">
              <QuestionPanel 
                currentQ={questions[currentIdx]}
                currentIdx={currentIdx}
                totalQuestions={questions.length}
                selectedOption={selectedOption}
                showResult={showResult}
                onOptionSelect={handleOptionSelect}
                onSubmit={handleSubmit}
                onNext={handleNext}
                examCategory={exam?.category}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 默认居中布局 - 水墨风格
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] to-[#E8E0D5] bg-cover bg-center bg-fixed bg-no-repeat pt-6 px-4 pb-20" style={{ backgroundImage: "url('/bg3.png')" }}>
      <div className="max-w-3xl mx-auto">
        {/* 返回按钮 */}
        <button onClick={() => router.back()} className="mb-6 text-stone-600 hover:text-[#C23E32] flex items-center gap-2 transition-colors font-medium">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Practice
        </button>
        
        {/* 试卷标题卡片 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-stone-200/60 p-6 mb-6">
          <div className="text-center">
            <span className="text-xs font-medium text-[#C23E32] uppercase tracking-wider">{exam.category || 'Practice Exam'}</span>
            <h1 className="text-2xl font-bold mt-2 text-stone-800 font-serif">{exam.title}</h1>
            <div className="flex items-center justify-center gap-4 mt-3 text-sm text-stone-500">
              <span>Question {currentIdx + 1} of {questions.length}</span>
              {exam.difficulty && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  exam.difficulty === 'easy' ? 'bg-green-100 text-green-600' :
                  exam.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  {exam.difficulty.charAt(0).toUpperCase() + exam.difficulty.slice(1)}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* 题目卡片 */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-stone-200/60 overflow-hidden min-h-[500px]">
          <QuestionPanel 
            currentQ={questions[currentIdx]}
            currentIdx={currentIdx}
            totalQuestions={questions.length}
            selectedOption={selectedOption}
            showResult={showResult}
            onOptionSelect={handleOptionSelect}
            onSubmit={handleSubmit}
            onNext={handleNext}
            examCategory={exam?.category}
          />
        </div>
      </div>
    </div>
  );
}
