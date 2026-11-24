"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/backend/client";
import type { PostCommentDto, PostWithContentDto } from "@/type/post";


export default function Page() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<PostWithContentDto | null>(null);
  const [postComments, setPostComments] = useState<PostCommentDto[] | null>(
    null,
  );

  const deletePost = () => {
    if (!confirm(`${id}번 글을 삭제하시겠습니까?`)) return;

    apiFetch(`/api/v1/posts/${id}`, { method: "DELETE" })
      .then((rsData) => {
        alert(rsData.msg);
        router.replace("/posts");
      })
      .catch((error) => alert(`${error.resultCode} : ${error.msg}`));
  };

  const deleteComment = (commentId: number) => {
    if (!confirm(`${commentId}번 댓글을 삭제하시겠습니까?`)) return;

    apiFetch(`/api/v1/posts/${id}/comments/${commentId}`, { method: "DELETE" })
      .then((rsData) => {
        alert(rsData.msg);
        setPostComments((prev) =>
          prev == null
            ? prev
            : prev.filter((comment) => comment.id != commentId),
        );
      })
      .catch((error) => alert(`${error.resultCode} : ${error.msg}`));
  };

  const writeComment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const contentTextarea = form.elements.namedItem(
      "content",
    ) as HTMLTextAreaElement;

    contentTextarea.value = contentTextarea.value.trim();
    if (contentTextarea.value.length < 2) {
      alert("댓글을 2자 이상 입력해주세요.");
      contentTextarea.focus();
      return;
    }

    apiFetch(`/api/v1/posts/${id}/comments`, {
      method: "POST",
      body: JSON.stringify({ content: contentTextarea.value }),
    })
      .then((rsData) => {
        alert(rsData.msg);
        setPostComments((prev) =>
          prev == null ? [rsData.data] : [...prev, rsData.data],
        );
        contentTextarea.value = "";
        contentTextarea.focus();
      })
      .catch((error) => alert(`${error.resultCode} : ${error.msg}`));
  };

  useEffect(() => {
    apiFetch(`/api/v1/posts/${id}`)
      .then(setPost)
      .catch((error) => {
        alert(`${error.resultCode} : ${error.msg}`);
        router.replace("/posts");
      });

    apiFetch(`/api/v1/posts/${id}/comments`).then(setPostComments);
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
          maxLength={100}
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
