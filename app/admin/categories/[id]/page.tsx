'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CategoryForm } from '../_components/CategoryForm'
import type { CategoryFormValues } from '../_components/CategoryForm'
import type { CategoryShowResponse } from '@/app/api/admin/categories/[id]/route'
import { useSupabaseSession } from '@/app/_hooks/useSupabaseSession'
import { useFetch } from '@/app/_hooks/useFetch'

export default function Page() {
  const [isDeleting, setIsDeleting] = useState(false)
  const { id } = useParams()
  const router = useRouter()
  const { token } = useSupabaseSession()
  const { data } = useFetch<CategoryShowResponse>(`/api/admin/categories/${id}`)

  const handleSubmit = async (data: CategoryFormValues) => {
    try {
      if (!token) return

      // カテゴリーを更新します。
      await fetch(`/api/admin/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      alert('カテゴリーを更新しました。')
    } catch (error) {
      console.error('カテゴリーの更新に失敗しました:', error)
      alert('カテゴリーの更新に失敗しました。')
    }
  }

  const handleDeleteCategory = async () => {
    if (!confirm('カテゴリーを削除しますか？')) return

    try {
      if (!token) return

      setIsDeleting(true)

      await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      alert('カテゴリーを削除しました。')

      router.push('/admin/categories')
    } catch (error) {
      console.error('カテゴリーの削除に失敗しました:', error)
      alert('カテゴリーの削除に失敗しました。')
    } finally {
      setIsDeleting(false)
    }

  }

  return (
    <div className="container mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">カテゴリー編集</h1>
      </div>

      {data && (
        <CategoryForm
          mode="edit"
          initialName={data.category.name}
          onSubmit={handleSubmit}
          onDelete={handleDeleteCategory}
          disabled={isDeleting}
        />
      )}
    </div>
  )
}