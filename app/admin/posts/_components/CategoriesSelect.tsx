'use client'

import type { CategoriesIndexResponse } from '@/app/api/admin/categories/route'
import type { Category } from '@/app/api/admin/posts/[id]/route'
import { useEffect, useState } from 'react'

type Props = {
  selectedCategories: Category[]
  setSelectedCategories: (categories: Category[]) => void
  disabled: boolean
}

export const CategoriesSelect = ({
  selectedCategories,
  setSelectedCategories,
  disabled,
}: Props) => {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await fetch('/api/admin/categories')
      if (!response.ok) return

      const data: CategoriesIndexResponse = await response.json()
      setCategories(data.categories)
    }

    fetchCategories()
  }, [])

  const toggleCategory = (category: Category) => {
    const isSelected = selectedCategories.some(
      (selectedCategory) => selectedCategory.id === category.id,
    )

    setSelectedCategories(
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