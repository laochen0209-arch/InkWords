/**
 * @file route.ts
 * @description 获取 VAPID 公钥
 * @author InkWords Team
 * @date 2026-02-08
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  
  if (!publicKey) {
    return NextResponse.json(
      { error: 'VAPID 公钥未配置' },
      { status: 500 }
    );
  }

  return NextResponse.json({ publicKey });
}
