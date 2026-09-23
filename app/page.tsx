'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import classes from '@/app/_styles/Home.module.scss'
import { PostsIndexResponse } from './api/posts/route'


export default function Home() {
  const [posts, setPosts] = useState<PostsIndexResponse["posts"]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const fetcher = async () => {
      try {
        const res = await fetch('/api/posts')
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.message || '記事の取得に失敗しました。')
        }

        setPosts(Array.isArray(data.posts) ? data.posts : [])
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : '記事の取得に失敗しました。',
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetcher()
  }, [])

  if (isLoading) return <div>読み込み中...</div>
  if (errorMessage) return <div>{errorMessage}</div>

  return (
    <div className="">
      <div className={classes.container}>
        <ul>
          {posts.map((post) => {
            return (
              <li key={post.id} className={classes.list}>
                <Link href={`/posts/${post.id}`} className={classes.link}>
                  <div className={classes.post}>
                    <div className={classes.postContent}>
                      <div className={classes.postInfo}>
                        <div className={classes.postDate}>
                          {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                        <div className={classes.postCategories}>
                          {post.postCategories.map((postCategory) => {
                            return (
                              <div
                                key={postCategory.category.id}
                                className={classes.postCategory}
                              >
                                {postCategory.category.name}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                      <p className={classes.postTitle}>{post.title}</p>
                      <div
                        className={classes.postBody}
                        dangerouslySetInnerHTML={{ __html: post.content }}
                      />
                    </div>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}