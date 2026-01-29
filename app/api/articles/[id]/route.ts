/**
 * 文章详情 API 路由
 * 
 * 该路由处理获取单篇文章详情的请求
 * 从 Article 表中获取文章详情
 */

import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET 请求处理器
 * 
 * 根据文章 ID 从 Article 表中获取文章详情
 * 
 * @param request - Next.js 请求对象
 * @param params - 路由参数，包含文章 ID（Next.js 15+ 中为 Promise）
 * @returns 返回文章详情数据或错误响应
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // 先从 Article 表查询
    const { data: articleData, error: articleError } = await supabase
      .from("Article")
      .select("*")
      .eq("id", id)
      .single();

    if (articleError && articleError.code !== 'PGRST116') {
      console.error("Article Query Error:", articleError);
    }

    // 如果 Article 表找到数据，返回 Article 数据
    if (articleData) {
      // 转换字段名以兼容前端期望的格式
      return NextResponse.json({
        id: articleData.id,
        title_en: articleData.titleEn || articleData.title_en,
        title_zh: articleData.titleZh || articleData.title_zh,
        content_en: articleData.contentEn || articleData.content_en,
        content_zh: articleData.contentZh || articleData.content_zh,
        category: articleData.category,
        createdAt: articleData.createdAt,
        updatedAt: articleData.updatedAt
      });
    }

    // 如果 Article 表没找到，尝试从 mock_exams 表查询
    const { data: mockData, error: mockError } = await supabase
      .from("mock_exams")
      .select("*")
      .eq("id", id)
      .single();

    if (mockError && mockError.code !== 'PGRST116') {
      console.error("Mock Exams Query Error:", mockError);
    }

    if (mockData) {
      return NextResponse.json(mockData);
    }

    // 如果都没找到，返回 404
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
