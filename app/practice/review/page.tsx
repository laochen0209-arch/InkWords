"use client";

/**
 * @file page.tsx
 * @description 错题本页面 - 展示用户做错的题目
 * @author InkWords Team
 * @date 2026-02-01
 */

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Trash2, BookOpen, Headphones, Type, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// 错题记录接口
interface MistakeRecord {
  id: string;
  user_id: string;
  exam_type: string;
  section_type: string;
  question_content: {
    id: string;
    type: string;
    stem: string;
    options?: string[];
    answer: string;
    analysis: string;
  };
  user_answer: string;
  correct_answer: string;
  analysis: string | null;
  created_at: string;
}

// Section 图标
const SECTION_ICONS: Record<string, React.ReactNode> = {
  listening: <Headphones className="w-4 h-4" />,
  reading: <BookOpen className="w-4 h-4" />,
  vocabulary: <Type className="w-4 h-4" />,
};

// Section 标题
const SECTION_TITLES: Record<string, string> = {
  listening: "听力理解",
  reading: "阅读理解",
  vocabulary: "词汇运用",
};

// 题目类型标签
const QUESTION_TYPE_LABELS: Record<string, string> = {
  multiple_choice: "选择题",
  true_false: "判断题",
  fill_blank: "填空题",
};

export default function ReviewPage() {
  const router = useRouter();
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // 【关键】获取当前登录用户并加载错题
  useEffect(() => {
    async function fetchUserAndMistakes() {
      try {
        setLoading(true);

        // 【关键】从 Supabase Auth 获取当前用户
        const { data: { session } } = await supabase.auth.getSession();
        const currentUserId = session?.user?.id;

        if (!currentUserId) {
          console.log('[错题本] 用户未登录，重定向到登录页');
          router.push('/auth');
          return;
        }

        setUserId(currentUserId);
        console.log('[错题本] 当前用户:', currentUserId);

        // 获取错题列表
        const { data, error } = await supabase
          .from('mistake_books')
          .select('*')
          .eq('user_id', currentUserId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('[错题本] 获取数据失败:', error);
          return;
        }

        console.log('[错题本] 获取到', data?.length || 0, '道错题');
        setMistakes(data || []);
      } catch (err) {
        console.error('[错题本] 错误:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchUserAndMistakes();
  }, [router]);

  // 删除错题
  const handleDelete = async (id: string) => {
    if (!userId) return;

    try {
      setDeleting(id);
      const { error } = await supabase
        .from('mistake_books')
        .delete()
        .eq('id', id)
        .eq('user_id', userId); // 【关键】确保只能删除自己的错题

      if (error) {
        console.error('[错题本] 删除失败:', error);
        alert('删除失败，请重试');
        return;
      }

      // 从列表中移除
      setMistakes(prev => prev.filter(m => m.id !== id));
      console.log('[错题本] 删除成功:', id);
    } catch (err) {
      console.error('[错题本] 删除错误:', err);
      alert('删除失败，请重试');
    } finally {
      setDeleting(null);
    }
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 未登录状态（加载中）
  if (loading && !userId) {
    return (
      <>
        <div className="fixed inset-0 z-0 bg-ink-paper ink-landscape-bg" />
        <main className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#C23E32]" />
            <p className="text-stone-600">加载中...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      {/* 山水画背景 */}
      <div className="fixed inset-0 z-0 bg-ink-paper ink-landscape-bg" />

      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-stone-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild className="text-stone-600 hover:text-stone-900 hover:bg-stone-100">
                <Link href="/practice">
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  返回
                </Link>
              </Button>
              <div className="h-5 w-px bg-stone-200" />
              <h1 className="text-xl font-bold text-ink-black font-serif">错题本</h1>
            </div>
            <div className="text-sm text-stone-500">
              共 <span className="font-bold text-[#C23E32]">{mistakes.length}</span> 道错题
            </div>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 py-6 pb-24">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-[#C23E32]" />
            <p className="mt-4 text-stone-600">加载中...</p>
          </div>
        ) : mistakes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center mb-4">
              <BookOpen className="w-10 h-10 text-stone-400" />
            </div>
            <h2 className="text-xl font-bold text-ink-black font-serif mb-2">暂无错题</h2>
            <p className="text-stone-500 mb-6">太棒了！你还没有做错任何题目</p>
            <Button asChild className="bg-[#C23E32] hover:bg-[#A8352B] text-white">
              <Link href="/practice">去练习</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {mistakes.map((mistake) => (
              <Card key={mistake.id} className="p-6 bg-[#FDFBF7]/95 border border-stone-200 shadow-sm">
                {/* 头部信息 */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-[#C23E32]/10 text-[#C23E32] border-[#C23E32]/20">
                      {mistake.exam_type}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-stone-600">
                      {SECTION_ICONS[mistake.section_type]}
                      <span>{SECTION_TITLES[mistake.section_type]}</span>
                    </div>
                    <Badge variant="outline" className="text-xs border-stone-300 text-stone-500">
                      {QUESTION_TYPE_LABELS[mistake.question_content.type] || mistake.question_content.type}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(mistake.id)}
                    disabled={deleting === mistake.id}
                    className="text-stone-400 hover:text-red-600 hover:bg-red-50"
                  >
                    {deleting === mistake.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {/* 题目内容 */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-ink-black text-lg leading-relaxed">
                      {mistake.question_content.stem}
                    </h3>
                  </div>

                  {/* 选项（如果有） */}
                  {mistake.question_content.options && mistake.question_content.options.length > 0 && (
                    <div className="space-y-2 pl-4">
                      {mistake.question_content.options.map((opt, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg border ${
                            opt === mistake.correct_answer
                              ? 'border-green-500 bg-green-50'
                              : opt === mistake.user_answer
                              ? 'border-red-500 bg-red-50'
                              : 'border-stone-200 bg-white'
                          }`}
                        >
                          <span className="text-sm text-stone-700">{opt}</span>
                          {opt === mistake.correct_answer && (
                            <span className="ml-2 text-xs font-medium text-green-600">✓ 正确答案</span>
                          )}
                          {opt === mistake.user_answer && opt !== mistake.correct_answer && (
                            <span className="ml-2 text-xs font-medium text-red-600">✗ 你的答案</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 填空题显示 */}
                  {mistake.question_content.type === 'fill_blank' && (
                    <div className="space-y-3 pl-4">
                      <div className="flex items-center gap-2 p-3 rounded-lg border border-red-200 bg-red-50">
                        <span className="text-sm text-stone-600">你的答案：</span>
                        <span className="font-medium text-red-600">{mistake.user_answer || '(未作答)'}</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg border border-green-200 bg-green-50">
                        <span className="text-sm text-stone-600">正确答案：</span>
                        <span className="font-medium text-green-600">{mistake.correct_answer}</span>
                      </div>
                    </div>
                  )}

                  {/* 解析 */}
                  {(mistake.analysis || mistake.question_content.analysis) && (
                    <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span className="font-medium text-amber-800">解析</span>
                      </div>
                      <p className="text-sm text-stone-700 leading-relaxed">
                        {mistake.analysis || mistake.question_content.analysis}
                      </p>
                    </div>
                  )}

                  {/* 时间 */}
                  <div className="text-right text-xs text-stone-400">
                    添加于 {formatDate(mistake.created_at)}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
