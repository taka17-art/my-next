"use client";

import classes from "@/app/Home.module.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Post } from "./_types/types";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetcher = async () => {
      setLoading(true);
      const res = await fetch(
        "https://1hmfpsvto6.execute-api.ap-northeast-1.amazonaws.com/dev/posts",
      );
      const data = await res.json();
      setPosts(data.posts);
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
              {/*Link= HTMLのaタグ。to=""で飛ばすパスを設定するコンポーネント。 */}
              <Link href={`/posts/${post.id}`} className={classes.link}>
                <div className={classes.post}>
                  <div className={classes.postContent}>
                    <div className={classes.postInfo}>
                      <div className={classes.postDate}>
                        {/* new Dateは文字列や数値をDateオブジェクトに変換、toDateStringはyyyy/mm/ddに変換 */}
                        {new Date(post.createdAt).toDateString()}
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
                    ></div>
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