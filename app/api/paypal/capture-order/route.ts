/**
 * @file route.ts
 * @description PayPal 捕获订单 API
 * @author InkWords Team
 * @date 2026-02-19
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * PayPal API 基础地址（沙盒环境）
 */
const PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com";

/**
 * 获取 PayPal Access Token
 * 使用 Client ID 和 Secret 通过 Basic Auth 换取访问令牌
 *
 * @returns Access Token
 */
async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("PayPal 凭证未配置");
  }

  // 使用 Basic Auth 编码凭证
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  // 调用 PayPal OAuth 接口获取 Access Token
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[PayPal] 获取 Access Token 失败:", errorText);
    throw new Error(`获取 Access Token 失败: ${response.status}`);
  }

  const data = await response.json();
  console.log("[PayPal] Access Token 获取成功");
  return data.access_token;
}

/**
 * 创建 Supabase Admin 客户端
 * 使用 Service Role Key 获取最高权限
 */
function createSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase 配置缺失");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * 更新用户 VIP 状态
 * 使用 Supabase Admin 客户端更新用户 is_pro 字段
 *
 * @param userId 用户 ID
 */
async function updateUserVipStatus(userId: string): Promise<void> {
  console.log("[PayPal] 更新用户 VIP 状态:", userId);

  const supabaseAdmin = createSupabaseAdmin();

  // 更新用户 is_pro 字段为 true
  const { error } = await supabaseAdmin
    .from("users")
    .update({
      is_pro: true,
      subscription_status: "active",
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    console.error("[PayPal] 更新用户 VIP 状态失败:", error);
    throw new Error(`更新用户 VIP 状态失败: ${error.message}`);
  }

  console.log("[PayPal] 用户 VIP 状态更新成功");
}

/**
 * 捕获 PayPal 订单
 * POST /api/paypal/capture-order
 *
 * 请求体：
 * - orderId: PayPal 订单 ID
 * - userId: 用户 ID
 *
 * 响应：
 * - success: 是否成功
 * - status: 订单状态
 */
export async function POST(request: NextRequest) {
  console.log("[PayPal Capture Order] 收到请求");

  try {
    // 解析请求体
    const body = await request.json();
    const { orderId, userId } = body;

    // 验证必要参数
    if (!orderId || !userId) {
      return NextResponse.json(
        { error: "缺少必要参数 orderId 或 userId" },
        { status: 400 }
      );
    }

    console.log("[PayPal Capture Order] 捕获订单:", { orderId, userId });

    // 获取 PayPal Access Token
    const accessToken = await getPayPalAccessToken();

    // 调用 PayPal Capture 接口执行扣款
    const captureResponse = await fetch(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!captureResponse.ok) {
      const errorData = await captureResponse.json();
      console.error("[PayPal Capture Order] 捕获订单失败:", errorData);
      throw new Error(errorData.message || "捕获 PayPal 订单失败");
    }

    const captureData = await captureResponse.json();
    console.log("[PayPal Capture Order] 捕获结果:", captureData.status);

    // 检查支付状态
    const captureStatus = captureData.status;

    if (captureStatus === "COMPLETED") {
      // 支付成功，更新用户 VIP 状态
      await updateUserVipStatus(userId);

      console.log("[PayPal Capture Order] 支付成功，VIP 已开通");

      return NextResponse.json(
        {
          success: true,
          status: captureStatus,
          message: "支付成功，VIP 已开通",
        },
        { status: 200 }
      );
    } else {
      // 支付未完成
      console.warn("[PayPal Capture Order] 支付未完成:", captureStatus);

      return NextResponse.json(
        {
          success: false,
          status: captureStatus,
          message: `支付状态: ${captureStatus}`,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("[PayPal Capture Order] 错误:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "捕获订单失败",
      },
      { status: 500 }
    );
  }
}
