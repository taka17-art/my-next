import { prisma } from '@/app/_libs/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/app/_libs/requireAdminAuth'

export type PostIndexResponse = {
  posts: {
    id: number
    title: string
    content: string
    thumbnailImageKey: string
    createdAt: Date
    updatedAt: Date
    postCategories: {
      category: {
        id: number
        name: string
      }
    }[]
  }[]
}

export const GET = async (request: NextRequest) => {
  const authError = await requireAdminAuth(request)
  if (authError) return authError

  try {
    const posts = await prisma.post.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ posts }, { status: 200 })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: '記事の取得に失敗しました' }, { status: 500 })
  }
}

// 投稿作成時に送られてくるリクエストのbodyの型
export type CreatePostRequestBody = {
  title: string
  content: string
  categories: { id: number }[]
  thumbnailImageKey: string
}

// 投稿作成APIのレスポンスの型
export type CreatePostResponse = {
  id: number
}

// POSTという命名にすることで、POSTリクエストの時にこの関数が呼ばれる
export const POST = async (request: NextRequest) => {
  try {
    const authError = await requireAdminAuth(request)
    if (authError) return authError

    // リクエストのbodyを取得
    const body: CreatePostRequestBody = await request.json()

    // bodyの中からtitle, content, categories, thumbnailImageKeyを取り出す
    const { title, content, categories, thumbnailImageKey } = body

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

    const data = await prisma.$transaction(async (transaction) => {
      const post = await transaction.post.create({
        data: { title: title.trim(), content, thumbnailImageKey },
      })

      for (const category of categories) {
        await transaction.postCategory.create({
          data: { categoryId: category.id, postId: post.id },
        })
      }

      return post
    })

    // レスポンスを返す
    return NextResponse.json<CreatePostResponse>({
      id: data.id,
    })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: '記事の作成に失敗しました' }, { status: 500 })
  }
}
