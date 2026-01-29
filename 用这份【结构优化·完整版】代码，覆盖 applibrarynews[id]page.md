```
"use client";

import { useEffect, useState } from "react";
// ✅ 强哥修正：使用你项目中真实存在的 Supabase 实例，防止报错回滚
import { supabase } from "@/lib/supabase"; 
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// 定义数据接口
interface MockExam {
  id: string;
  title_en: string;
  rewritten_content: string; 
  questions: any[];          
  exam_type: string;
}

export default function MockExamPage() {
  const [exam, setExam] = useState<MockExam | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  
  // 获取 URL 里的 type 参数，默认为 IELTS
  const targetType = searchParams.get('type') || 'IELTS'; 

  useEffect(() => {
    async function fetchExam() {
      try {
        setLoading(true);
        console.log("Fetching exam for type:", targetType);

        // 获取最新的一条数据
        const { data, error } = await supabase
          .from("mock_exams")
          .select("*")
          .eq("exam_type", targetType)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error("Supabase Error:", error);
          setExam(null);
        } else {
          console.log("Fetched Data:", data);
          setExam(data);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchExam();
  }, [targetType]);

  // 1. 加载状态
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-2 text-slate-600 font-medium">正在提取试卷...</p>
      </div>
    );
  }

  // 2. 空状态
  if (!exam) {
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-4 bg-slate-50">
        <div className="rounded-full bg-slate-200 p-4">
          <Loader2 className="h-8 w-8 text-slate-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">暂无 {targetType} 试卷</h2>
        <p className="text-slate-500">AI 工厂正在后台生成中，请稍等几分钟再刷新...</p>
        <Button asChild variant="outline">
          <Link href="/practice">返回大厅</Link>
        </Button>
      </div>
    );
  }

  // 3. 正常渲染 (绝对纯文本，严禁 input)
  return (
    <div className="min-h-screen bg-slate-100 p-4 lg:p-8">
      {/* 顶部导航 */}
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" asChild className="hover:bg-white/50">
          <Link href="/practice" className="flex items-center text-slate-600">
            <ArrowLeft className="mr-2 h-4 w-4" /> 返回备考中心
          </Link>
        </Button>
        <div className="flex items-center gap-2">
           <span className="rounded-md bg-blue-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
            {exam.exam_type} 模式
          </span>
          <span className="text-xs text-slate-400">ID: {exam.id.slice(0,8)}</span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 lg:h-[calc(100vh-140px)]">
        
        {/* === 左侧：文章阅读区 === */}
        <Card className="flex flex-col overflow-hidden bg-white shadow-lg border-0 ring-1 ring-slate-900/5">
          <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-slate-200">
            <h1 className="mb-8 text-3xl font-extrabold text-slate-900 leading-tight tracking-tight">
              {exam.title_en}
            </h1>
            
            <div className="prose prose-lg prose-slate max-w-none">
              {/* --- 核心修复：直接渲染文字，不搞 input --- */}
              {exam.rewritten_content && exam.rewritten_content.split('\n').map((paragraph, idx) => {
                const text = paragraph.trim();
                if (!text) return null;
                return (
                  // 这里用的是 p 标签，绝对不能是 input
                  <p key={idx} className="mb-6 text-lg leading-relaxed text-slate-700 font-serif">
                    {text}
                  </p>
                );
              })}
            </div>
          </div>
        </Card>

        {/* === 右侧：答题区 === */}
        <Card className="flex flex-col overflow-hidden bg-white shadow-lg border-0 ring-1 ring-slate-900/5">
          <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded bg-slate-800 text-white text-xs">Q</span>
                Questions
              </h2>
              <span className="text-sm font-medium text-slate-500">
                共 {exam.questions?.length || 0} 题
              </span>
            </div>

            <div className="space-y-6">
              {exam.questions?.map((q: any, index: number) => (
                <div key={index} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <h3 className="mb-4 font-semibold text-slate-900 text-base leading-snug">
                    <span className="mr-2 text-blue-600">{index + 1}.</span>
                    {q.stem}
                  </h3>
                  
                  {q.options && q.options.length > 0 ? (
                    <RadioGroup className="space-y-3">
                      {q.options.map((opt: string, i: number) => (
                        <div key={i} className="flex items-start space-x-3 rounded-lg border border-transparent p-2 hover:bg-slate-50 hover:border-slate-100 transition-colors">
                          <RadioGroupItem value={opt} id={`q${index}-opt${i}`} className="mt-1" />
                          <Label htmlFor={`q${index}-opt${i}`} className="text-slate-600 cursor-pointer text-sm leading-relaxed font-normal">
                            {opt}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <div className="rounded-md bg-slate-100 p-4 text-sm text-slate-500 italic text-center border border-dashed border-slate-300">
                      (此处为填空题，请在心中作答)
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
```

