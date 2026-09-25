import { supabase } from '@/app/_libs/supabase'
import { NextRequest, NextResponse } from 'next/server'

export const requireAdminAuth = async (request: NextRequest) => {
  const authorization = request.headers.get('Authorization')
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]

  if (!token) {
    return NextResponse.json(
      { message: '認証が必要です' },
      { status: 401 },
    )
  }

  const { error } = await supabase.auth.getUser(token)

  if (error) {
    return NextResponse.json(
      { message: '認証に失敗しました' },
      { status: 401 },
    )
  }

  return null
}
