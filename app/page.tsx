"use client";

import classes from "@/app/Home.module.css";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { MicroCmsPost } from "./_types/MicroCmsPost";

export default function Home() {
  const [posts, setPosts] = useState<MicroCmsPost[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetcher = async () => {
      setLoading(true);
      const res = await fetch (
        "https://xsec48r4i5.microcms.io/api/v1/posts",
        {
          headers: {
            "X-MICROCMS-API-KEY": process.env.NEXT_PUBLIC_MICROCMS_API_KEY as string,
          },
        }
      );
      const {contents} = await res.json();
      setPosts(contents || []);
      setLoading(false);
    };

    fetcher();
  }, []);

  if (loading) return <div className={classes.postLoading}>読み込み中...</div>;
  if (posts.length === 0) return <p>データが存在しません</p>;

  return (
    <div>
      <ul className={classes.container}>
        {posts.map((post) => {
          return (
            <li key={post.id} className={classes.list}>
              <Link href={`/posts/${post.id}`} className={classes.link}>
                <div className={classes.post}>
                  {post.thumbnail && (
                    <div className={classes.postImage}>
                      <Image
                        src={post.thumbnail.url}
                        alt={post.title}
                        width={post.thumbnail.width || 400}
                        height={post.thumbnail.height || 300}
                      />
                    </div>
                  )}
                  <div className={classes.postContent}>
                    <div className={classes.postInfo}>
                      <div className={classes.postDate}>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </div>
                      <div className={classes.postCategories}>
                        {post.categories.map((category) => {
                          return (
                            <p key={category.id} className={classes.postCategory}>
                              {category.name}
                            </p>
                          );
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
          );
        })}
      </ul>
    </div>
  );
}