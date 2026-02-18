/**
 * @file page.tsx
 * @description 考试成绩报告页
 * @author InkWords Team
 * @date 2026-02-01
 */

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  ArrowLeft,
  Trophy,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BookOpen,
  Headphones,
  Type,
  Sparkles,
  ChevronRight,
  RotateCcw,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 错题记录
 */
interface WrongAnswer {
  questionId: string;
  stem: string;
  userAnswer: string;
  correctAnswer: string;
  analysis: string;
}

/**
 * Section 成绩详情
 */
interface SectionResult {
  type: string;
  title: string;
  score: number;
  maxScore: number;
  correctCount: number;
  totalQuestions: number;
  wrongAnswers: WrongAnswer[];
}

/**
 * AI 评分结果
 */
interface AIGrading {
  score: number;
  feedback: string;
  grammarIssues?: string[];
  vocabularySuggestions?: string[];
}

/**
 * 考试结果详情
 */
interface ExamResultDetails {
  sections: SectionResult[];
  aiGrading?: AIGrading;
}

/**
 * 考试结果
 */
interface ExamResult {
  id: string;
  examType: string;
  score: number;
  maxScore: number;
  details: ExamResultDetails;
  aiFeedback: string | null;
  createdAt: string;
}

/**
 * Section 图标映射
 */
const SECTION_ICONS: Record<string, React.ReactNode> = {
  listening: <Headphones className="w-5 h-5" />,
  reading: <BookOpen className="w-5 h-5" />,
  vocabulary: <Type className="w-5 h-5" />,
  writing: <Sparkles className="w-5 h-5" />,
};

/**
 * Section 标题映射
 */
const SECTION_TITLES: Record<string, string> = {
  listening: "听力理解",
  reading: "阅读理解",
  vocabulary: "词汇运用",
  writing: "写作表达",
};

/**
 * 获取分数等级
 */
const getScoreLevel = (score: number): { label: string; color: string } => {
  if (score >= 90) return { label: "优秀", color: "text-green-600" };
  if (score >= 80) return { label: "良好", color: "text-blue-600" };
  if (score >= 70) return { label: "中等", color: "text-yellow-600" };
  if (score >= 60) return { label: "及格", color: "text-orange-600" };
  return { label: "需努力", color: "text-red-600" };
};

/**
 * 成绩报告页组件
 */
