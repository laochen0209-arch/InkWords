/**
 * @file route.ts
 * @description 翻译 API - 使用 DeepSeek 进行中英文翻译
 * @author InkWords Team
 * @date 2026-02-08
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * POST 处理翻译请求
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, targetLang } = body as { text: string; targetLang: 'zh' | 'en' };

    if (!text || !targetLang) {
      return NextResponse.json(
        { error: '参数不完整' },
        { status: 400 }
      );
    }

    // 调用 DeepSeek API 进行翻译
    const prompt = targetLang === 'zh' 
      ? `请将以下英文翻译成中文，只返回翻译结果，不要其他解释：\n\n${text}`
      : `请将以下中文翻译成英文，只返回翻译结果，不要其他解释：\n\n${text}`;

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY || ''}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是一个专业的翻译助手。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API 调用失败: ${response.status}`);
    }

    const data = await response.json();
    const translatedText = data.choices[0]?.message?.content?.trim() || text;

    return NextResponse.json(
      { 
        translatedText,
        originalText: text,
        targetLang 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('翻译错误:', error);
    return NextResponse.json(
      { error: '翻译服务暂时不可用' },
      { status: 500 }
    );
  }
}
