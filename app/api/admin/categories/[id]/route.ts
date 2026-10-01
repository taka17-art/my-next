import { prisma } from '@/app/_libs/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/app/_libs/requireAdminAuth'

// カテゴリー詳細APIのレスポンスの型
export type CategoryShowResponse = {
  category: {
    id: number
    name: string
    createdAt: Date
    updatedAt: Date
  }
}

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const authError = await requireAdminAuth(request)
  if (authError) return authError

  const { id } = await params
  const categoryId = Number(id)

  if (!Number.isInteger(categoryId)) {
    return NextResponse.json({ message: 'カテゴリーIDが不正です' }, { status: 400 })
  }

  try {
    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    })

    if (!category) {
      return NextResponse.json(
        { message: 'カテゴリーが見つかりません。' },
        { status: 404 },
      )
    }

    return NextResponse.json<CategoryShowResponse>({ category }, { status: 200 })
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ message: error.message }, { status: 400 })
  }
}

// カテゴリーの更新時に送られてくるリクエストのbodyの型
export type UpdateCategoryRequestBody = {
  name: string
}

export const PUT = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }, // ここでリクエストパラメータを受け取る
) => {
  const authError = await requireAdminAuth(request)
  if (authError) return authError

  // paramsの中にidが入っているので、それを取り出す
  const { id } = await params
  const categoryId = Number(id)

  if (!Number.isInteger(categoryId)) {
    return NextResponse.json({ message: 'カテゴリーIDが不正です' }, { status: 400 })
  }

  // リクエストのbodyを取得
  const { name }: UpdateCategoryRequestBody = await request.json()

  try {
    // idを指定して、Categoryを更新
    await prisma.category.update({
      where: {
        id: categoryId,
      },
      data: {
        name,
      },
    })

    // レスポンスを返す
    return NextResponse.json({ message: 'OK' }, { status: 200 })
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ message: error.message }, { status: 400 })
  }
}

export const DELETE = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }, // ここでリクエストパラメータを受け取る
) => {
  const authError = await requireAdminAuth(request)
  if (authError) return authError

  // paramsの中にidが入っているので、それを取り出す
  const { id } = await params
  const categoryId = Number(id)

  if (!Number.isInteger(categoryId)) {
    return NextResponse.json({ message: 'カテゴリーIDが不正です' }, { status: 400 })
  }

  try {
    // idを指定して、Categoryを削除
    await prisma.category.delete({
      where: {
        id: categoryId,
      },
    })

    // レスポンスを返す
    return NextResponse.json({ message: 'OK' }, { status: 200 })
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ message: error.message }, { status: 400 })
  }
}
