import { NextRequest, NextResponse } from 'next/server'

const TEST_VERIFICATION_CODE = '123456'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone } = body

    if (!phone) {
      return NextResponse.json(
        { error: '手机号不能为空' },
        { status: 400 }
      )
    }

    console.log('='.repeat(50))
    console.log('📱 测试模式：发送验证码')
    console.log('='.repeat(50))
    console.log('📲 手机号:', phone)
    console.log('🔑 验证码:', TEST_VERIFICATION_CODE)
    console.log('='.repeat(50))
    console.log('✅ 验证码已发送（测试模式）')
    console.log('='.repeat(50))

    return NextResponse.json(
      { 
        message: '验证码发送成功',
        code: TEST_VERIFICATION_CODE
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Send verification code error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
