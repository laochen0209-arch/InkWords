/**
 * @file route.ts
 * @description 爱发电 Webhook 接收与处理路由（极简版）
 * @author InkWords Team
 * @date 2026-02-20
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * 爱发电 Webhook POST 请求处理函数（极简版）
 * 
 * @param request - Next.js 请求对象
 * @returns Next.js 响应对象
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[Afdian Webhook] 收到请求')

    const body = await request.text()
    let remark = null

    try {
      const data = JSON.parse(body)
      remark = data?.data?.remark || data?.remark || data?.order?.remark
    } catch (e) {
      console.error('[Afdian Webhook] JSON 解析失败')
    }

    if (remark) {
      console.log('[Afdian Webhook] 用户ID:', remark)

      try {
        const supabase = createAdminClient()
        
        await supabase
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

        console.log('[Afdian Webhook] VIP 开通成功')
      } catch (dbError) {
        console.error('[Afdian Webhook] 数据库错误:', dbError)
      }
    }

  } catch (error) {
    console.error('[Afdian Webhook] 异常:', error)
  }

  return NextResponse.json({ ec: 200, em: "success" })
}
