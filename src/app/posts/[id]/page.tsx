"use client";

import { apiFetch } from "@/lib/backend/client";
import type { PostCommentDto, PostWithContentDto } from "@/type/post";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type RsData = { resultCode: string; msg: string };

const alertError = (error: RsData) =>
  alert(`${error.resultCode} : ${error.msg}`);

function usePost(id: number) {
  const router = useRouter();
  const [post, setPost] = useState<PostWithContentDto | null>(null);

  useEffect(() => {
    apiFetch(`/api/v1/posts/${id}`)
      .then(setPost)
      .catch((error) => {
        alertError(error);
        router.replace("/posts");
      });
  }, [id, router]);

  const deletePost = (onSuccess: (rsData: RsData) => void) => {
    apiFetch(`/api/v1/posts/${id}`, { method: "DELETE" })
      .then(onSuccess)
      .catch(alertError);
  };

  return { post, deletePost };
}

function usePostComments(postId: number) {
  const [postComments, setPostComments] = useState<PostCommentDto[] | null>(
    null,
  );

  useEffect(() => {
    apiFetch(`/api/v1/posts/${postId}/comments`)
      .then(setPostComments)
      .catch(alertError);
  }, [postId]);

  const deleteComment = (
    commentId: number,
    onSuccess: (rsData: RsData) => void,
  ) => {
    apiFetch(`/api/v1/posts/${postId}/comments/${commentId}`, {
      method: "DELETE",
    })
      .then((rsData) => {
        setPostComments((prev) =>
          prev == null ? prev : prev.filter((c) => c.id != commentId),
        );
        onSuccess(rsData);
      })
      .catch(alertError);
  };

  const writeComment = (
    content: string,
    onSuccess: (rsData: RsData) => void,
  ) => {
    apiFetch(`/api/v1/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    })
      .then((rsData) => {
        setPostComments((prev) =>
          prev == null ? [rsData.data] : [...prev, rsData.data],
        );
        onSuccess(rsData);
      })
      .catch(alertError);
  };

  return { postId, postComments, deleteComment, writeComment };
}

export default function Page() {
  const router = useRouter();
  const { id: idStr } = useParams<{ id: string }>();
  const id = Number(idStr);

  const { post, deletePost } = usePost(id);
  const { postComments, deleteComment, writeComment } = usePostComments(id);

  const handleDeletePost = () => {
    if (!confirm(`${id}번 글을 삭제하시겠습니까?`)) return;

    deletePost((rsData) => {
      alert(rsData.msg);
      router.replace("/posts");
    });
  };

  const handleDeleteComment = (commentId: number) => {
    if (!confirm(`${commentId}번 댓글을 삭제하시겠습니까?`)) return;

    deleteComment(commentId, (rsData) => alert(rsData.msg));
  };

  const handleWriteComment = (e: React.FormEvent<HTMLFormElement>) => {
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

    writeComment(contentTextarea.value, (rsData) => {
      alert(rsData.msg);
      contentTextarea.value = "";
      contentTextarea.focus();
    });
  };

  if (post == null) return <div>로딩중...</div>;

  return (
    <>
      <h1>글 상세페이지</h1>

      <div>번호 : {post.id}</div>
      <div>제목 : {post.title}</div>
      <div style={{ whiteSpace: "pre-line" }}>{post.content}</div>

      <div className="flex gap-2">
        <button onClick={handleDeletePost}>삭제</button>
        <Link href={`/posts/${post.id}/edit`}>수정</Link>
      </div>

      <h2>댓글 작성</h2>

      <form onSubmit={handleWriteComment} className="flex flex-col gap-2 p-2">
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
                onClick={() => handleDeleteComment(comment.id)}
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
