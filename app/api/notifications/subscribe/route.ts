/**
 * @file route.ts
 * @description 保存推送订阅信息
 * @author InkWords Team
 * @date 2026-02-08
 * 
 * 修复：使用 Service Role Key 绕过 RLS 限制
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscription } = body;

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: '订阅信息不完整' },
        { status: 400 }
      );
    }

    // 【修复】使用 @supabase/ssr 从 Cookie 获取用户身份（仅用于验证）
    const cookieStore = await cookies();
    const authClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {
            // 不需要设置 cookie
          },
        },
      }
    );

    // 从 Session 获取用户（允许匿名订阅）
    const { data: { user } } = await authClient.auth.getUser();
    const userId = user?.id || null;

    console.log('[Notifications] 保存订阅:', { userId, endpoint: subscription.endpoint });

    // 【调试】检查 Service Role Key 是否配置
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    console.log('[Notifications] Service Role Key 配置状态:', {
      exists: !!serviceRoleKey,
      length: serviceRoleKey?.length,
      preview: serviceRoleKey ? `${serviceRoleKey.substring(0, 20)}...` : '未设置'
    });

    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: 'SUPABASE_SERVICE_ROLE_KEY 未配置，请检查 .env.local 文件' },
        { status: 500 }
      );
    }

    // 【修复】使用 Admin Client (Service Role Key) 绕过 RLS 限制
    let supabase;
    try {
      supabase = createAdminClient();
      console.log('[Notifications] Admin Client 创建成功');
    } catch (clientError: any) {
      console.error('[Notifications] 创建 Admin Client 失败:', clientError);
      return NextResponse.json(
        { error: '创建 Admin Client 失败: ' + clientError.message },
        { status: 500 }
      );
    }

    // 保存订阅到数据库
    console.log('[Notifications] 开始保存订阅到数据库...');
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys?.p256dh,
        auth: subscription.keys?.auth,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'endpoint',
      });

    if (error) {
      console.error('[Notifications] 保存订阅失败:', error);
      
      // 【修复】处理表不存在的错误
      const errorMessage = error.message || error.details || String(error);
      
      if (errorMessage.toLowerCase().includes('relation') && errorMessage.toLowerCase().includes('does not exist')) {
        return NextResponse.json(
          { 
            error: '数据库表未创建，请在 Supabase SQL Editor 中执行以下 SQL:\n\n' +
                   'CREATE TABLE IF NOT EXISTS push_subscriptions (\n' +
                   '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n' +
                   '  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,\n' +
                   '  endpoint TEXT NOT NULL UNIQUE,\n' +
                   '  p256dh TEXT NOT NULL,\n' +
                   '  auth TEXT NOT NULL,\n' +
                   '  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),\n' +
                   '  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()\n' +
                   ');\n\n' +
                   'ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;\n' +
                   'CREATE POLICY "Allow anonymous insert" ON push_subscriptions FOR INSERT WITH CHECK (true);'
          },
          { status: 500 }
        );
      }
      
      // 处理 RLS 策略错误
      if (errorMessage.toLowerCase().includes('row-level security') || 
          errorMessage.toLowerCase().includes('violates row-level security') ||
          errorMessage.toLowerCase().includes('new row violates row-level security') ||
          errorMessage.toLowerCase().includes('permission denied')) {
        return NextResponse.json(
          { 
            error: '权限不足。请尝试以下解决方案：\n' +
                   '1. 重启 Next.js 服务器以加载新的环境变量\n' +
                   '2. 在 Supabase 中禁用 RLS：ALTER TABLE push_subscriptions DISABLE ROW LEVEL SECURITY;\n' +
                   '3. 或者添加更宽松的策略：CREATE POLICY "Allow all" ON push_subscriptions FOR ALL USING (true) WITH CHECK (true);'
          },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { error: '保存订阅失败: ' + errorMessage },
        { status: 500 }
      );
    }

    console.log('[Notifications] 订阅保存成功');
    return NextResponse.json({ success: true, userId });
  } catch (error: any) {
    console.error('[Notifications] 订阅处理错误:', error);
    return NextResponse.json(
      { error: '处理订阅请求失败: ' + (error.message || '未知错误') },
      { status: 500 }
    );
  }
}
