"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import classes from "@/app/posts/[id]/ArticleDetail.module.css";
import type { Post } from "../../_types/types";
import Image from "next/image";

export default function Detail() {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetcher = async () => {
      setLoading(true);
      const res = await fetch(
        `https://1hmfpsvto6.execute-api.ap-northeast-1.amazonaws.com/dev/posts/${id}`,
      );
      const { post } = await res.json();
      setPost(post);
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
        <div className={classes.postImage}>
          <Image width={800} height={400} alt="" src={post.thumbnailUrl} />
        </div>
        <div className={classes.postContent}>
          <div className={classes.postInfo}>
            <div className={classes.postDate}>
              {new Date(post.createdAt).toLocaleDateString()}
            </div>
            <div className={classes.postCategories}>
              {post.categories.map((category, id) => {
                return (
                  <p key={id} className={classes.postCategory}>
                    {category}
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