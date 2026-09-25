'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PostForm } from '../_components/PostForm'
import { Category } from '@/app/api/admin/posts/[id]/route'
import { CreatePostRequestBody } from '@/app/api/admin/posts/route'
import { useSupabaseSession } from '@/app/_hooks/useSupabaseSession'
import { supabase } from '@/app/_libs/supabase'
import { v4 as uuidv4 } from 'uuid'

export default function Page() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [thumbnailImageKey, setThumbnailImageKey] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { token } = useSupabaseSession()

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    if (!event.target.files || event.target.files.length === 0) return

    const file = event.target.files[0]
    const filePath = `private/${uuidv4()}`

    setIsSubmitting(true)
    const { data, error } = await supabase.storage
      .from('post_thumbnail')
      .upload(filePath, file, { cacheControl: '3600', upsert: false })
    setIsSubmitting(false)

    if (error) {
      alert(error.message)
      return
    }

    setThumbnailImageKey(data.path)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    // フォームのデフォルトの動作をキャンセルします。
    e.preventDefault()

    try {
      if (!token) return

      setIsSubmitting(true)

      const body: CreatePostRequestBody = {
        title,
        content,
        thumbnailImageKey,
        categories,
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
    } finally {
      setIsSubmitting(false)
    }

  }

  return (
    <div className="container mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">記事作成</h1>
      </div>

      <PostForm
        mode="new"
        title={title}
        setTitle={setTitle}
        content={content}
        setContent={setContent}
        thumbnailImageKey={thumbnailImageKey}
        onImageChange={handleImageChange}
        categories={categories}
        setCategories={setCategories}
        onSubmit={handleSubmit}
        disabled={isSubmitting}
      />
    </div>
  )
}