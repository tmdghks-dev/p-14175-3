"use client";

import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const title = form.elements.namedItem("title") as HTMLInputElement;
    const content = form.elements.namedItem("content") as HTMLTextAreaElement;

    fetch("http://localhost:8080/api/v1/posts", {
      method: "POST",
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

      router.replace(`/posts/${rsData.data.id}`);
    });
  };

  return (
    <>
      <h1>글 작성</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-2">
        <input
          className="border p-2 rounded"
          type="text"
          name="title"
          placeholder="제목"
          autoFocus
        />
        <textarea
          className="border p-2 rounded"
          name="content"
          placeholder="내용"
          rows={10}
        />
        <button className="border p-2 rounded" type="submit">
          작성
        </button>
      </form>
    </>
  );
}
