/**
 * @file route.ts
 * @description 删除推送订阅信息
 * @author InkWords Team
 * @date 2026-02-08
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        { error: '缺少 endpoint 参数' },
        { status: 400 }
      );
    }

    // 创建 Supabase 客户端
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 删除订阅
    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', endpoint);

    if (error) {
      console.error('[Notifications] 删除订阅失败:', error);
      return NextResponse.json(
        { error: '删除订阅失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Notifications] 取消订阅处理错误:', error);
    return NextResponse.json(
      { error: '处理取消订阅请求失败' },
      { status: 500 }
    );
  }
}
