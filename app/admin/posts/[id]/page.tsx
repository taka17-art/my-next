'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PostForm } from '../_components/PostForm'
import type { PostFormValues } from '../_components/PostForm'
import type { PostShowResponse, UpdatePostRequestBody } from '@/app/api/admin/posts/[id]/route'
import { useSupabaseSession } from '@/app/_hooks/useSupabaseSession'
import { supabase } from '@/app/_libs/supabase'
import { v4 as uuidv4 } from 'uuid'
import useSWR from 'swr'

export default function Page() {
  const [isDeleting, setIsDeleting] = useState(false)
  const { id } = useParams()
  const router = useRouter()
  const { token } = useSupabaseSession()
  const { data } = useSWR(
    token ? [`/api/admin/posts/${id}`, token] as const : null,
    async ([url, accessToken]) => {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!response.ok) throw new Error('記事の取得に失敗しました。')

      return response.json() as Promise<PostShowResponse>
    },
  )
  const post = data?.post

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

      const body: UpdatePostRequestBody = {
        title: data.title,
        content: data.content,
        thumbnailImageKey: data.thumbnailImageKey,
        categories: data.categories.map(({ id }) => ({ id })),
      }

      await fetch(`/api/admin/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      alert('記事を更新しました。')
    } catch (error) {
      console.error('記事の更新に失敗しました:', error)
      alert('記事の更新に失敗しました。')
    }
  }

  const handleDeletePost = async () => {
    if (!confirm('記事を削除しますか？')) return

    try {
      if (!token) return

      setIsDeleting(true)
      await fetch(`/api/admin/posts/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      alert('記事を削除しました。')

      router.push('/admin/posts')
    } catch (error) {
      console.error('記事の削除に失敗しました:', error)
      alert('記事の削除に失敗しました。')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="container mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">記事編集</h1>
      </div>

      {post && (
        <PostForm
          mode="edit"
          initialValues={{
            title: post.title,
            content: post.content,
            thumbnailImageKey: post.thumbnailImageKey,
            categories: post.postCategories.map((postCategory) => postCategory.category),
          }}
          onImageUpload={handleImageUpload}
          onSubmit={handleSubmit}
          onDelete={handleDeletePost}
          disabled={isDeleting}
        />
      )}
    </div>
  )
}