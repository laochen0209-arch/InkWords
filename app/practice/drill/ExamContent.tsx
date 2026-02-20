/**
 * @file ExamContent.tsx
 * @description 智能刷题内容组件 - V8.0 强哥核弹修复版 (移除所有第三方Form组件，使用原生HTML重写，100%防崩)
 * @author InkWords Team & Xiao Qiang
 * @date 2026-02-10
 */

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase, logUserActivity } from "@/lib/supabase";
import { useAuth } from "@/lib/contexts/auth-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Loader2,
  ArrowLeft,
  FileText,
  ChevronDown,
  Check,
  Headphones,
  BookOpen,
  Type,
  Play,
  Pause,
  Volume2,
  Clock,
  AlertCircle,
  Home,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { consumePracticeTicket } from "@/lib/user-stats";

// --- 基础配置 ---
const STORAGE_KEYS = {
  DRILL_EXAM_TYPE: 'inkwords_drill_exam_type',
  DRILL_MODE: 'inkwords_drill_mode'
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

type QuestionType = 'multiple_choice' | 'true_false' | 'fill_blank';
type SectionType = 'listening' | 'reading' | 'vocabulary';

interface Question {
  id: string;
  type: QuestionType;
  stem?: string;
  content?: string;
  options?: string[];
  answer: string;
  analysis?: string;
  analysis_cn?: string;
  analysis_en?: string;
}

interface Section {
  type: SectionType;
  title: string;
  content?: string;
  transcript?: string;
  questions: Question[];
}

interface DrillExam {
  id: string;
  exam_type: string;
  sections: Section[];
  created_at?: string;
}

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: "选择题",
  true_false: "判断题",
  fill_blank: "填空题",
};

const SECTION_ICONS: Record<SectionType, React.ReactNode> = {
  listening: <Headphones className="w-4 h-4" />,
  reading: <BookOpen className="w-4 h-4" />,
  vocabulary: <Type className="w-4 h-4" />,
};

const SECTION_TITLES: Record<SectionType, string> = {
  listening: "听力理解",
  reading: "阅读理解",
  vocabulary: "词汇运用",
};

const EXAM_DURATIONS: Record<string, number> = {
  IELTS: 170, TOEFL: 120, "CET-4": 125, "CET-6": 130, HSK: 90, BCT: 120, TOCFL: 100,
};

const getExamDuration = (examType: string): number => EXAM_DURATIONS[examType] || 60;

// --- 主组件 ---
interface ExamContentProps {
  examId?: string;
}

