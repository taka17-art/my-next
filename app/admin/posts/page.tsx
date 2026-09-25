'use client'

import { PostIndexResponse } from '@/app/api/admin/posts/route'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSupabaseSession } from '@/app/_hooks/useSupabaseSession'

export default function Page() {
  const [posts, setPosts] = useState<PostIndexResponse['posts']>([])

  const { token } = useSupabaseSession()

  useEffect(() => {
    if (!token) return

    const fetcher = async () => {
      const res = await fetch('/api/admin/posts', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) return

      const { posts }: PostIndexResponse = await res.json()
      setPosts([...posts])
    }

    fetcher()
  }, [token])

  return (
    <div className="">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-bold">記事一覧</h1>
        <Link
          href="/admin/posts/new"
          className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
        >
          新規作成
        </Link>
      </div>

      <div className="">
        {posts.map((post) => {
          return (
            <Link href={`/admin/posts/${post.id}`} key={post.id}>
              <div className="border-b border-gray-300 p-4 hover:bg-gray-100 cursor-pointer">
                <div className="text-xl font-bold">{post.title}</div>
                <div className="text-gray-500">
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}