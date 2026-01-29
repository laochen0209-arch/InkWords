"use client";

/**
 * @file MockContent.tsx
 * @description 模拟考试内容组件 - 包含所有客户端逻辑
 * @author InkWords Team
 * @date 2026-01-29
 */

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
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

interface MockExam {
  id: string;
  title_en: string;
  rewritten_content: string;
  questions: any[];
  exam_type: string;
}

/**
 * 模拟考试内容组件
 * @returns JSX.Element
 */
export default function MockContent() {
  const [exam, setExam] = useState<MockExam | null>(null);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentType = searchParams.get("type") || "IELTS";

  const exams = ["IELTS", "TOEFL", "CET-4", "CET-6", "HSK", "BCT", "TOCFL"];

  /**
   * 切换考试类型
   * @param newType - 新的考试类型
   */
  const handleSwitch = (newType: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("type", newType);
    console.log("Switching to:", newType);
    router.push(`${pathname}?${params.toString()}`);
  };

  /**
   * 获取考试数据
   */
  async function fetchExam() {
    try {
      setLoading(true);
      setIsSubmitted(false);
      setUserAnswers({});
      setScore(0);

      const { count } = await supabase
        .from("mock_exams")
        .select("*", { count: 'exact', head: true })
        .eq("exam_type", currentType);
      if (!count) {
        setExam(null);
        setLoading(false);
        return;
      }
      const randomOffset = Math.floor(Math.random() * count);
      const { data, error } = await supabase
        .from("mock_exams")
        .select("*")
        .eq("exam_type", currentType)
        .range(randomOffset, randomOffset)
        .single();
      if (error) throw error;
      setExam(data);
    } catch (err) {
      console.error("Error:", err);
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

  if (loading) return (
    <div 
      className="flex h-screen items-center justify-center"
      style={{ backgroundImage: "url('/bg3.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <p className="ml-2 text-slate-600 font-medium">正在加载试卷...</p>
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
            {exam?.questions?.length || 0} Qs
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
          {exam.questions.map((q: any, index: number) => {
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
          })}
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
