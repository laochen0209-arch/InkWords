/**
 * @file route.ts
 * @description PayPal 创建订单 API
 * @author InkWords Team
 * @date 2026-02-19
 */

import { NextRequest, NextResponse } from "next/server";

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
 * 创建 PayPal 订单
 * POST /api/paypal/create-order
 *
 * 请求体：
 * - price: 支付金额（默认 4.99）
 * - userId: 用户 ID
 *
 * 响应：
 * - orderId: PayPal 订单 ID
 */
export async function POST(request: NextRequest) {
  console.log("[PayPal Create Order] 收到请求");

  try {
    // 解析请求体
    const body = await request.json();
    const { price = "4.99", userId } = body;

    // 验证必要参数
    if (!userId) {
      return NextResponse.json(
        { error: "缺少用户 ID" },
        { status: 400 }
      );
    }

    console.log("[PayPal Create Order] 创建订单:", { price, userId });

    // 获取 PayPal Access Token
    const accessToken = await getPayPalAccessToken();

    // 创建 PayPal 订单
    const orderResponse = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: price,
            },
            description: "InkWords Pro VIP 会员",
            custom_id: userId, // 存储用户 ID 用于后续关联
          },
        ],
        application_context: {
          brand_name: "InkWords",
          landing_page: "BILLING",
          user_action: "PAY_NOW",
          return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/profile`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/profile`,
        },
      }),
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json();
      console.error("[PayPal Create Order] 创建订单失败:", errorData);
      throw new Error(errorData.message || "创建 PayPal 订单失败");
    }

    const orderData = await orderResponse.json();
    console.log("[PayPal Create Order] 订单创建成功:", orderData.id);

    // 返回订单 ID 给前端
    return NextResponse.json(
      {
        success: true,
        orderId: orderData.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[PayPal Create Order] 错误:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "创建订单失败",
      },
      { status: 500 }
    );
  }
}
