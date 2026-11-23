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

type PostCommentDto = {
  id: number;
  createDate: string;
  modifyDate: string;
  content: string;
};

export default function Page() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<PostDto | null>(null);
  const [postComments, setPostComments] = useState<PostCommentDto[] | null>(
    null,
  );

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

  const deleteComment = (commentId: number) => {
    if (!confirm(`${commentId}번 댓글을 삭제하시겠습니까?`)) return;

    fetch(`http://localhost:8080/api/v1/posts/${id}/comments/${commentId}`, {
      method: "DELETE",
    })
      .then(async (res) => {
        const rsData = await res.json();

        alert(rsData.msg);

        if (!res.ok) return;

        setPostComments((prev) =>
          prev == null
            ? prev
            : prev.filter((comment) => comment.id != commentId),
        );
      });
  };

  const writeComment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const content = form.elements.namedItem("content") as HTMLTextAreaElement;

    fetch(`http://localhost:8080/api/v1/posts/${id}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: content.value,
      }),
    }).then(async (res) => {
      const rsData = await res.json();

      alert(rsData.msg);

      if (!res.ok) return;

      setPostComments((prev) =>
        prev == null ? [rsData.data] : [...prev, rsData.data],
      );
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

    fetch(`http://localhost:8080/api/v1/posts/${id}/comments`)
      .then((res) => res.json())
      .then(setPostComments);
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

      <h2>댓글 작성</h2>

      <form onSubmit={writeComment} className="flex flex-col gap-2 p-2">
        <textarea
          className="border p-2 rounded"
          name="content"
          placeholder="댓글 내용"
          rows={3}
        />
        <button className="border p-2 rounded" type="submit">
          작성
        </button>
      </form>

      <h2>댓글 목록 ({postComments?.length ?? 0})</h2>

      {postComments == null && <div>댓글 로딩중...</div>}

      {postComments != null && postComments.length == 0 && (
        <div>댓글이 없습니다.</div>
      )}

      {postComments != null && postComments.length > 0 && (
        <ul>
          {postComments.map((comment) => (
            <li key={comment.id}>
              {comment.id} : {comment.content}
              <button
                className="ml-2"
                onClick={() => deleteComment(comment.id)}
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
