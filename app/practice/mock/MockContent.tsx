"use client";

/**
 * @file MockContent.tsx
 * @description 模拟考试内容组件 - 包含所有客户端逻辑
 * @version 3.0.0 - 重构为 API 调用模式，绕过 GFW 阻断
 */

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, ArrowLeft, FileText, ChevronDown, Check } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const STORAGE_KEYS = {
  MOCK_EXAM_TYPE: 'inkwords_mock_exam_type'
}

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

interface MockExam {
  id: string;
  title_en: string;
  rewritten_content: string;
  questions: any[];
  sections: any[];
  exam_type: string;
}

/**
 * 模拟考试内容组件
 * @version 3.0.0 - 重构为 API 调用模式
 * @returns JSX.Element
 */
export default function MockContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getInitialType = useCallback(() => {
    const urlType = searchParams.get("type")
    return urlType || loadFromStorage(STORAGE_KEYS.MOCK_EXAM_TYPE, "IELTS")
  }, [searchParams])

  const [currentType, setCurrentType] = useState(getInitialType)
  const [exam, setExam] = useState<MockExam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const exams = ["IELTS", "TOEFL", "CET-4", "CET-6", "HSK", "BCT", "TOCFL"];

  /**
   * 切换考试类型（带状态持久化）
   * @param newType - 新的考试类型
   */
  const handleSwitch = useCallback((newType: string) => {
    localStorage.setItem(STORAGE_KEYS.MOCK_EXAM_TYPE, JSON.stringify(newType))
    const params = new URLSearchParams(searchParams.toString());
    params.set("type", newType);
    console.log("Switching to:", newType);
    router.push(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams]);

  /**
   * 获取考试数据
   * 通过 API 路由获取数据，绕过 GFW 阻断
   */
  async function fetchExam() {
    try {
      setLoading(true);
      setError(null);
      setIsSubmitted(false);
      setUserAnswers({});
      setScore(0);

      console.log('[Mock] 开始获取试卷，类型:', currentType);

      const response = await fetch(`/api/practice/exams?type=${currentType}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '网络请求失败');
      }

      const result = await response.json();

      if (!result.success || !result.data || result.data.length === 0) {
        console.log('[Mock] 没有找到试卷');
        setExam(null);
        setLoading(false);
        return;
      }

      const allExams = result.data;

      const isValidExam = (exam: any) => {
        let hasQuestions = false;
        if (exam.questions) {
          try {
            const qs = typeof exam.questions === 'string' ? JSON.parse(exam.questions) : exam.questions;
            hasQuestions = Array.isArray(qs) && qs.length > 0;
          } catch {
            hasQuestions = false;
          }
        }

        let hasSections = false;
        if (exam.sections) {
          try {
            const secs = typeof exam.sections === 'string' ? JSON.parse(exam.sections) : exam.sections;
            hasSections = Array.isArray(secs) && secs.length > 0 &&
              secs.some((s: any) => {
                try {
                  const qs = typeof s.questions === 'string' ? JSON.parse(s.questions) : s.questions;
                  return Array.isArray(qs) && qs.length > 0;
                } catch {
                  return false;
                }
              });
          } catch {
            hasSections = false;
          }
        }

        return hasQuestions || hasSections;
      };

      const validExams = (allExams || []).filter(isValidExam);

      if (validExams.length === 0) {
        console.log('[Mock] 没有找到有效试卷');
        setExam(null);
        setLoading(false);
        return;
      }

      const randomIndex = Math.floor(Math.random() * validExams.length);
      const data = validExams[randomIndex];
      console.log('[Mock] 选中试卷ID:', data.id);

      const examData = { ...data };

      if ((!examData.questions || examData.questions.length === 0) && examData.sections) {
        console.log('[Mock] 检测到 sections 格式数据，正在转换...');

        try {
          let sections: any[] = [];
          if (typeof examData.sections === 'string') {
            sections = JSON.parse(examData.sections);
          } else if (Array.isArray(examData.sections)) {
            sections = examData.sections;
          }

          if (!Array.isArray(sections)) {
            console.error('[Mock] sections 不是数组格式:', sections);
            sections = [];
          }

          const allQuestions: any[] = [];

          sections.forEach((section: any, sectionIndex: number) => {
            if (!section || typeof section !== 'object') {
              console.warn('[Mock] 跳过无效的 section:', section);
              return;
            }

            let sectionQuestions: any[] = [];
            try {
              if (typeof section.questions === 'string') {
                sectionQuestions = JSON.parse(section.questions);
              } else if (Array.isArray(section.questions)) {
                sectionQuestions = section.questions;
              }
            } catch (e) {
              console.error('[Mock] 解析 section questions 失败:', e);
              sectionQuestions = [];
            }

            if (!Array.isArray(sectionQuestions)) {
              console.warn('[Mock] section questions 不是数组:', sectionQuestions);
              return;
            }

            sectionQuestions.forEach((q: any, qIndex: number) => {
              if (!q || typeof q !== 'object') {
                console.warn('[Mock] 跳过无效的 question:', q);
                return;
              }

              let options: any[] = [];
              try {
                if (typeof q.options === 'string') {
                  options = JSON.parse(q.options);
                } else if (Array.isArray(q.options)) {
                  options = q.options;
                }
              } catch (e) {
                console.error('[Mock] 解析 options 失败:', e);
                options = [];
              }

              const safeOptions = Array.isArray(options)
                ? options.map((opt: any) => {
                    if (opt === null || opt === undefined) return '';
                    if (typeof opt === 'object') return JSON.stringify(opt);
                    return String(opt);
                  }).filter((s: string) => s.trim() !== '')
                : [];

              const cleanQuestion = {
                ...q,
                stem: q.stem ? String(q.stem) : (q.content ? String(q.content) : '题目内容缺失'),
                answer: q.answer ? String(q.answer) : (q.correct_answer ? String(q.correct_answer) : ''),
                options: safeOptions,
                analysis: q.analysis || q.explanation || '',
              };

              allQuestions.push(cleanQuestion);
            });
          });

          examData.questions = allQuestions;
          console.log('[Mock] 转换完成，共提取', examData.questions.length, '道题');
        } catch (e) {
          console.error('[Mock] sections 转换失败:', e);
          examData.questions = [];
        }
      } else if (examData.questions) {
        console.log('[Mock] 检测到旧格式 questions 数据，正在清洗...');

        try {
          let questions: any[] = [];
          if (typeof examData.questions === 'string') {
            questions = JSON.parse(examData.questions);
          } else if (Array.isArray(examData.questions)) {
            questions = examData.questions;
          }

          if (!Array.isArray(questions)) {
            console.error('[Mock] questions 不是数组格式:', questions);
            questions = [];
          }

          examData.questions = questions.map((q: any) => {
            if (!q || typeof q !== 'object') return null;

            let options: any[] = [];
            try {
              if (typeof q.options === 'string') {
                options = JSON.parse(q.options);
              } else if (Array.isArray(q.options)) {
                options = q.options;
              }
            } catch {
              options = [];
            }

            const safeOptions = Array.isArray(options)
              ? options.map((opt: any) => {
                  if (opt === null || opt === undefined) return '';
                  if (typeof opt === 'object') return JSON.stringify(opt);
                  return String(opt);
                }).filter((s: string) => s.trim() !== '')
              : [];

            return {
              ...q,
              stem: q.stem ? String(q.stem) : (q.content ? String(q.content) : '题目内容缺失'),
              answer: q.answer ? String(q.answer) : (q.correct_answer ? String(q.correct_answer) : ''),
              options: safeOptions,
              analysis: q.analysis || q.explanation || '',
            };
          }).filter((q: any) => q !== null);

          console.log('[Mock] 旧格式 questions 清洗完成，共', examData.questions.length, '道题');
        } catch (e) {
          console.error('[Mock] 旧格式 questions 清洗失败:', e);
          examData.questions = [];
        }
      }

      setExam(examData);
    } catch (err: any) {
      console.error("[Mock] Error:", err);
      setError(err.message || '数据加载失败，请稍后重试');
      setExam(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchExam(); }, [currentType]);

  /**
   * 提交答案
   */
  const handleSubmit = () => {
    if (!exam) return;
    let correctCount = 0;
    exam.questions.forEach((q, index) => {
      const userAns = userAnswers[index]?.trim().toLowerCase();
      const correctAns = q.answer?.trim().toLowerCase();
      if (userAns && correctAns && userAns.startsWith(correctAns.charAt(0))) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setIsSubmitted(true);
  };

  /**
   * 重试加载
   */
  const handleRetry = () => {
    fetchExam();
  };

  if (loading) return (
    <div
      className="flex h-screen items-center justify-center"
      style={{ backgroundImage: "url('/bg3.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <p className="ml-2 text-slate-600 font-medium">正在加载试卷...</p>
    </div>
  );

  if (error) return (
    <div
      className="flex h-screen flex-col items-center justify-center space-y-4"
      style={{ backgroundImage: "url('/bg3.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="rounded-full bg-red-100 p-4">
        <FileText className="h-8 w-8 text-red-500" />
      </div>
      <h2 className="text-xl font-bold text-slate-800">数据加载失败</h2>
      <p className="text-slate-500">{error}</p>
      <div className="flex gap-3">
        <Button onClick={handleRetry} variant="outline">
          重试
        </Button>
        <Button asChild variant="outline">
          <Link href="/practice">返回大厅</Link>
        </Button>
      </div>
    </div>
  );

  if (!exam) return (
    <div
      className="flex h-screen flex-col items-center justify-center space-y-4"
      style={{ backgroundImage: "url('/bg3.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="rounded-full bg-slate-200 p-4">
        <Loader2 className="h-8 w-8 text-slate-500" />
      </div>
      <h2 className="text-xl font-bold text-slate-800">暂无 {currentType} 试卷</h2>
      <p className="text-slate-500">AI 工厂正在后台生成中，请稍等几分钟再刷新...</p>
      <Button asChild variant="outline">
        <Link href="/practice">返回大厅</Link>
      </Button>
    </div>
  );

  return (
    <div
      className="min-h-screen p-4 lg:p-8 font-sans"
      style={{ backgroundImage: "url('/bg3.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}
    >
      <header className="mb-8 flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200 sticky top-0 z-50 backdrop-blur-md bg-white/90">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild className="text-slate-500 hover:text-slate-900">
            <Link href="/practice"><ArrowLeft className="mr-2 h-4 w-4"/> Exit</Link>
          </Button>
          <div className="h-6 w-px bg-slate-200"></div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 group">
                <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600"/>
                  {currentType} Practice
                </h1>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {exams.map((exam) => (
                <DropdownMenuItem
                  key={exam}
                  onClick={() => handleSwitch(exam)}
                  className="cursor-pointer flex justify-between"
                >
                  {exam}
                  {currentType === exam && <Check className="w-4 h-4 text-blue-600" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-3">
          {isSubmitted && <span className="text-lg font-bold text-amber-600">Score: {score}</span>}
          <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-mono border border-slate-200">
            {(() => {
              if (exam?.questions?.length) return exam.questions.length;
              if (exam?.sections) {
                try {
                  const sections = typeof exam.sections === 'string' ? JSON.parse(exam.sections) : exam.sections;
                  if (Array.isArray(sections)) {
                    return sections.reduce((acc: number, s: any) => {
                      try {
                        const qs = typeof s.questions === 'string' ? JSON.parse(s.questions) : s.questions;
                        return acc + (Array.isArray(qs) ? qs.length : 0);
                      } catch {
                        return acc;
                      }
                    }, 0);
                  }
                } catch {
                  return 0;
                }
              }
              return 0;
            })()} Qs
          </span>
        </div>
      </header>
      <div className="grid gap-8 lg:grid-cols-12 items-start relative">

        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
          <Card className="shadow-sm border-slate-200 bg-white">
            <div className="p-6 lg:p-8">
              <h2 className="text-2xl font-bold mb-6 text-slate-900 leading-tight border-b pb-4">
                {exam.title_en}
              </h2>
              <div className="prose prose-slate prose-lg max-w-none text-justify">
                {exam.rewritten_content?.split('\n').map((p, i) => p.trim() && (
                  <p key={i} className="mb-4 text-slate-700 leading-relaxed">{p}</p>
                ))}
              </div>
            </div>
          </Card>
          <div className="text-xs text-slate-400 text-center px-4">
            * Article is pinned for reference while you answer questions.
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6 pb-20">
          {exam.questions && exam.questions.length > 0 ? (
            exam.questions.map((q: any, index: number) => {
              if (!q) return null;
              const userAnswer = userAnswers[index];
              const correctTag = q.answer?.trim().toUpperCase();
              const isMCQ = q.options && q.options.length > 0;

              let statusColor = "border-slate-200 bg-white";
              if (isSubmitted) {
                const answerStr = userAnswer || "";
                const isCorrect = answerStr.toLowerCase().startsWith(correctTag?.toLowerCase());
                statusColor = isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50";
              }
              return (
                <Card key={index} className={cn("p-6 rounded-xl border transition-all shadow-sm hover:shadow-md", statusColor)}>
                  <div className="flex items-start gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600 border border-slate-200">
                      {index + 1}
                    </span>
                    <div className="flex-1 space-y-4">
                      <h3 className="font-bold text-slate-900 text-lg pt-0.5">{q.stem}</h3>
                      {isMCQ ? (
                        <RadioGroup
                          disabled={isSubmitted}
                          onValueChange={(val) => setUserAnswers(prev => ({...prev, [index]: val}))}
                          value={userAnswer}
                          className="space-y-3"
                        >
                          {q.options.map((opt: string, i: number) => {
                            const isSelected = userAnswer === opt;
                            return (
                              <Label key={i} className={cn("flex items-center w-full p-4 rounded-lg border cursor-pointer transition-all", isSelected ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600" : "border-slate-200 hover:bg-slate-50", isSubmitted && opt.startsWith(correctTag) && "border-green-500 bg-green-100")}>
                                <RadioGroupItem value={opt} id={`q${index}-${i}`} className="sr-only" />
                                <div className={cn("mr-3 h-4 w-4 rounded-full border", isSelected ? "border-blue-600 bg-blue-600" : "border-slate-300")} />
                                <span className="text-base text-slate-700">{opt}</span>
                              </Label>
                            )
                          })}
                        </RadioGroup>
                      ) : (
                        <div className="space-y-2">
                          <Label className="text-sm text-slate-500">Your Answer:</Label>
                          <Textarea disabled={isSubmitted} value={userAnswer || ''} onChange={(e) => setUserAnswers(prev => ({...prev, [index]: e.target.value}))} placeholder="Type your answer here..." className="min-h-[80px] text-base border-slate-300 focus:border-blue-500 bg-white resize-none"/>
                        </div>
                      )}
                      {isSubmitted && (
                        <div className="mt-4 p-4 bg-white/50 rounded-lg border border-slate-200/60 text-sm">
                          <div className="font-bold text-slate-700 mb-1">Analysis:</div>
                          <div className="text-slate-600 leading-relaxed">{q.analysis || "暂无解析"}</div>
                          {!isMCQ && <div className="mt-2 text-green-700 font-bold">Ref: {q.answer}</div>}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            }).filter(Boolean)
          ) : (
            <Card className="p-8 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700 mb-2">暂无题目</h3>
              <p className="text-slate-500">这份试卷的题目数据格式有问题，请尝试刷新页面或选择其他试卷。</p>
            </Card>
          )}
          <div className="sticky bottom-0 p-4 bg-white/90 backdrop-blur border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] rounded-t-xl flex justify-end z-40 mt-8">
            {!isSubmitted ? (
              <Button onClick={handleSubmit} size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-lg shadow-blue-200 shadow-lg">Submit Answers</Button>
            ) : (
              <Button onClick={() => window.location.reload()} size="lg" variant="outline" className="w-full sm:w-auto border-slate-300">Next Practice <ArrowLeft className="ml-2 h-4 w-4 rotate-180"/></Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
