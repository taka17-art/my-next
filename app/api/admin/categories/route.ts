
import { prisma } from '@/app/_libs/prisma'
import { requireAdminAuth } from '@/app/_libs/requireAdminAuth'
import { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// カテゴリー一覧APIのレスポンスの型
export type CategoriesIndexResponse = {
  categories: {
    id: number
    name: string
    createdAt: Date
    updatedAt: Date
  }[]
}

export const GET = async (request: NextRequest) => {
  const authError = await requireAdminAuth(request)
  if (authError) return authError

  try {
    // カテゴリーの一覧をDBから取得
    const categories = await prisma.category.findMany({
      orderBy: {
        createdAt: 'desc', // 作成日時の降順で取得
      },
    })

    // レスポンスを返す
    return NextResponse.json<CategoriesIndexResponse>({ categories }, { status: 200 })
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ message: error.message }, { status: 400 })
  }
}

// カテゴリーの作成時に送られてくるリクエストのbodyの型
export type CreateCategoryRequestBody = {
  name: string
}

// カテゴリー作成APIのレスポンスの型
export type CreateCategoryResponse = {
  id: number
}

export const POST = async (request: NextRequest) => {
  try {
    const authError = await requireAdminAuth(request)
    if (authError) return authError

    // リクエストのbodyを取得
    const body = await request.json()

    // bodyの中からnameを取り出す
    const { name }: CreateCategoryRequestBody = body

    if (typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ message: 'カテゴリー名が不正です' }, { status: 400 })
    }

    // カテゴリーをDBに生成
    const data = await prisma.category.create({
      data: {
        name: name.trim(),
      },
    })

    // レスポンスを返す
    return NextResponse.json<CreateCategoryResponse>({
      id: data.id,
    })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }
  }
}
