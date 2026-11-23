"use client";

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const title = form.elements.namedItem("title") as HTMLInputElement;
    const content = form.elements.namedItem("content") as HTMLTextAreaElement;

    fetch(`http://localhost:8080/api/v1/posts/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title.value,
        content: content.value,
      }),
    }).then(async (res) => {
      const rsData = await res.json();

      alert(rsData.msg);

      if (!res.ok) return;

      router.replace(`/posts/${id}`);
    });
  };

  if (post == null) return <div>로딩중...</div>;

  return (
    <>
      <h1>{post.id}번 글 수정</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-2">
        <input
          className="border p-2 rounded"
          type="text"
          name="title"
          placeholder="제목"
          defaultValue={post.title}
          autoFocus
        />
        <textarea
          className="border p-2 rounded"
          name="content"
          placeholder="내용"
          rows={10}
          defaultValue={post.content}
        />
        <button className="border p-2 rounded" type="submit">
          수정
        </button>
      </form>
    </>
  );
}
