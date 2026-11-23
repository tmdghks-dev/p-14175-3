"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type PostDto = {
  id: number;
  createDate: string;
  modifyDate: string;
  title: string;
  content: string;
};

export default function Page() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<PostDto | null>(null);

  const deletePost = () => {
    if (!confirm(`${id}번 글을 삭제하시겠습니까?`)) return;

    fetch(`http://localhost:8080/api/v1/posts/${id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((rsData) => {
        alert(rsData.msg);
        router.replace("/posts");
      });
  };

  useEffect(() => {
    fetch(`http://localhost:8080/api/v1/posts/${id}`)
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          alert(data.msg);
          router.replace("/posts");
          return;
        }

        setPost(data);
      });
  }, [id, router]);

  if (post == null) return <div>로딩중...</div>;

  return (
    <>
      <h1>글 상세페이지</h1>

      <div>번호 : {post.id}</div>
      <div>제목 : {post.title}</div>
      <div style={{ whiteSpace: "pre-line" }}>{post.content}</div>

      <div className="flex gap-2">
        <button onClick={deletePost}>삭제</button>
        <Link href={`/posts/${post.id}/edit`}>수정</Link>
      </div>
    </>
  );
}
