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

  const modifyComment = (
    commentId: number,
    content: string,
    onSuccess: (rsData: RsData) => void,
  ) => {
    apiFetch(`/api/v1/posts/${postId}/comments/${commentId}`, {
      method: "PUT",
      body: JSON.stringify({ content }),
    })
      .then((rsData) => {
        setPostComments((prev) =>
          prev == null
            ? prev
            : prev.map((c) => (c.id == commentId ? { ...c, content } : c)),
        );
        onSuccess(rsData);
      })
      .catch(alertError);
  };

  return { postId, postComments, deleteComment, writeComment, modifyComment };
}

function PostInfo({ postState }: { postState: ReturnType<typeof usePost> }) {
  const router = useRouter();
  const { post, deletePost } = postState;

  if (post == null) return <div>로딩중...</div>;

  const handleDeletePost = () => {
    if (!confirm(`${post.id}번 글을 삭제하시겠습니까?`)) return;

    deletePost((rsData) => {
      alert(rsData.msg);
      router.replace("/posts");
    });
  };

  return (
    <>
      <div>번호 : {post.id}</div>
      <div>제목 : {post.title}</div>
      <div style={{ whiteSpace: "pre-line" }}>{post.content}</div>

      <div className="flex gap-2">
        <button onClick={handleDeletePost}>삭제</button>
        <Link href={`/posts/${post.id}/edit`}>수정</Link>
      </div>
    </>
  );
}

type PostCommentsState = ReturnType<typeof usePostComments>;

function PostCommentWrite({
  postCommentsState,
}: {
  postCommentsState: PostCommentsState;
}) {
  const { writeComment } = postCommentsState;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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

  return (
    <>
      <h2>댓글 작성</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-2">
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
    </>
  );
}

function PostCommentListItem({
  comment,
  postCommentsState,
}: {
  comment: PostCommentDto;
  postCommentsState: PostCommentsState;
}) {
  const { deleteComment, modifyComment } = postCommentsState;
  const [modifyMode, setModifyMode] = useState(false);

  const handleDelete = () => {
    if (!confirm(`${comment.id}번 댓글을 삭제하시겠습니까?`)) return;

    deleteComment(comment.id, (rsData) => alert(rsData.msg));
  };

  const handleModify = (e: React.FormEvent<HTMLFormElement>) => {
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

    modifyComment(comment.id, contentTextarea.value, (rsData) => {
      alert(rsData.msg);
      setModifyMode(false);
    });
  };

  return (
    <li>
      {comment.id} : {!modifyMode && comment.content}
      <button className="ml-2" onClick={() => setModifyMode(!modifyMode)}>
        {modifyMode ? "수정취소" : "수정"}
      </button>
      <button className="ml-2" onClick={handleDelete}>
        삭제
      </button>

      {modifyMode && (
        <form onSubmit={handleModify} className="flex flex-col gap-2 p-2">
          <textarea
            className="border p-2 rounded"
            name="content"
            placeholder="댓글 내용"
            maxLength={100}
            rows={3}
            defaultValue={comment.content}
            autoFocus
          />
          <button className="border p-2 rounded" type="submit">
            저장
          </button>
        </form>
      )}
    </li>
  );
}

function PostCommentList({
  postCommentsState,
}: {
  postCommentsState: PostCommentsState;
}) {
  const { postComments } = postCommentsState;

  return (
    <>
      <h2>댓글 목록 ({postComments?.length ?? 0})</h2>

      {postComments == null && <div>댓글 로딩중...</div>}

      {postComments != null && postComments.length == 0 && (
        <div>댓글이 없습니다.</div>
      )}

      {postComments != null && postComments.length > 0 && (
        <ul>
          {postComments.map((comment) => (
            <PostCommentListItem
              key={comment.id}
              comment={comment}
              postCommentsState={postCommentsState}
            />
          ))}
        </ul>
      )}
    </>
  );
}

function PostCommentWriteAndList({
  postCommentsState,
}: {
  postCommentsState: PostCommentsState;
}) {
  return (
    <>
      <PostCommentWrite postCommentsState={postCommentsState} />
      <PostCommentList postCommentsState={postCommentsState} />
    </>
  );
}

export default function Page() {
  const { id: idStr } = useParams<{ id: string }>();
  const id = Number(idStr);

  const postState = usePost(id);
  const postCommentsState = usePostComments(id);

  return (
    <>
      <h1>글 상세페이지</h1>

      <PostInfo postState={postState} />

      <hr className="my-4" />

      <PostCommentWriteAndList postCommentsState={postCommentsState} />
    </>
  );
}