export default function ExamContent({ examId }: ExamContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user: authUser } = useAuth();

  // 初始化状态
  const getInitialState = useCallback(() => {
    const urlType = searchParams.get("type")
    const urlMode = searchParams.get("mode")
    return {
      type: urlType || loadFromStorage(STORAGE_KEYS.DRILL_EXAM_TYPE, "IELTS"),
      mode: urlMode || loadFromStorage(STORAGE_KEYS.DRILL_MODE, "exam")
    }
  }, [searchParams])

  const initialState = getInitialState()
  const [currentType, setCurrentType] = useState(initialState.type)
  const [mode, setMode] = useState(initialState.mode)
  const isPracticeMode = mode === "practice";

  // 数据状态
  const [exam, setExam] = useState<DrillExam | null>(null);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState<Record<string, Record<string, string>>>({});
  
  // Tab 状态
  const [activeTab, setActiveTab] = useState<string>("listening");
  
  const [playingSection, setPlayingSection] = useState<string | null>(null);
  const [expandedAnalysis, setExpandedAnalysis] = useState<Set<string>>(new Set());
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [isSubmittingPractice, setIsSubmittingPractice] = useState(false);

  // 倒计时与音频
  const [timeRemaining, setTimeRemaining] = useState(getExamDuration(currentType) * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isPlayingRef = useRef<boolean>(false);

  const exams = ["IELTS", "TOEFL", "CET-4", "CET-6", "HSK", "BCT", "TOCFL"];

  // 更新 URL
  const updateState = useCallback((newType?: string, newMode?: string) => {
    const typeToSet = newType || currentType
    const modeToSet = newMode || mode
    if (newType) setCurrentType(newType)
    if (newMode) setMode(newMode)
    localStorage.setItem(STORAGE_KEYS.DRILL_EXAM_TYPE, JSON.stringify(typeToSet))
    localStorage.setItem(STORAGE_KEYS.DRILL_MODE, JSON.stringify(modeToSet))
    const params = new URLSearchParams(searchParams.toString())
    params.set("type", typeToSet)
    params.set("mode", modeToSet)
    window.history.replaceState(null, "", `/practice/drill?${params.toString()}`)
  }, [currentType, mode, searchParams])

  const handleSwitch = (newType: string) => updateState(newType);

  // --- 获取数据 ---
  useEffect(() => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    
    async function fetchExam() {
      try {
        // 【修复】检查 currentType 是否有效
        if (!currentType) {
          console.error('[Exam] currentType 为空，无法获取试卷');
          alert('考试类型未选择，请返回重新选择');
          setLoading(false);
          return;
        }

        // 【新增】消耗练习券 - VIP用户免练习券
        try {
          if (!authUser?.id) {
            console.error('[Exam] 用户未登录');
            alert('请先登录');
            router.push('/auth');
            return;
          }
          await consumePracticeTicket(1, authUser.id);
          console.log('[Exam] 练习券已消耗');
        } catch (error: any) {
          console.error('[Exam] 练习券不足:', error);
          alert('练习券不足，请先获取练习券');
          router.push('/profile');
          return;
        }

        setLoading(true);
        setUserAnswers({});
        setTimeRemaining(getExamDuration(currentType) * 60);
        setIsTimerRunning(false);
        setPlayingSection(null);
        setShowCompleteModal(false);

        // 【修复】检查 Supabase 客户端是否初始化
        if (!supabase) {
          console.error('[Exam] Supabase 客户端未初始化');
          alert('系统初始化失败，请刷新页面重试');
          setLoading(false);
          return;
        }

        console.log('[Exam] 开始获取试卷:', { currentType, examId, networkStatus: navigator.onLine ? 'online' : 'offline' });

        let data: any = null;

        // 【修复】如果提供了 examId，优先加载特定试卷
        if (examId) {
          console.log('[Exam] 通过 examId 加载特定试卷:', examId);
          const { data: specificExam, error: specificError } = await supabase
            .from("mock_exams")
            .select("*")
            .eq("id", examId)
            .single()

          if (specificError) {
            console.error('[Exam] 获取特定试卷失败:', specificError);
          } else if (specificExam) {
            data = specificExam;
            console.log('[Exam] 成功加载特定试卷:', data.id);
          }
        }

        // 如果没有提供 examId 或加载特定试卷失败，则按原来的逻辑获取
        if (!data) {
          const { data: allExams, error: fetchError } = await supabase
            .from("mock_exams")
            .select("*")
            .eq("exam_type", currentType)
            .order("created_at", { ascending: false })

          if (fetchError) {
            if (fetchError.name !== 'AbortError') {
              // 【修复】添加详细的错误日志
              console.error('[Exam] 获取失败详情:', {
                error: fetchError,
                message: fetchError.message,
                code: fetchError.code,
                details: fetchError.details,
                hint: fetchError.hint,
                currentType: currentType,
                networkStatus: navigator.onLine ? 'online' : 'offline'
              });
              
              // 用户友好的错误提示
              const errorMsg = fetchError.message || '未知错误';
              alert(`获取试卷失败: ${errorMsg}\n\n请检查:\n1. 网络连接是否正常\n2. 重新登录后再试`);
            }
            setLoading(false);
            return;
          }

          // 【修复】更严格的试卷有效性检查 - 确保 sections 包含有效的 questions
          const validExams = (allExams || []).filter((e: any) => {
            // 检查旧格式 questions
            if (e.questions && e.questions.length > 0) return true;
            
            // 检查新格式 sections - 需要至少一个 section 包含 questions
            if (e.sections && e.sections.length > 0) {
              const sections = typeof e.sections === "string" ? JSON.parse(e.sections) : e.sections;
              return sections.some((s: any) => s.questions && s.questions.length > 0);
            }
            return false;
          });

          if (validExams.length === 0) {
            console.error('[Exam] 没有找到有效的试卷数据');
            setExam(null);
            setLoading(false);
            return;
          }

          data = validExams[0];
        } 

        // 解析 Sections
        let sections: Section[] = [];
        if (data.sections) {
          try {
            sections = typeof data.sections === "string" ? JSON.parse(data.sections) : data.sections;
            // 【修复】确保 sections 是数组
            if (!Array.isArray(sections)) {
              console.error('[Exam] sections 不是数组:', sections);
              sections = [];
            }
          } catch (e) { 
            console.error("[Exam] sections 解析失败:", e); 
            sections = [];
          }
        }

        // 兼容旧格式
        if (sections.length === 0 && data.questions) {
          const oldQuestions = typeof data.questions === "string" ? JSON.parse(data.questions) : data.questions;
          sections = [{
            type: "reading",
            title: "阅读理解",
            content: data.rewritten_content || "",
            questions: oldQuestions.map((q: any, idx: number) => ({
              id: `q${idx}`,
              type: q.options ? "multiple_choice" : "fill_blank",
              stem: q.stem,
              content: q.content || q.stem,
              options: q.options,
              answer: q.correct_answer || q.answer,
              analysis: q.analysis || q.explanation,
              analysis_cn: q.analysis_cn || q.explanation_cn,
              analysis_en: q.analysis_en || q.explanation_en,
            })),
          }];
        }

        // 🔥🔥🔥 V8.0 数据清洗 & ID重铸 (防止ID冲突导致的白屏) 🔥🔥🔥
        // 【修复】过滤掉没有 questions 的 section，并确保数据格式正确
        sections = sections
          .filter((section: any) => {
            // 确保 section 是对象且有 questions 数组
            const hasQuestions = section && typeof section === 'object' && 
                                Array.isArray(section.questions) && 
                                section.questions.length > 0;
            if (!hasQuestions) {
              console.warn('[Exam] 跳过无效的 section:', section);
            }
            return hasQuestions;
          })
          .map((section: any, sIdx: number) => ({
            ...section,
            // 确保 type 存在
            type: section.type || 'reading', 
            title: section.title || '未命名部分',
            content: section.content ? String(section.content) : "", 
            questions: (section.questions || []).map((q: any, qIdx: number) => {
              // 确保 q 是对象
              if (!q || typeof q !== 'object') {
                console.warn('[Exam] 跳过无效的题目:', q);
                return null;
              }
              
              // 选项清洗
              let safeOptions: string[] = [];
              if (Array.isArray(q.options)) {
                safeOptions = q.options.map((opt: any) => {
                  if (opt === null || opt === undefined) return "";
                  if (typeof opt === 'object') return JSON.stringify(opt);
                  return String(opt);
                }).filter((s: string) => s !== "");
              }

              // 🔥 核心：ID重铸 - 使用 "s{index}-q{index}" 格式确保全局唯一
              // 这样即使 N8N 生成了重复的 ID (如 "v1"), 我们这里也会强制覆盖为唯一的 "s2-q3"
              const uniqueId = `s${sIdx}-q${qIdx}`;

              return {
                ...q,
                id: uniqueId, 
                
                content: q.content ? String(q.content) : (q.stem ? String(q.stem) : "题目内容缺失"),
                stem: q.stem ? String(q.stem) : "",
                answer: q.answer ? String(q.answer) : (q.correct_answer ? String(q.correct_answer) : ""),
                options: safeOptions,
                // 如果有选项，强制为选择题；否则为填空题
                type: q.type || (safeOptions.length > 0 ? "multiple_choice" : "fill_blank"),
                
                analysis: q.analysis || q.explanation || q.answer_analysis || '',
                analysis_cn: q.analysis_cn || q.explanation_cn || q.answer_analysis_cn || q.analysis_zh || '',
                analysis_en: q.analysis_en || q.explanation_en || q.answer_analysis_en || '',
              };
            }).filter((q: any) => q !== null), // 【修复】过滤掉无效的题目
          }));

        // 【修复】如果 sections 为空，显示错误
        if (sections.length === 0) {
          console.error('[Exam] 试卷没有有效的题目 sections');
          setExam(null);
          setLoading(false);
          return;
        }

        setExam({ id: data.id, exam_type: data.exam_type, sections });
        setIsTimerRunning(true);
        
        const hasListening = sections.some(s => s.type === 'listening');
        if (!hasListening) setActiveTab("written");

      } catch (err: any) {
        if (err.name !== 'AbortError') console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchExam();
  }, [currentType, examId]);

  // 倒计时
  useEffect(() => {
    if (isTimerRunning && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            if (!isPracticeMode) setShowCompleteModal(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isTimerRunning, timeRemaining, isPracticeMode]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // 播放逻辑
  const playListening = useCallback((sectionType: string, transcript: string) => {
    if (!window.speechSynthesis) return alert("浏览器不支持语音播放");
    if (!transcript) return alert("暂无听力内容");

    if (playingSection === sectionType && isPlayingRef.current) {
      window.speechSynthesis.cancel();
      isPlayingRef.current = false;
      setPlayingSection(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(transcript);
    utterance.lang = transcript.match(/[\u4e00-\u9fa5]/) ? 'zh-CN' : 'en-US';
    utterance.rate = 0.9;
    
    utterance.onend = () => {
      isPlayingRef.current = false;
      setPlayingSection(null);
    };

    isPlayingRef.current = true;
    setPlayingSection(sectionType);
    window.speechSynthesis.speak(utterance);
  }, [playingSection]);

  useEffect(() => () => window.speechSynthesis.cancel(), []);

  // 答题逻辑
  const updateAnswer = (sectionType: SectionType, questionId: string, value: string) => {
    const safeValue = value || "";
    setUserAnswers((prev) => ({
      ...prev,
      [sectionType]: { ...prev[sectionType], [questionId]: safeValue },
    }));
  };

  const getAnswer = (sectionType: SectionType, questionId: string) => 
    userAnswers[sectionType]?.[questionId] || "";

  const toggleAnalysis = (questionId: string) => {
    setExpandedAnalysis((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) newSet.delete(questionId);
      else newSet.add(questionId);
      return newSet;
    });
  };

  const getStats = () => {
    if (!exam) return { answered: 0, total: 0 };
    let answered = 0;
    let total = 0;
    exam.sections.forEach(sec => {
      total += sec.questions.length;
      const secAns = userAnswers[sec.type] || {};
      answered += Object.values(secAns).filter(a => a.trim()).length;
    });
    return { answered, total };
  };

  // --- 渲染单个题目 ---
  const renderQuestion = (question: Question, sectionType: SectionType, index: number) => {
    const userAnswer = getAnswer(sectionType, question.id);
    const isExpanded = expandedAnalysis.has(question.id);
    // 【修复】优先使用 content，如果没有则使用 stem
    const questionText = question.content || question.stem || '题目内容缺失'; 
    const analysisEn = question.analysis_en || question.analysis;
    const analysisCn = question.analysis_cn;
    const hasAnalysis = !!analysisEn || !!analysisCn;

    return (
      <Card key={question.id} className="p-5 rounded-xl border border-stone-200 bg-[#FDFBF7]/95 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#C23E32]/10 text-sm font-bold text-[#C23E32] border border-[#C23E32]/20">
            {index + 1}
          </span>
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs bg-stone-100 text-stone-600 border-stone-200">
                {QUESTION_TYPE_LABELS[question.type] || "未知题型"}
              </Badge>
              {isPracticeMode && (
                <Button variant="ghost" size="sm" onClick={() => toggleAnalysis(question.id)} className="text-[#C23E32] hover:text-[#A8352B] hover:bg-[#C23E32]/10 px-2 py-1 h-auto text-xs font-medium">
                  {isExpanded ? "收起解析" : "查看解析"}
                </Button>
              )}
            </div>
            
            <h3 className="font-medium text-ink-black text-lg leading-relaxed">{questionText}</h3>

            {/* 🔥🔥🔥 V8.0 核心：完全使用原生 HTML 标签，移除 RadioGroup 组件 🔥🔥🔥 */}
            {question.type === "fill_blank" ? (
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => updateAnswer(sectionType, question.id, e.target.value)}
                placeholder="请输入答案..."
                className="flex h-10 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C23E32] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 mt-2 max-w-sm"
              />
            ) : (
              <div className="space-y-3 mt-2">
                {question.options?.map((opt, i) => {
                  const safeOpt = String(opt); 
                  const isSelected = userAnswer === safeOpt;
                  
                  return (
                    <div 
                      key={i} 
                      className={cn(
                        "flex items-center w-full p-4 rounded-lg border cursor-pointer transition-all relative select-none",
                        isSelected 
                          ? "border-[#C23E32] bg-[#C23E32]/5 ring-1 ring-[#C23E32]" 
                          : "border-stone-200 hover:bg-stone-50"
                      )}
                      onClick={() => updateAnswer(sectionType, question.id, safeOpt)}
                    >
                      {/* 隐藏的原生 Radio Input，用于语义和辅助功能 */}
                      <input 
                        type="radio"
                        name={`q-${question.id}`}
                        value={safeOpt}
                        checked={isSelected}
                        onChange={() => {}} // 这里的 onChange 交给 div 的 onClick 处理，避免双重触发
                        className="sr-only"
                      />
                      
                      {/* 自定义 Radio 外观 */}
                      <div className={cn(
                        "mr-3 h-5 w-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors",
                        isSelected ? "border-[#C23E32] bg-[#C23E32]" : "border-stone-300"
                      )}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      
                      <span className="text-base text-stone-700">{safeOpt}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {isPracticeMode && isExpanded && (
              <div className="mt-4 p-4 bg-[#FDFBF7] rounded-lg border border-[#C23E32]/20 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                    <span className="text-sm font-bold text-stone-700">正确答案：</span>
                    <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">{question.answer}</span>
                  </div>
                  <div className="space-y-3">
                    {analysisEn && <div><span className="text-xs font-bold text-[#C23E32] uppercase tracking-wider block mb-1">Explanation</span><p className="text-sm text-stone-600 leading-relaxed italic">{analysisEn}</p></div>}
                    {analysisCn && <div><span className="text-xs font-bold text-[#C23E32] uppercase tracking-wider block mb-1">解析</span><p className="text-sm text-stone-800 leading-relaxed">{analysisCn}</p></div>}
                    {!hasAnalysis && <p className="text-sm text-stone-400 italic">暂无解析详情</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  // --- 渲染听力 ---
  const renderListeningTab = () => {
    const section = exam?.sections.find(s => s.type === 'listening');
    if (!section) return <div className="text-center py-20 text-stone-400">本试卷无听力部分</div>;
    const isPlaying = playingSection === 'listening';
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in">
        <Card className="p-8 text-center bg-gradient-to-br from-[#FDFBF7] to-stone-100 border border-stone-200 shadow-md">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#C23E32]/10 flex items-center justify-center">
              <Volume2 className="w-8 h-8 text-[#C23E32]" />
            </div>
            <h3 className="text-xl font-bold text-ink-black font-serif">听力理解</h3>
            <p className="text-stone-500">点击播放按钮听录音，然后回答问题</p>
            <Button onClick={() => playListening('listening', section.transcript || "")} disabled={!section.transcript} size="lg" className={cn("gap-2", isPlaying ? "bg-red-500" : "bg-[#C23E32]")}>
              {isPlaying ? <><Pause className="w-4 h-4" /> 停止</> : <><Play className="w-4 h-4" /> 播放</>}
            </Button>
          </div>
        </Card>
        <div className="space-y-4">
          {section.questions.map((q, i) => renderQuestion(q, 'listening', i))}
        </div>
      </div>
    );
  };

  // --- 渲染笔试 (阅读+词汇) ---
  const renderWrittenTab = () => {
    const readingSec = exam?.sections.find(s => s.type === 'reading');
    const vocabSec = exam?.sections.find(s => s.type === 'vocabulary');
    
    const content = (readingSec?.content || vocabSec?.content) ? String(readingSec?.content || vocabSec?.content) : "";

    return (
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] overflow-hidden animate-in fade-in">
        {/* 左侧：文章 */}
        <div className="lg:w-1/2 h-full bg-[#FDFBF7] rounded-xl border border-stone-200 shadow-sm flex flex-col">
          <div className="p-4 border-b border-stone-100 bg-white/50 backdrop-blur rounded-t-xl flex items-center gap-2 sticky top-0 z-10">
            <BookOpen className="w-5 h-5 text-[#C23E32]" />
            <span className="font-bold text-stone-700 font-serif">阅读文章 / Reading Passage</span>
          </div>
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <div className="prose prose-stone max-w-none prose-p:text-stone-700 prose-p:leading-loose prose-p:text-lg prose-p:font-serif prose-headings:font-serif">
              {content ? (
                content.split('\n').map((p, i) => p.trim() && <p key={i} className="mb-4 text-justify">{p}</p>)
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-stone-400">
                  <FileText className="w-10 h-10 mb-2 opacity-20" />
                  <p>文章内容加载中或暂无...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右侧：题目 */}
        <div className="lg:w-1/2 h-full overflow-y-auto custom-scrollbar pr-2 space-y-8 pb-20">
          {readingSec && readingSec.questions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                <span className="bg-[#C23E32] w-1 h-5 rounded-full"></span>
                <h3 className="font-bold text-lg text-stone-800">Reading Questions</h3>
                <Badge variant="outline" className="ml-auto text-stone-500">{readingSec.questions.length} 题</Badge>
              </div>
              {readingSec.questions.map((q, i) => renderQuestion(q, 'reading', i))}
            </div>
          )}
          {vocabSec && vocabSec.questions.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                <span className="bg-blue-600 w-1 h-5 rounded-full"></span>
                <h3 className="font-bold text-lg text-stone-800">Vocabulary Questions</h3>
                <Badge variant="outline" className="ml-auto text-stone-500">{vocabSec.questions.length} 题</Badge>
              </div>
              {vocabSec.questions.map((q, i) => renderQuestion(q, 'vocabulary', i))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleNextExam = async () => {
    setIsSubmittingPractice(true);
    
    // 【修复】使用 React 状态管理，不使用 window.location.reload()
    // 重置所有答题状态
    setUserAnswers({});
    setExpandedAnalysis(new Set());
    setPlayingSection(null);
    setShowCompleteModal(false);
    setActiveTab("listening");
    
    // 重新获取试卷数据
    try {
      // 取消之前的请求
      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();
      
      // 消耗练习券
      if (authUser?.id) {
        await consumePracticeTicket(1, authUser.id);
      }
      
      // 重新获取试卷
      const { data: allExams, error: fetchError } = await supabase
        .from("mock_exams")
        .select("*")
        .eq("exam_type", currentType)
        .order("created_at", { ascending: false })
        .abortSignal(abortControllerRef.current!.signal);

      if (fetchError) {
        console.error('[Exam] 获取试卷失败:', fetchError);
        alert('获取试卷失败，请重试');
        return;
      }

      // 【修复】过滤掉当前试卷，避免重复
      const availableExams = allExams?.filter(e => e.id !== exam?.id) || allExams;
      
      // 随机选择一套试卷
      const examsToChoose = availableExams?.length > 0 ? availableExams : allExams;
      if (examsToChoose && examsToChoose.length > 0) {
        const randomIndex = Math.floor(Math.random() * examsToChoose.length);
        const selectedExam = examsToChoose[randomIndex];
        
        // 【关键修复】解析试卷数据，包括嵌套的 questions
        let sections: Section[] = [];
        if (selectedExam.sections) {
          try {
            const parsedSections = typeof selectedExam.sections === 'string' 
              ? JSON.parse(selectedExam.sections) 
              : selectedExam.sections;
            
            // 【关键修复】递归解析每个 section 的 questions
            sections = parsedSections.map((section: any) => {
              let questions: Question[] = [];
              if (section.questions) {
                try {
                  questions = typeof section.questions === 'string'
                    ? JSON.parse(section.questions)
                    : section.questions;
                  
                  // 【关键修复】确保每个 question 的 options 也被解析
                  questions = questions.map((q: any) => ({
                    ...q,
                    options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
                    // 确保 type 字段存在
                    type: q.type || 'multiple_choice'
                  }));
                } catch (e) {
                  console.error('[Exam] 解析 questions 失败:', e);
                }
              }
              
              return {
                ...section,
                questions: questions || []
              };
            });
          } catch (e) {
            console.error('[Exam] 解析试卷 sections 失败:', e);
          }
        }
        
        // 更新试卷状态
        setExam({
          id: selectedExam.id,
          exam_type: selectedExam.exam_type,
          sections: sections,
          created_at: selectedExam.created_at
        });
        
        // 重置计时器
        setTimeRemaining(getExamDuration(currentType) * 60);
        setIsTimerRunning(false);
        
        console.log('[Exam] 已加载新试卷:', selectedExam.id, 'sections:', sections.length);
      } else {
        alert('暂无可用试卷');
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('[Exam] 加载新试卷失败:', error);
        alert('加载试卷失败，请重试');
      }
    } finally {
      setIsSubmittingPractice(false);
      setLoading(false);
    }
  };

  if (loading) return (
    <>
      <div className="fixed inset-0 z-0 bg-[#F5F5F4] bg-ink-paper" />
      <div className="relative z-10 flex h-screen items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 text-[#C23E32] animate-spin mb-4" />
          <p className="text-stone-500 font-serif">正在准备试卷...</p>
        </div>
      </div>
    </>
  );

  if (!exam) return (
    <>
      <div className="fixed inset-0 z-0 bg-[#F5F5F4] bg-ink-paper" />
      <div className="relative z-10 flex h-screen flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center bg-white border-stone-200 shadow-xl">
          <FileText className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2 font-serif">暂无试卷数据</h2>
          <p className="text-stone-500 mb-6">数据库中未找到试卷，请返回重试</p>
          <Button onClick={() => router.push('/practice')} variant="outline">返回大厅</Button>
        </Card>
      </div>
    </>
  );

  const { answered, total } = getStats();
  const progressPercent = total > 0 ? (answered / total) * 100 : 0;
  const isTimeWarning = timeRemaining < 300;

  return (
    <>
      {/* 山水画背景 */}
      <div className="fixed inset-0 z-0 bg-[#F5F5F4] bg-ink-paper ink-landscape-bg" />

      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-stone-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* 左侧：返回和类型选择 */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild className="text-stone-600 hover:text-stone-900 hover:bg-stone-100">
                <Link href={`/practice?type=${currentType}`}>
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  {isPracticeMode ? "退出练习" : "退出考试"}
                </Link>
              </Button>
              <div className="h-5 w-px bg-stone-200" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-colors">
                    <h1 className="text-base font-bold text-ink-black flex items-center gap-2 font-serif">
                      <FileText className="w-4 h-4 text-[#C23E32]" />
                      {currentType}
                    </h1>
                    <ChevronDown className="w-4 h-4 text-stone-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40 bg-[#FDFBF7] border-stone-200">
                  {exams.map((type) => (
                    <DropdownMenuItem
                      key={type}
                      onClick={() => handleSwitch(type)}
                      className="cursor-pointer flex justify-between text-sm font-medium text-stone-700 hover:bg-stone-100"
                    >
                      {type}
                      {currentType === type && <Check className="w-4 h-4 text-[#C23E32]" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* 中间：倒计时 */}
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold font-serif",
              isPracticeMode 
                ? "bg-green-50 text-green-700 border border-green-200" 
                : (isTimeWarning 
                  ? "bg-red-50 text-red-700 border border-red-200 animate-pulse" 
                  : "bg-stone-100 text-stone-700 border border-stone-200")
            )}>
              <Clock className="w-5 h-5" />
              {isPracticeMode ? "练习模式" : formatTime(timeRemaining)}
              {!isPracticeMode && isTimeWarning && <AlertCircle className="w-5 h-5" />}
            </div>

            {/* 右侧：进度 */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs text-stone-500">答题进度</div>
                <div className="text-sm font-medium text-ink-black">
                  {answered}/{total}
                </div>
              </div>
              <div className="w-20 hidden sm:block">
                <Progress value={progressPercent} className="h-2 bg-stone-200" indicatorClassName="bg-[#C23E32]" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as string)} className="space-y-6">
          <div className="flex justify-center">
            <TabsList className="bg-stone-100 p-1 rounded-full">
              <TabsTrigger value="listening" className="rounded-full px-6 py-2 data-[state=active]:bg-[#C23E32] data-[state=active]:text-white transition-all">
                <Headphones className="w-4 h-4 mr-2" /> 听力部分
              </TabsTrigger>
              <TabsTrigger value="written" className="rounded-full px-6 py-2 data-[state=active]:bg-[#C23E32] data-[state=active]:text-white transition-all">
                <BookOpen className="w-4 h-4 mr-2" /> 笔试部分 (阅读+词汇)
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="listening" className="flex-1 outline-none">
            {renderListeningTab()}
          </TabsContent>
          
          <TabsContent value="written" className="flex-1 outline-none h-full">
            {renderWrittenTab()}
          </TabsContent>
        </Tabs>
      </main>

      {/* 底部提交栏 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#FDFBF7]/95 backdrop-blur-lg border-t border-stone-200 shadow-lg z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="hidden sm:flex items-center gap-4 text-sm text-stone-600">
            <span>已答: <strong className="text-ink-black">{answered}</strong>/{total}</span>
          </div>
          <div className="flex-1 sm:flex-none flex justify-end">
            <Button onClick={() => setShowCompleteModal(true)} size="lg" className="w-full sm:w-auto bg-[#C23E32] hover:bg-[#A8352B] text-white text-lg px-8 shadow-lg shadow-red-200 font-medium">
              {isPracticeMode ? "完成练习" : "提交试卷"}
            </Button>
          </div>
        </div>
      </div>

      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <Card className="w-full max-w-md bg-white border-stone-200 shadow-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-[#C23E32]"></div>
            <div className="text-center mb-8 pt-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-ink-black font-serif mb-2">练习完成!</h2>
              <p className="text-stone-500">你已完成本套 {currentType} 试卷</p>
              <div className="mt-4 flex justify-center gap-8 text-sm">
                <div><div className="font-bold text-2xl text-ink-black">{answered}</div><div className="text-stone-400">已答题目</div></div>
                <div><div className="font-bold text-2xl text-green-600">{Math.round((answered/total)*100) || 0}%</div><div className="text-stone-400">完成度</div></div>
              </div>
            </div>
            <div className="space-y-3">
              <Button onClick={handleNextExam} className="w-full h-12 text-base font-bold bg-[#C23E32] hover:bg-[#A8352B]">继续下一套 <ArrowRight className="ml-2 w-4 h-4" /></Button>
              <Button onClick={() => router.push('/practice')} variant="outline" className="w-full h-12 text-base font-bold border-stone-200 hover:bg-stone-50">返回备考中心 <Home className="ml-2 w-4 h-4" /></Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}