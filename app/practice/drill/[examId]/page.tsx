'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/contexts/auth-context';

/**
 * @file page.tsx
 * @description 考试详情页面 - 通过 API 路由获取数据
 * @version 2.0.0 - 重构为 API 调用模式，绕过 GFW 阻断
 */

const containsChinese = (text: string): boolean => {
  if (!text) return false;
  return /[\u4e00-\u9fa5]/.test(text);
};

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

  const finalAnswer = currentQ.correct_answer || currentQ.answer || "暂无答案";
  const displayAnswer = typeof finalAnswer === 'object' ? JSON.stringify(finalAnswer) : finalAnswer;

  const hasText = (t: any) => t && typeof t === 'string' && t.trim().length > 0;
  const isCleanEn = (t: string) => hasText(t) && !/[\u4e00-\u9fa5]/.test(t);

  const showEn = isCleanEn(currentQ.explanation_en);
  const showCn = hasText(currentQ.explanation_cn);
  const showLegacy = !showEn && !showCn && hasText(currentQ.explanation);

  const renderMatchingAnswer = (answer: string, isChinese = false) => {
    if (!answer) return null;
    
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
        return <span className={isChinese ? 'font-serif text-stone-600' : ''}>{answer}</span>;
      }
    }
    
    return <span className={isChinese ? 'font-serif text-stone-600' : ''}>{answer}</span>;
  };

  const renderInteractionArea = () => {
    switch (currentQ.type) {
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
      <div className="mb-6 flex justify-between items-center text-sm text-stone-500">
        <span className="bg-stone-100 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase text-stone-600">
          {currentQ.type || 'QUESTION'}
        </span>
        <span className="text-stone-400">Question {currentIdx + 1} / {totalQuestions}</span>
      </div>

      <div className="mb-8">
        {currentQ.content && (
          <div className="text-xl md:text-2xl text-stone-800 font-medium leading-relaxed font-serif">
            {currentQ.content}
          </div>
        )}
      </div>

      <div className="mb-8 space-y-4">
        {renderInteractionArea()}
      </div>

      {showResult && (
        <div className="mt-8 pt-6 border-t border-red-50 bg-red-50/30 rounded-xl p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
              <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest">Correct Answer</h4>
            </div>
            <div className="text-lg font-bold text-red-700 font-mono bg-white/60 p-3 rounded-lg border border-red-100/50 inline-block">
              {displayAnswer}
            </div>
          </div>

          {showEn && (
            <div className="mb-4 last:mb-0">
              <h4 className="text-xs font-bold text-stone-400 uppercase mb-2 ml-1">Explanation (EN)</h4>
              <div className="p-4 bg-white rounded-xl border border-stone-100 text-stone-700 text-sm leading-relaxed shadow-sm">
                {currentQ.explanation_en}
              </div>
            </div>
          )}

          {showCn && (
            <div className="mb-4 last:mb-0">
              <h4 className="text-xs font-bold text-stone-400 uppercase mb-2 ml-1">解析 (中文)</h4>
              <div className="p-4 bg-white rounded-xl border border-stone-100 text-stone-600 text-sm leading-relaxed font-serif shadow-sm">
                {currentQ.explanation_cn}
              </div>
            </div>
          )}

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

/**
 * 主页面组件
 */
export default function ExamDrillPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const userRef = useRef(user);
  
  useEffect(() => {
    userRef.current = user;
    console.log('[Auth] userRef 已更新:', user?.id || 'null');
  }, [user]);

  /**
   * 加载数据 - 通过 API 路由获取数据
   */
  useEffect(() => {
    const fetchExamData = async () => {
      if (!params.examId) return;

      try {
        setLoading(true);
        setError(null);

        console.log('[ExamDetail] 开始获取试卷，ID:', params.examId);

        const response = await fetch(`/api/practice/exams?id=${params.examId}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || '试卷不存在');
        }

        const result = await response.json();

        if (!result.success || !result.data) {
          throw new Error('试卷数据格式错误');
        }

        const examData = result.data;

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

        let extractedQuestions: any[] = [];
        
        if (examData.sections && Array.isArray(examData.sections)) {
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

        const parsedQuestions = extractedQuestions.map(q => ({
          ...q,
          options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
          type: q.type || 'choice'
        }));
        
        setQuestions(parsedQuestions);
        console.log('[ExamDetail] 加载题目数量:', parsedQuestions.length);
      } catch (error: any) {
        console.error('[ExamDetail] 加载失败:', error);
        setError(error.message || '数据加载失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };
    fetchExamData();
  }, [params.examId]);

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
      await submitExam();
    }
  };

  const submitExam = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const activeUser = userRef.current;
      const currentUserId = activeUser?.id;

      console.log('[Finish] 尝试提交，当前用户ID:', currentUserId);

      if (!currentUserId) {
        console.error('[Finish] userRef 中无用户，当前 user state:', user?.id);
        alert('无法获取用户信息，请刷新页面后重试！\n(System unable to verify identity)');
        setIsSubmitting(false);
        return;
      }

      let correctCount = 0;
      questions.forEach(q => {
        const userAns = answers[q.id];
        if (userAns === q.correct_answer) correctCount++;
      });

      console.log('[Finish] 提交成绩，用户ID:', currentUserId);
      
      const response = await fetch('/api/practice/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          examId: params.examId,
          totalQuestions: questions.length,
          correctCount: correctCount,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error('[Finish] 提交失败:', result);
        throw new Error(result.error || '提交失败');
      }

      console.log('[Finish] 提交成功！');
      alert(`考试完成！得分: ${correctCount} / ${questions.length}`);

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

  if (error) return (
    <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-br from-[#F5F0E8] to-[#E8E0D5] bg-cover bg-center bg-fixed bg-no-repeat" style={{ backgroundImage: "url('/bg3.png')" }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <span className="text-2xl">❌</span>
        </div>
        <h2 className="text-xl font-bold text-stone-800">数据加载失败</h2>
        <p className="text-stone-500">{error}</p>
        <button 
          onClick={() => router.push('/practice')}
          className="px-6 py-2 bg-[#C23E32] text-white rounded-lg hover:bg-[#A8352B] transition-colors"
        >
          返回练习中心
        </button>
      </div>
    </div>
  );

  if (!exam || questions.length === 0) return null;

  if (exam.content) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-[#F5F0E8] to-[#E8E0D5] bg-cover bg-center bg-fixed bg-no-repeat" style={{ backgroundImage: "url('/bg3.png')" }}>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] to-[#E8E0D5] bg-cover bg-center bg-fixed bg-no-repeat pt-6 px-4 pb-20" style={{ backgroundImage: "url('/bg3.png')" }}>
      <div className="max-w-3xl mx-auto">
        <button onClick={() => router.back()} className="mb-6 text-stone-600 hover:text-[#C23E32] flex items-center gap-2 transition-colors font-medium">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Practice
        </button>
        
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
