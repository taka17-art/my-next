'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import type { Category } from '@/app/api/admin/posts/[id]/route'
import { supabase } from '@/app/_libs/supabase'
import { CategoriesSelect } from './CategoriesSelect'
import useSWR from 'swr'

export type PostFormValues = {
  title: string
  content: string
  thumbnailImageKey: string
  categories: Category[]
}

export const EMPTY_POST_FORM: PostFormValues = {
  title: '',
  content: '',
  thumbnailImageKey: '',
  categories: [],
}

interface Props {
  mode: 'new' | 'edit'
  initialValues?: PostFormValues
  onImageUpload: (file: File) => Promise<string | null>
  onSubmit: (data: PostFormValues) => Promise<void>
  onDelete?: () => void
  disabled?: boolean
}

export const PostForm = ({
  mode,
  initialValues = EMPTY_POST_FORM,
  onImageUpload,
  onSubmit,
  onDelete,
  disabled = false,
}: Props) => {
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PostFormValues>({ defaultValues: initialValues })
  const thumbnailImageKey = useWatch({ control, name: 'thumbnailImageKey' })
  const { data: thumbnailImagePreview } = useSWR(
    thumbnailImageKey
      ? ['post-thumbnail-preview', thumbnailImageKey] as const
      : null,
    async ([, imageKey]) => {
      const { data, error } = await supabase.storage
        .from('post_thumbnail')
        .createSignedUrl(imageKey, 3600)

      if (error) throw error

      return { key: imageKey, url: data.signedUrl }
    },
  )

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploadingImage(true)
    try {
      const uploadedKey = await onImageUpload(file)
      if (uploadedKey) {
        setValue('thumbnailImageKey', uploadedKey, { shouldDirty: true })
      }
    } catch (error) {
      console.error('サムネイル画像のアップロードに失敗しました:', error)
      alert('サムネイル画像のアップロードに失敗しました。')
    } finally {
      setIsUploadingImage(false)
      event.target.value = ''
    }
  }

  const isDisabled = disabled || isSubmitting || isUploadingImage

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
          aria-invalid={Boolean(errors.title)}
          {...register('title', { required: 'タイトルは必須です。' })}
          className="mt-1 block w-full rounded-md border border-gray-200 p-3"
          disabled={isDisabled}
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
        {thumbnailImagePreview?.key === thumbnailImageKey && (
          <div className="mt-2">
            <Image
              src={thumbnailImagePreview.url}
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
          aria-invalid={Boolean(errors.content)}
          {...register('content', { required: '内容は必須です。' })}
          className="mt-1 block w-full rounded-md border border-gray-200 p-3"
          disabled={isDisabled}
        />
        {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>}
      </div>
      <div>
        <label
          htmlFor="thumbnailImageFile"
          className="block text-sm font-medium text-gray-700"
        >
          サムネイル画像
        </label>
        <input type="hidden" {...register('thumbnailImageKey')} />
        <input
          type="file"
          id="thumbnailImageFile"
          accept="image/*"
          onChange={handleImageChange}
          disabled={isDisabled}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          カテゴリー
        </label>
        <Controller
          control={control}
          name="categories"
          render={({ field }) => (
            <CategoriesSelect
              selectedCategories={field.value}
              onChange={field.onChange}
              disabled={isDisabled}
            />
          )}
        />
      </div>
      <button
        type="submit"
        className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        disabled={isDisabled}
      >
        {mode === 'new' ? '作成' : '更新'}
      </button>
      {mode === 'edit' && (
        <button
          type="button"
          className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ml-2"
          onClick={onDelete}
          disabled={isDisabled}
        >
          削除
        </button>
      )}
    </form>
  )
}