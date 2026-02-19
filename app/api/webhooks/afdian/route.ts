/**
 * @file route.ts
 * @description 爱发电 Webhook 接收与处理路由
 * @author InkWords Team
 * @date 2026-02-20
 * 
 * 功能说明：
 * - 接收爱发电发来的 Webhook 请求
 * - 按照爱发电官方文档进行验签
 * - 支付成功后自动点亮用户 VIP 状态
 * 
 * 极其重要：
 * - 无论发生什么情况，方法的最后一行必须返回 { "ec": 200, "em": "success" }
 * - 不要在 try 块中间 return，不要 throw 任何异常
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import crypto from 'crypto'

/**
 * 爱发电 Webhook POST 请求处理函数
 * 
 * @param request - Next.js 请求对象
 * @returns Next.js 响应对象
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[Afdian Webhook] 收到爱发电 Webhook 请求')

    // ============================================================================
    // 1. 获取环境变量
    // ============================================================================
    const afdianUserId = process.env.AFDIAN_USER_ID
    const afdianToken = process.env.AFDIAN_TOKEN

    if (!afdianUserId || !afdianToken) {
      console.error('[Afdian Webhook] 缺少爱发电配置环境变量')
    } else {
      // ============================================================================
      // 2. 读取并解析请求体
      // ============================================================================
      const body = await request.text()
      let requestData

      try {
        requestData = JSON.parse(body)
      } catch (parseError) {
        console.error('[Afdian Webhook] 请求体 JSON 解析失败:', parseError)
      }

      if (requestData) {
        console.log('[Afdian Webhook] 请求数据:', JSON.stringify(requestData, null, 2))

        // ============================================================================
        // 3. 爱发电 Webhook 验签
        // ============================================================================
        const { ec, em, data, sign } = requestData

        if (!sign) {
          console.error('[Afdian Webhook] 缺少签名参数')
        } else {
          // 按照爱发电官方文档的验签规则：
          // 将 params（JSON字符串） + token 拼接后进行 MD5 加密
          const paramsStr = JSON.stringify(data)
          const signContent = paramsStr + afdianToken
          const computedSign = crypto
            .createHash('md5')
            .update(signContent, 'utf-8')
            .digest('hex')

          console.log('[Afdian Webhook] 计算的签名:', computedSign)
          console.log('[Afdian Webhook] 收到的签名:', sign)

          if (computedSign !== sign) {
            console.error('[Afdian Webhook] 签名验证失败')
          } else {
            console.log('[Afdian Webhook] 签名验证通过')

            // ============================================================================
            // 4. 提取订单信息和用户 ID
            // ============================================================================
            const orderData = data
            const remark = orderData?.remark || orderData?.order?.remark
            const orderStatus = orderData?.status || orderData?.order?.status

            console.log('[Afdian Webhook] 订单备注 (用户ID):', remark)
            console.log('[Afdian Webhook] 订单状态:', orderStatus)

            if (!remark) {
              console.error('[Afdian Webhook] 缺少用户 ID (remark 字段为空)')
            } else {
              // ============================================================================
              // 5. 检查订单状态是否为支付成功
              // 爱发电订单状态：通常 2 表示支付成功
              // ============================================================================
              const successStatuses = [2, '2', 'paid', 'success']
              const isPaymentSuccess = successStatuses.includes(orderStatus)

              if (!isPaymentSuccess) {
                console.log('[Afdian Webhook] 订单状态不是支付成功，跳过处理')
              } else {
                console.log('[Afdian Webhook] 订单支付成功，开始激活 VIP')

                // ============================================================================
                // 6. 使用 Supabase Admin 客户端更新用户 VIP 状态
                // ============================================================================
                try {
                  const supabase = createAdminClient()

                  // 更新用户数据
                  const { error: updateError } = await supabase
                    .from('users')
                    .update({
                      is_pro: true,
                      subscription_status: 'active',
                      subscription_type: 'yearly',
                      current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                      points: 8888,
                      updated_at: new Date().toISOString()
                    })
                    .eq('id', remark)

                  if (updateError) {
                    console.error('[Afdian Webhook] 更新用户数据失败:', updateError)
                  } else {
                    // 记录活动日志
                    const { error: logError } = await supabase
                      .from('user_activities')
                      .insert({
                        user_id: remark,
                        action_type: 'vip_activated',
                        target_id: null,
                        details: {
                          activated_at: new Date().toISOString(),
                          subscription_type: 'yearly',
                          points_added: 8888,
                          payment_method: 'afdian'
                        },
                        created_at: new Date().toISOString()
                      })

                    if (logError) {
                      console.warn('[Afdian Webhook] 记录活动日志失败:', logError)
                    }

                    console.log('[Afdian Webhook] VIP 激活成功，用户 ID:', remark)
                  }
                } catch (dbError) {
                  console.error('[Afdian Webhook] 数据库操作出错:', dbError)
                }
              }
            }
          }
        }
      }
    }

  } catch (error: any) {
    console.error('[Afdian Webhook] 处理过程出错:', error)
  }

  // ============================================================================
  // 极其重要：无论上面发生了什么，必须返回这个！
  // ============================================================================
  return NextResponse.json({ ec: 200, em: 'success' })
}
