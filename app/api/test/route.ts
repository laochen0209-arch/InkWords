import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json(
      {
        message: '测试 API 正常工作！',
        data: [
          { id: 1, title: '测试文章 1' },
          { id: 2, title: '测试文章 2' }
        ]
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('测试 API 错误:', error)
    return NextResponse.json(
      {
        error: '测试 API 失败'
      },
      { status: 500 }
    )
  }
}
