"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import classes from "@/app/posts/[id]/ArticleDetail.module.css";
import type { MicroCmsPost } from "../../_types/MicroCmsPost";
import Image from "next/image";

export default function Detail() {
  const { id } = useParams();
  const [post, setPost] = useState<MicroCmsPost | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetcher = async () => {
      setLoading(true);
      const res = await fetch(
        `https://xsec48r4i5.microcms.io/api/v1/posts/${id}`,
        {
          headers: {
            "X-MICROCMS-API-KEY": process.env.NEXT_PUBLIC_MICROCMS_API_KEY as string,
          },
        }
      );
      const data = await res.json();
      setPost(data);
      setLoading(false);
    };

    fetcher();
  }, [id]);

  if (loading) return <div className={classes.postLoading}>読み込み中...</div>;
  if (!post) {
    return (
      <div className={classes.postError}>記事が見つかりませんでした。</div>
    );
  }

  return (
    <div className={classes.container}>
      <div className={classes.post}>
        {post.thumbnail && (
          <div className={classes.postImage}>
            <Image
              width={post.thumbnail.width || 800}
              height={post.thumbnail.height || 400}
              alt={post.title}
              src={post.thumbnail.url}
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
    </div>
  );
}