export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const resultId = params.id as string;

  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 获取考试结果
   */
  useEffect(() => {
    async function fetchResult() {
      try {
        setLoading(true);
        
        // 从后端获取结果
        const response = await fetch(`/api/practice/result/${resultId}`);
        
        if (!response.ok) {
          throw new Error("获取成绩失败");
        }
        
        const data = await response.json();
        setResult(data);
      } catch (err) {
        console.error("获取成绩失败:", err);
        setError("无法加载成绩报告");
      } finally {
        setLoading(false);
      }
    }

    if (resultId) {
      fetchResult();
    }
  }, [resultId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-amber-600 mx-auto mb-4" />
          <p className="text-slate-600">正在加载成绩报告...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">加载失败</h2>
          <p className="text-slate-500 mb-6">{error || "成绩报告不存在"}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => router.push("/practice")}>
              <Home className="w-4 h-4 mr-2" />
              返回大厅
            </Button>
            <Button onClick={() => window.location.reload()}>
              <RotateCcw className="w-4 h-4 mr-2" />
              重试
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const scoreLevel = getScoreLevel(result.score);
  const totalCorrect = result.details.sections.reduce(
    (sum, s) => sum + s.correctCount,
    0
  );
  const totalQuestions = result.details.sections.reduce(
    (sum, s) => sum + s.totalQuestions,
    0
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* 顶部导航 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/practice")}
              className="text-slate-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回大厅
            </Button>
            <h1 className="text-lg font-bold text-slate-800">成绩报告</h1>
            <div className="w-20" /> {/* 占位保持居中 */}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* 总分卡片 */}
        <Card className="p-8 text-center bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-medium text-slate-700">
                {result.examType} 考试成绩
              </span>
            </div>

            <div className="flex items-center justify-center gap-4">
              <div className="text-7xl font-bold text-slate-800">
                {result.score}
              </div>
              <div className="text-left">
                <div className="text-2xl text-slate-400">/ {result.maxScore}</div>
                <div className={cn("text-lg font-bold", scoreLevel.color)}>
                  {scoreLevel.label}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>答对 {totalCorrect} 题</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                <span>答错 {totalQuestions - totalCorrect} 题</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>
                  {new Date(result.createdAt).toLocaleString("zh-CN", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* AI 评语 */}
        {result.aiFeedback && (
          <Card className="p-6 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 mb-2">AI 老师评语</h3>
                <div className="text-slate-700 leading-relaxed whitespace-pre-line">
                  {result.aiFeedback}
                </div>
                {result.details.aiGrading && (
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-sm text-slate-500">AI 评分：</span>
                    <Badge variant="secondary" className="text-blue-700 bg-blue-100">
                      {result.details.aiGrading.score}/10 分
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* 各部分成绩 */}
        <Card className="p-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-600" />
            各部分得分
          </h3>
          <div className="space-y-4">
            {result.details.sections.map((section, idx) => {
              const percentage = (section.score / section.maxScore) * 100;
              return (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {SECTION_ICONS[section.type] || <BookOpen className="w-5 h-5" />}
                      <span className="font-medium text-slate-700">
                        {section.title || SECTION_TITLES[section.type] || section.type}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-800">
                        {section.score}/{section.maxScore}
                      </span>
                      <span className="text-sm text-slate-500 ml-2">
                        ({Math.round(percentage)}%)
                      </span>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <div className="text-sm text-slate-500">
                    答对 {section.correctCount}/{section.totalQuestions} 题
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* 错题解析 */}
        <Tabs defaultValue={result.details.sections[0]?.type} className="space-y-4">
          <TabsList className="grid" style={{ gridTemplateColumns: `repeat(${result.details.sections.length}, 1fr)` }}>
            {result.details.sections.map((section) => (
              <TabsTrigger key={section.type} value={section.type} className="flex items-center gap-2">
                {SECTION_ICONS[section.type]}
                <span className="hidden sm:inline">{section.title || SECTION_TITLES[section.type]}</span>
                {section.wrongAnswers.length > 0 && (
                  <Badge variant="destructive" className="text-xs ml-1">
                    {section.wrongAnswers.length}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {result.details.sections.map((section) => (
            <TabsContent key={section.type} value={section.type}>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800">
                    {section.title || SECTION_TITLES[section.type]} - 错题解析
                  </h3>
                  <Badge variant={section.wrongAnswers.length === 0 ? "default" : "secondary"}>
                    {section.wrongAnswers.length === 0
                      ? "全部正确"
                      : `${section.wrongAnswers.length} 道错题`}
                  </Badge>
                </div>

                {section.wrongAnswers.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-slate-600">恭喜你，这部分全部答对了！</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {section.wrongAnswers.map((wrong, idx) => (
                      <div
                        key={wrong.questionId}
                        className="p-4 rounded-lg border border-red-200 bg-red-50"
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-600">
                            {idx + 1}
                          </span>
                          <div className="flex-1 space-y-2">
                            <p className="font-medium text-slate-800">
                              {wrong.stem}
                            </p>
                            <div className="grid gap-2 text-sm">
                              <div className="flex items-center gap-2">
                                <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                                <span className="text-slate-600">
                                  你的答案：
                                  <span className="text-red-600 font-medium">
                                    {wrong.userAnswer}
                                  </span>
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                <span className="text-slate-600">
                                  正确答案：
                                  <span className="text-green-600 font-medium">
                                    {wrong.correctAnswer}
                                  </span>
                                </span>
                              </div>
                            </div>
                            {wrong.analysis && (
                              <div className="mt-2 p-3 bg-white rounded border border-slate-200">
                                <p className="text-sm text-slate-600">
                                  <span className="font-medium">解析：</span>
                                  {wrong.analysis}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* 操作按钮 */}
        <div className="flex gap-4 justify-center pt-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push("/practice")}
            className="px-8"
          >
            <Home className="w-5 h-5 mr-2" />
            返回练习大厅
          </Button>
          <Button
            size="lg"
            onClick={() => router.push(`/practice/drill?type=${result.examType}`)}
            className="px-8 bg-amber-600 hover:bg-amber-700"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            刷下一套
          </Button>
        </div>
      </main>
    </div>
  );
}
