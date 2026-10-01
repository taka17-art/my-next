import { prisma } from '@/app/_libs/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/app/_libs/requireAdminAuth'

export type Category = {
  id: number
  name: string
}

// 記事詳細APIのレスポンスの型
export type PostShowResponse = {
  post: {
    id: number
    title: string
    content: string
    thumbnailImageKey: string
    createdAt: Date
    updatedAt: Date
    postCategories: {
      category:Category
    }[]
  }
}

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const authError = await requireAdminAuth(request)
  if (authError) return authError

  const { id } = await params
  const postId = Number(id)

  if (!Number.isInteger(postId)) {
    return NextResponse.json({ message: '記事IDが不正です' }, { status: 400 })
  }

  try {
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        postCategories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    if (!post) {
      return NextResponse.json(
        { message: '記事が見つかりません。' },
        { status: 404 },
      )
    }

    return NextResponse.json<PostShowResponse>({ post }, { status: 200 })
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

// 記事の更新時に送られてくるリクエストのbodyの型
export type UpdatePostRequestBody = {
  title: string
  content: string
  categories: { id: number }[]
  thumbnailImageKey: string
}

// PUTという命名にすることで、PUTリクエストの時にこの関数が呼ばれる
export const PUT = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }, // ここでリクエストパラメータを受け取る
) => {
  const authError = await requireAdminAuth(request)
  if (authError) return authError

  // paramsの中にidが入っているので、それを取り出す
  const { id } = await params
  const postId = Number(id)

  if (!Number.isInteger(postId)) {
    return NextResponse.json({ message: '記事IDが不正です' }, { status: 400 })
  }

  // リクエストのbodyを取得
  const { title, content, categories, thumbnailImageKey }: UpdatePostRequestBody = await request.json()

  if (
    typeof title !== 'string' ||
    !title.trim() ||
    typeof content !== 'string' ||
    !content.trim() ||
    typeof thumbnailImageKey !== 'string' ||
    !Array.isArray(categories) ||
    categories.some((category) => !Number.isInteger(category?.id))
  ) {
    return NextResponse.json({ message: '入力値が不正です' }, { status: 400 })
  }

  try {
    // idを指定して、Postを更新
    await prisma.$transaction(async (transaction) => {
      await transaction.post.update({
        where: { id: postId },
        data: { title: title.trim(), content, thumbnailImageKey },
      })

      await transaction.postCategory.deleteMany({ where: { postId } })

      for (const category of categories) {
        await transaction.postCategory.create({
          data: { postId, categoryId: category.id },
        })
      }
    })

    // レスポンスを返す
    return NextResponse.json({ message: 'OK' }, { status: 200 })
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

// DELETEという命名にすることで、DELETEリクエストの時にこの関数が呼ばれる
export const DELETE = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }, // ここでリクエストパラメータを受け取る
) => {
  const authError = await requireAdminAuth(request)
  if (authError) return authError

  // paramsの中にidが入っているので、それを取り出す
  const { id } = await params
  const postId = Number(id)

  if (!Number.isInteger(postId)) {
    return NextResponse.json({ message: '記事IDが不正です' }, { status: 400 })
  }

  try {
    // idを指定して、Postを削除
    await prisma.post.delete({
      where: {
        id: postId,
      },
    })

    // レスポンスを返す
    return NextResponse.json({ message: 'OK' }, { status: 200 })
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ message: error.message }, { status: 500 })
  }
}