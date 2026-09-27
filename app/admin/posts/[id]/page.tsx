'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PostForm } from '../_components/PostForm'
import type { PostFormValues } from '../_components/PostForm'
import type { PostShowResponse, UpdatePostRequestBody } from '@/app/api/admin/posts/[id]/route'
import { useSupabaseSession } from '@/app/_hooks/useSupabaseSession'
import { useFetch } from '@/app/_hooks/useFetch'
import { supabase } from '@/app/_libs/supabase'
import { v4 as uuidv4 } from 'uuid'

export default function Page() {
  const [isDeleting, setIsDeleting] = useState(false)
  const { id } = useParams()
  const router = useRouter()
  const { token } = useSupabaseSession()
  const { data } = useFetch<PostShowResponse>(`/api/admin/posts/${id}`)
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