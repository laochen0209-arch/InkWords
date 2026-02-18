/**
 * @fileoverview Gumroad Webhook Handler
 * @description 处理 Gumroad 销售 webhook 的 API 路由
 * 
 * 当用户在 Gumroad 完成购买时，Gumroad 会向此端点发送 webhook 请求。
 * 此处理程序会解析 Gumroad 发送的 form-data 数据，并更新用户的 VIP 状态。
 * 
 * @module app/api/webhooks/gumroad
 * @requires @supabase/supabase-js
 * @requires next/server
 * 
 * @example
 * // Gumroad webhook URL 配置
 * POST https://your-domain.com/api/webhooks/gumroad
 * 
 * @author InkWords Team
 * @version 1.0.0
 */

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Gumroad webhook 请求数据接口
 * @interface GumroadWebhookData
 */
interface GumroadWebhookData {
  /** 用户 ID（从自定义字段或邮箱获取） */
  user_id?: string
  /** 购买者邮箱 */
  email: string
  /** Gumroad 产品 ID */
  product_id: string
  /** Gumroad 销售 ID */
  sale_id: string
  /** 自定义字段（可能包含 user_id） */
  [key: string]: string | undefined
}

/**
 * 用户更新数据接口
 * @interface UserUpdateData
 */
interface UserUpdateData {
  /** VIP 状态 */
  is_vip: boolean
  /** 订阅状态 */
  subscription_status: string
  /** 订阅类型 */
  subscription_type: string
}

/**
 * 解析 Gumroad form-data 请求
 * 
 * @param {NextRequest} request - Next.js 请求对象
 * @returns {Promise<GumroadWebhookData>} 解析后的 webhook 数据
 * @throws {Error} 当解析失败时抛出错误
 */
async function parseGumroadFormData(request: NextRequest): Promise<GumroadWebhookData> {
  const formData = await request.formData()
  
  // 提取基本字段
  const email = formData.get('email') as string
  const productId = formData.get('product_id') as string
  const saleId = formData.get('sale_id') as string
  
  // 尝试从自定义字段获取 user_id
  // Gumroad 支持自定义字段，字段名通常为 custom_fields 或直接作为顶层字段
  let userId = formData.get('user_id') as string | undefined
  
  // 如果没有直接的 user_id，尝试从自定义字段解析
  if (!userId) {
    const customFields = formData.get('custom_fields') as string
    if (customFields) {
      try {
        const parsed = JSON.parse(customFields)
        userId = parsed.user_id
      } catch {
        // 如果解析失败，忽略错误
      }
    }
  }
  
  return {
    user_id: userId,
    email,
    product_id: productId,
    sale_id: saleId,
  }
}

/**
 * 初始化 Supabase Admin 客户端
 * 
 * @returns {ReturnType<typeof createClient>} Supabase 管理员客户端实例
 * @throws {Error} 当环境变量未设置时抛出错误
 */
function initializeSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl) {
    throw new Error('环境变量 NEXT_PUBLIC_SUPABASE_URL 未设置')
  }
  
  if (!supabaseServiceKey) {
    throw new Error('环境变量 SUPABASE_SERVICE_ROLE_KEY 未设置')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * 更新用户 VIP 状态
 * 
 * @param {ReturnType<typeof createClient>} supabase - Supabase 客户端
 * @param {string} userId - 用户 ID
 * @returns {Promise<void>}
 * @throws {Error} 当更新失败时抛出错误
 */
async function updateUserVipStatus(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<void> {
  const updateData: UserUpdateData = {
    is_vip: true,
    subscription_status: 'active',
    subscription_type: 'gumroad',
  }
  
  const { error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', userId)
  
  if (error) {
    throw new Error(`更新用户 VIP 状态失败: ${error.message}`)
  }
}

/**
 * 通过邮箱查找用户 ID
 * 
 * @param {ReturnType<typeof createClient>} supabase - Supabase 客户端
 * @param {string} email - 用户邮箱
 * @returns {Promise<string | null>} 用户 ID 或 null
 */
async function findUserByEmail(
  supabase: ReturnType<typeof createClient>,
  email: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()
  
  if (error || !data) {
    return null
  }
  
  return data.id
}

/**
 * POST 请求处理函数 - 处理 Gumroad webhook
 * 
 * @param {NextRequest} request - Next.js 请求对象
 * @returns {Promise<NextResponse>} JSON 响应
 * 
 * @example
 * // 成功响应
 * { success: true }
 * 
 * @example
 * // 错误响应
 * { success: false, error: '错误信息' }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 记录 webhook 接收日志
    console.log('[Gumroad Webhook] 收到新的 webhook 请求')
    console.log('[Gumroad Webhook] 请求时间:', new Date().toISOString())
    
    // 解析 Gumroad form-data 数据
    const webhookData = await parseGumroadFormData(request)
    
    console.log('[Gumroad Webhook] 解析的数据:', {
      user_id: webhookData.user_id,
      email: webhookData.email,
      product_id: webhookData.product_id,
      sale_id: webhookData.sale_id,
    })
    
    // 验证必要字段
    if (!webhookData.email) {
      console.error('[Gumroad Webhook] 错误: 缺少 email 字段')
      return NextResponse.json(
        { success: false, error: '缺少必要的 email 字段' },
        { status: 400 }
      )
    }
    
    if (!webhookData.product_id) {
      console.error('[Gumroad Webhook] 错误: 缺少 product_id 字段')
      return NextResponse.json(
        { success: false, error: '缺少必要的 product_id 字段' },
        { status: 400 }
      )
    }
    
    // 初始化 Supabase Admin 客户端
    const supabase = initializeSupabaseAdmin()
    
    // 确定用户 ID
    let userId = webhookData.user_id
    
    // 如果没有提供 user_id，尝试通过邮箱查找
    if (!userId) {
      console.log('[Gumroad Webhook] 未提供 user_id，尝试通过邮箱查找用户')
      userId = await findUserByEmail(supabase, webhookData.email)
      
      if (!userId) {
        console.error('[Gumroad Webhook] 错误: 未找到对应邮箱的用户:', webhookData.email)
        return NextResponse.json(
          { success: false, error: '未找到对应邮箱的用户' },
          { status: 404 }
        )
      }
      
      console.log('[Gumroad Webhook] 通过邮箱找到用户 ID:', userId)
    }
    
    // 更新用户 VIP 状态
    await updateUserVipStatus(supabase, userId)
    
    console.log('[Gumroad Webhook] 成功更新用户 VIP 状态:', {
      user_id: userId,
      email: webhookData.email,
      sale_id: webhookData.sale_id,
    })
    
    // 返回成功响应
    return NextResponse.json(
      { success: true },
      { status: 200 }
    )
    
  } catch (error) {
    // 记录错误日志
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    console.error('[Gumroad Webhook] 处理失败:', errorMessage)
    console.error('[Gumroad Webhook] 错误详情:', error)
    
    // 返回错误响应
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
