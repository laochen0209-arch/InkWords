/**
 * @file PayPalCheckoutButton.tsx
 * @description PayPal 支付按钮组件
 * @author InkWords Team
 * @date 2026-02-19
 */

"use client";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { toast } from "sonner";

/**
 * PayPal 支付按钮组件 Props
 */
interface PayPalCheckoutButtonProps {
  /** 用户 ID */
  userId: string;
  /** 支付金额，默认为 4.99 USD */
  price?: string;
}

/**
 * PayPal 支付按钮组件
 *
 * 功能说明：
 * - 使用 PayPal React SDK 渲染支付按钮
 * - 创建订单时调用后端 API 获取 PayPal orderID
 * - 支付成功后调用后端 API 捕获订单并更新用户 VIP 状态
 */
export default function PayPalCheckoutButton({
  userId,
  price = "4.99",
}: PayPalCheckoutButtonProps) {
  /**
   * 获取 PayPal Client ID
   * 从环境变量中读取
   */
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  /**
   * 创建订单回调
   * 当用户点击 PayPal 按钮时触发
   */
  const createOrder = async (): Promise<string> => {
    try {
      console.log("[PayPal] 开始创建订单...", { userId, price });

      // 调用后端 API 创建 PayPal 订单
      const response = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          price,
          userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "创建订单失败");
      }

      const data = await response.json();
      console.log("[PayPal] 订单创建成功:", data.orderId);

      // 返回 PayPal 订单 ID
      return data.orderId;
    } catch (error) {
      console.error("[PayPal] 创建订单失败:", error);
      toast.error("创建支付订单失败，请重试");
      throw error;
    }
  };

  /**
   * 支付批准回调
   * 当用户完成 PayPal 支付流程后触发
   */
  const onApprove = async (data: { orderID: string }): Promise<void> => {
    try {
      console.log("[PayPal] 支付已批准:", data.orderID);

      // 调用后端 API 捕获订单并更新用户 VIP 状态
      const response = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: data.orderID,
          userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "支付处理失败");
      }

      const result = await response.json();
      console.log("[PayPal] 支付处理成功:", result);

      // 显示成功提示
      toast.success("开通 VIP 成功！", {
        description: "您已成功开通 VIP 会员，享受全部特权。",
      });

      // 刷新页面以更新用户状态
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("[PayPal] 支付处理失败:", error);
      toast.error("支付处理失败，请联系客服");
      throw error;
    }
  };

  /**
   * 支付取消回调
   */
  const onCancel = () => {
    console.log("[PayPal] 用户取消支付");
    toast.info("支付已取消");
  };

  /**
   * 支付错误回调
   */
  const onError = (err: Error) => {
    console.error("[PayPal] 支付出错:", err);
    toast.error("支付出错，请重试或联系客服");
  };

  // 检查环境变量是否配置
  if (!paypalClientId) {
    console.error("[PayPal] 未配置 Client ID");
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
        PayPal 支付配置错误，请联系管理员
      </div>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId: paypalClientId,
        currency: "USD",
        intent: "capture",
      }}
    >
      <PayPalButtons
        style={{
          layout: "vertical",
          color: "gold",
          shape: "rect",
          label: "paypal",
        }}
        createOrder={createOrder}
        onApprove={onApprove}
        onCancel={onCancel}
        onError={onError}
      />
    </PayPalScriptProvider>
  );
}
