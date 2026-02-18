/**
 * @file route.ts
 * @description 发送推送通知
 * @author InkWords Team
 * @date 2026-02-08
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

// 配置 web-push
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@inkwords.com';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    vapidSubject,
    vapidPublicKey,
    vapidPrivateKey
  );
}

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
  actions?: Array<{ action: string; title: string }>;
}

export async function POST(request: NextRequest) {
  try {
    // 检查 VAPID 配置
    if (!vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json(
        { error: 'VAPID 密钥未配置' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { 
      title, 
      body: messageBody, 
      icon = '/icon-192x192.png',
      badge = '/icon-72x72.png',
      tag = 'default',
      url = '/',
      actions = [],
      userId, // 如果指定了 userId，只发送给该用户
    } = body;

    if (!title || !messageBody) {
      return NextResponse.json(
        { error: '缺少标题或内容' },
        { status: 400 }
      );
    }

    // 创建 Supabase 客户端 - 使用 Service Role Key 以绕过 RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'SUPABASE_SERVICE_ROLE_KEY 未配置，请检查 .env.local 文件' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 获取订阅列表
    let query = supabase.from('push_subscriptions').select('*');
    
    // 如果指定了用户ID，只发给该用户
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: subscriptions, error } = await query;

    if (error) {
      console.error('[Notifications] 获取订阅列表失败:', error);
      return NextResponse.json(
        { error: '获取订阅列表失败' },
        { status: 500 }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        { error: '没有可用的订阅' },
        { status: 404 }
      );
    }

    // 准备通知内容
    const payload: NotificationPayload = {
      title,
      body: messageBody,
      icon,
      badge,
      tag,
      url,
      actions: actions.length > 0 ? actions : [
        { action: 'study', title: '去学习' },
        { action: 'close', title: '关闭' },
      ],
    };

    // 发送通知给所有订阅
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        try {
          await webpush.sendNotification(
            pushSubscription,
            JSON.stringify(payload)
          );
          return { success: true, endpoint: sub.endpoint };
        } catch (error) {
          console.error('[Notifications] 发送失败:', error);
          
          // 如果订阅已过期，删除它
          if ((error as any)?.statusCode === 410) {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('endpoint', sub.endpoint);
          }
          
          return { success: false, endpoint: sub.endpoint, error };
        }
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled' && (r.value as any).success).length;
    const failed = results.length - successful;

    return NextResponse.json({
      success: true,
      total: subscriptions.length,
      successful,
      failed,
    });
  } catch (error) {
    console.error('[Notifications] 发送通知错误:', error);
    return NextResponse.json(
      { error: '发送通知失败' },
      { status: 500 }
    );
  }
}
