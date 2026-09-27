'use client'

import type { CategoriesIndexResponse } from '@/app/api/admin/categories/route'
import type { Category } from '@/app/api/admin/posts/[id]/route'
import { useFetch } from '@/app/_hooks/useFetch'

type Props = {
  selectedCategories: Category[]
  onChange: (categories: Category[]) => void
  disabled: boolean
}

export const CategoriesSelect = ({
  selectedCategories,
  onChange,
  disabled,
}: Props) => {
  const { data } = useFetch<CategoriesIndexResponse>('/api/admin/categories')
  const categories = data?.categories ?? []

  const toggleCategory = (category: Category) => {
    const isSelected = selectedCategories.some(
      (selectedCategory) => selectedCategory.id === category.id,
    )

    onChange(
      isSelected
        ? selectedCategories.filter(
            (selectedCategory) => selectedCategory.id !== category.id,
          )
        : [...selectedCategories, category],
    )
  }

  return (
    <div className="space-y-2">
      {categories.map((category) => (
        <label key={category.id} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedCategories.some(
              (selectedCategory) => selectedCategory.id === category.id,
            )}
            onChange={() => toggleCategory(category)}
            disabled={disabled}
          />
          <span>{category.name}</span>
        </label>
      ))}
    </div>
  )
}