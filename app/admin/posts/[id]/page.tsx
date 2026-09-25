'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PostForm } from '../_components/PostForm'
import { Category, PostShowResponse, UpdatePostRequestBody } from '@/app/api/admin/posts/[id]/route'
import { useSupabaseSession } from '@/app/_hooks/useSupabaseSession'
import { supabase } from '@/app/_libs/supabase'
import { v4 as uuidv4 } from 'uuid'

export default function Page() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [thumbnailImageKey, setThumbnailImageKey] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { id } = useParams()
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

      const body: UpdatePostRequestBody = {
        title,
        content,
        thumbnailImageKey,
        categories,
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
    } finally {
      setIsSubmitting(false)
    }

  }

  const handleDeletePost = async () => {
    if (!confirm('記事を削除しますか？')) return

    try {
      if (!token) return

      setIsSubmitting(true)
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
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (!token) return

    const fetcher = async () => {
      const res = await fetch(`/api/admin/posts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const { post }: { post: PostShowResponse["post"] } = await res.json()
      setTitle(post.title)
      setContent(post.content)
      setThumbnailImageKey(post.thumbnailImageKey)
      setCategories(post.postCategories.map((pc) => pc.category))
    }

    fetcher()
  }, [id, token])

  return (
    <div className="container mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">記事編集</h1>
      </div>

      <PostForm
        mode="edit"
        title={title}
        setTitle={setTitle}
        content={content}
        setContent={setContent}
        thumbnailImageKey={thumbnailImageKey}
        onImageChange={handleImageChange}
        categories={categories}
        setCategories={setCategories}
        onSubmit={handleSubmit}
        onDelete={handleDeletePost}
        disabled={isSubmitting}
      />
    </div>
  )
}