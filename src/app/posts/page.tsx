"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type PostDto = {
  id: number;
  createDate: string;
  modifyDate: string;
  title: string;
  content: string;
};

export default function Page() {
  const [posts, setPosts] = useState<PostDto[]>([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/v1/posts")
      .then((res) => res.json())
      .then(setPosts);
  }, []);

  return (
    <>
      <h1>글 목록</h1>

      <div>
        <Link href="/posts/write">글 작성</Link>
      </div>

      {posts.length == 0 && <div>로딩중...</div>}

      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <Link href={`/posts/${post.id}`}>
              {post.id} : {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
