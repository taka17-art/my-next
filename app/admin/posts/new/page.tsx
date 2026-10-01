'use client'

import { useRouter } from 'next/navigation'
import { PostForm } from '../_components/PostForm'
import type { PostFormValues } from '../_components/PostForm'
import type { CreatePostRequestBody } from '@/app/api/admin/posts/route'
import { useSupabaseSession } from '@/app/_hooks/useSupabaseSession'
import { supabase } from '@/app/_libs/supabase'
import { v4 as uuidv4 } from 'uuid'

export default function Page() {
  const router = useRouter()
  const { token } = useSupabaseSession()

  const handleImageUpload = async (file: File): Promise<string | null> => {
    const filePath = `private/${uuidv4()}`
    const { data, error } = await supabase.storage
      .from('post_thumbnail')
      .upload(filePath, file, { cacheControl: '3600', upsert: false })
    if (error) {
      alert(error.message)
      return null
    }

    return data.path
  }

  const handleSubmit = async (data: PostFormValues) => {
    try {
      if (!token) return
      const body: CreatePostRequestBody = {
        title: data.title,
        content: data.content,
        thumbnailImageKey: data.thumbnailImageKey,
        categories: data.categories.map(({ id }) => ({ id })),
      }

      // 記事を作成します。
      const res = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      // レスポンスから作成した記事のIDを取得します。
      const { id } = await res.json()

      // 作成した記事の詳細ページに遷移します。
      router.push(`/admin/posts/${id}`)

      alert('記事を作成しました。')
    } catch (error) {
      console.error('記事の作成に失敗しました:', error)
      alert('記事の作成に失敗しました。')
    }
  }

  return (
    <div className="container mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">記事作成</h1>
      </div>

      <PostForm
        mode="new"
        onImageUpload={handleImageUpload}
        onSubmit={handleSubmit}
      />
    </div>
  )
}