/**
 * @file route.ts
 * @description Lemon Squeezy Webhook 处理 API
 * @author InkWords Team
 * @date 2026-02-13
 * @version 1.0.0
 * 
 * 功能：
 * - 接收 Lemon Squeezy 支付事件回调
 * - 验证 Webhook 签名
 * - 处理 subscription_created 事件（订阅创建成功）
 * - 处理 subscription_updated 事件（订阅更新）
 * - 处理 subscription_cancelled 事件（订阅取消）
 * - 自动更新用户会员状态
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

/**
 * Supabase 客户端（使用 Service Role Key 绕过 RLS）
 */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST 处理 Lemon Squeezy Webhook
 * 
 * @param req - Next.js 请求对象
 * @returns NextResponse
 */
export async function POST(req: NextRequest) {
  console.log('[LEMON WEBHOOK] 收到 Lemon Squeezy Webhook 请求');

  try {
    // 1. 获取原始请求体和签名
    const rawBody = await req.text();
    const signature = req.headers.get('x-signature');

    if (!signature) {
      console.error('[LEMON WEBHOOK] 缺少签名');
      return NextResponse.json(
        { error: '缺少签名' },
        { status: 401 }
      );
    }

    // 2. 验证请求签名
    const webhookSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('[LEMON WEBHOOK] 未配置 WEBHOOK_SECRET');
      return NextResponse.json(
        { error: '服务器配置错误' },
        { status: 500 }
      );
    }

    // 计算 HMAC 签名
    const hmac = crypto.createHmac('sha256', webhookSecret);
    const digest = hmac.update(rawBody).digest('hex');

    if (digest !== signature) {
      console.error('[LEMON WEBHOOK] 签名验证失败');
      return NextResponse.json(
        { error: '签名验证失败' },
        { status: 401 }
      );
    }

    // 3. 解析事件数据
    const data = JSON.parse(rawBody);
    const eventName = data.meta?.event_name;
    
    console.log('[LEMON WEBHOOK] 事件类型:', eventName);
    console.log('[LEMON WEBHOOK] 事件数据:', JSON.stringify(data, null, 2));

    // 4. 处理不同的事件类型
    switch (eventName) {
      case 'subscription_created':
        await handleSubscriptionCreated(data);
        break;

      case 'subscription_updated':
        await handleSubscriptionUpdated(data);
        break;

      case 'subscription_cancelled':
        await handleSubscriptionCancelled(data);
        break;

      case 'order_created':
        await handleOrderCreated(data);
        break;

      default:
        console.log(`[LEMON WEBHOOK] 未处理的事件类型: ${eventName}`);
    }

    return NextResponse.json(
      { message: 'Webhook received' },
      { status: 200 }
    );

  } catch (err: any) {
    console.error('[LEMON WEBHOOK] 处理失败:', err);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }
}

/**
 * 处理订阅创建成功事件
 * 
 * @param data - Lemon Squeezy 事件数据
 */
async function handleSubscriptionCreated(data: any) {
  console.log('[LEMON WEBHOOK] 处理订阅创建事件');

  const attributes = data.data?.attributes;
  const userEmail = attributes?.user_email;
  const subscriptionId = data.data?.id;
  const renewsAt = attributes?.renews_at;
  const status = attributes?.status;

  if (!userEmail) {
    console.error('[LEMON WEBHOOK] 缺少用户邮箱');
    return;
  }

  console.log('[LEMON WEBHOOK] 用户信息:', {
    email: userEmail,
    subscriptionId,
    status,
    renewsAt
  });

  // 更新用户会员状态
  const { error } = await supabase
    .from('users')
    .update({
      is_pro: status === 'active' || status === 'on_trial',
      subscription_type: 'monthly', // Lemon Squeezy 月度订阅
      lemonsqueezy_subscription_id: subscriptionId,
      current_period_end: renewsAt,
      updated_at: new Date().toISOString()
    })
    .eq('email', userEmail);

  if (error) {
    console.error('[LEMON WEBHOOK] 更新用户状态失败:', error);
    throw error;
  }

  console.log(`[LEMON WEBHOOK] 用户 ${userEmail} 已成功升级为 Pro`);
}

/**
 * 处理订阅更新事件
 * 
 * @param data - Lemon Squeezy 事件数据
 */
async function handleSubscriptionUpdated(data: any) {
  console.log('[LEMON WEBHOOK] 处理订阅更新事件');

  const attributes = data.data?.attributes;
  const subscriptionId = data.data?.id;
  const renewsAt = attributes?.renews_at;
  const status = attributes?.status;

  // 通过订阅 ID 查找用户
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, email')
    .eq('lemonsqueezy_subscription_id', subscriptionId)
    .single();

  if (userError || !user) {
    console.error('[LEMON WEBHOOK] 未找到对应用户:', userError);
    return;
  }

  // 更新用户会员状态
  const { error } = await supabase
    .from('users')
    .update({
      is_pro: status === 'active' || status === 'on_trial',
      current_period_end: renewsAt,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id);

  if (error) {
    console.error('[LEMON WEBHOOK] 更新用户状态失败:', error);
    throw error;
  }

  console.log(`[LEMON WEBHOOK] 用户 ${user.email} 订阅已更新，状态: ${status}`);
}

/**
 * 处理订阅取消事件
 * 
 * @param data - Lemon Squeezy 事件数据
 */
async function handleSubscriptionCancelled(data: any) {
  console.log('[LEMON WEBHOOK] 处理订阅取消事件');

  const subscriptionId = data.data?.id;

  // 通过订阅 ID 查找用户
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, email')
    .eq('lemonsqueezy_subscription_id', subscriptionId)
    .single();

  if (userError || !user) {
    console.error('[LEMON WEBHOOK] 未找到对应用户:', userError);
    return;
  }

  // 更新用户会员状态为 false
  const { error } = await supabase
    .from('users')
    .update({
      is_pro: false,
      subscription_type: null,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id);

  if (error) {
    console.error('[LEMON WEBHOOK] 更新用户状态失败:', error);
    throw error;
  }

  console.log(`[LEMON WEBHOOK] 用户 ${user.email} 订阅已取消`);
}

/**
 * 处理订单创建事件（一次性购买）
 * 
 * @param data - Lemon Squeezy 事件数据
 */
async function handleOrderCreated(data: any) {
  console.log('[LEMON WEBHOOK] 处理订单创建事件');

  const attributes = data.data?.attributes;
  const userEmail = attributes?.user_email;
  const status = attributes?.status;

  if (!userEmail) {
    console.error('[LEMON WEBHOOK] 缺少用户邮箱');
    return;
  }

  // 只处理已支付的订单
  if (status !== 'paid') {
    console.log('[LEMON WEBHOOK] 订单未支付，跳过处理');
    return;
  }

  // 更新用户会员状态（终身会员）
  const { error } = await supabase
    .from('users')
    .update({
      is_pro: true,
      subscription_type: 'lifetime',
      current_period_end: null, // 终身会员无到期时间
      updated_at: new Date().toISOString()
    })
    .eq('email', userEmail);

  if (error) {
    console.error('[LEMON WEBHOOK] 更新用户状态失败:', error);
    throw error;
  }

  console.log(`[LEMON WEBHOOK] 用户 ${userEmail} 已购买终身会员`);
}
