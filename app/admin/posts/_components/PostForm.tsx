
import React from 'react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { CategoriesSelect } from './CategoriesSelect'
import { Category } from '@/app/api/admin/posts/[id]/route'
import { supabase } from '@/app/_libs/supabase'

interface Props {
  mode: 'new' | 'edit'
  title: string
  setTitle: (title: string) => void
  content: string
  setContent: (content: string) => void
  thumbnailImageKey: string
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  categories: Category[]
  setCategories: (categories: Category[]) => void
  onSubmit: (e: React.FormEvent) => void
  onDelete?: () => void
  disabled: boolean;
}

export const PostForm: React.FC<Props> = ({
  mode,
  title,
  setTitle,
  content,
  setContent,
  thumbnailImageKey,
  onImageChange,
  categories,
  setCategories,
  onSubmit,
  onDelete,
  disabled
}) => {
  const [thumbnailImageUrl, setThumbnailImageUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!thumbnailImageKey) return

    const fetcher = async () => {
      const { data, error } = await supabase.storage
        .from('post_thumbnail')
        .createSignedUrl(thumbnailImageKey, 3600)

      if (error) return

      setThumbnailImageUrl(data.signedUrl)
    }

    fetcher()
  }, [thumbnailImageKey])

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          タイトル
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-200 p-3"
          disabled={disabled}
        />
        {thumbnailImageKey && thumbnailImageUrl && (
          <div className="mt-2">
            <Image
              src={thumbnailImageUrl}
              alt="thumbnail"
              width={400}
              height={400}
              className="object-contain"
            />
          </div>
        )}
      </div>
      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-gray-700"
        >
          内容
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-200 p-3"
          disabled={disabled}
        />
      </div>
      <div>
        <label
          htmlFor="thumbnailImageKey"
          className="block text-sm font-medium text-gray-700"
        >
          サムネイル画像
        </label>
        <input
          type="file"
          id="thumbnailImageKey"
          accept="image/*"
          onChange={onImageChange}
          disabled={disabled}
        />
      </div>
      <div>
        <label
          htmlFor="categories"
          className="block text-sm font-medium text-gray-700"
        >
          カテゴリー
        </label>
        <CategoriesSelect
          selectedCategories={categories}
          setSelectedCategories={setCategories}
          disabled={disabled}
        />
      </div>
      <button
        type="submit"
        className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        disabled={disabled}
      >
        {mode === 'new' ? '作成' : '更新'}
      </button>
      {mode === 'edit' && (
        <button
          type="button"
          className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ml-2"
          onClick={onDelete}
          disabled={disabled}
        >
          削除
        </button>
      )}
    </form>
  )
}