import { useSelector } from "react-redux";
import { CommentsList } from "../CommentsList/CommentsList";
import { useEffect, useState } from "react";
import { SendIcon } from "../Icons/SendIcon";
import { LoginPrompt } from "../LoginPrompt/LoginPrompt";
import { useNotification } from "../../../hooks/useNotification";

export function ItemCommentsSection({
  itemInfo = { id: null, createdById: null },
  setError = function () {
    return null;
  },
}) {
  const { user } = useSelector((state) => state.auth);
  const { createNotification } = useNotification();

  const [newCommentBody, setNewCommentBody] = useState("");
  const [localComments, setLocalComments] = useState(null);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [commentIdWithRepliesOpening, setCommentIdWithRepliesOpening] = useState(null);

  async function handleNewCommentSubmit(e) {
    e.preventDefault();

    try {
      if (!newCommentBody) throw "Cannot add comment, body empty";

      const response = await fetch("http://localhost:4000/add-comment", {
        method: "post",
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          body: newCommentBody,
          item_id: itemInfo.id,
          parent_id: null,
          post_type: "For Sale",
        }),
      });

      if (!response.ok)
        throw new Error("Something happened at ItemCommentsSection add-comment");

      const { data } = await response.json();

      if (user.id != itemInfo.id) {
        // await createNotification(user.id, itemInfo.createdById, data[0].id, 1);
      }

      getComments();
      setNewCommentBody("");
    } catch (error) {
      console.error(error);
      setError(error);
    }
  }

  async function getComments() {
    try {
      const urlSearchParams = new URLSearchParams({
        item_id: itemInfo.id,
        user_id: user?.id,
      }).toString();

      const response = await fetch(
        `http://localhost:4000/get-comments-experimental?${urlSearchParams}`
      );

      if (!response.ok) throw new Error("Something happened get-comments-experimental");

      const { data } = await response.json();

      const comments = data.map((comment) => {
        return {
          ...comment,
          replies: [],
          repliesToggled: false,
        };
      });

      setLocalComments(comments);
    } catch (error) {
      console.error(error);
      setError(error);
    }
  }

  async function handleDeleteComment(e, commentId) {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:4000/delete-comment", {
        method: "post",
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          comment_id: commentId,
        }),
      });

      if (!response.ok) throw new Error("Something happened at delete-comment");

      setLocalComments(
        localComments.map((comment) => {
          return {
            ...comment,
            ...(comment.id == commentId && {
              is_deleted: true,
            }),
          };
        })
      );
    } catch (error) {
      console.error(error);
      setError(error);
    }
  }

  useEffect(() => {
    getComments();
  }, [itemInfo.id]);

  async function handleRepliesClick(e, commentWithReplies) {
    e.preventDefault();
    if (!commentWithReplies.repliesToggled) {
      setCommentIdWithRepliesOpening(commentWithReplies.id);
      setRepliesLoading(true);

      const urlSearchParams = new URLSearchParams({
        item_id: itemInfo.id,
        parent_comment_id: commentWithReplies.id,
        post_type: "For Sale",
      }).toString();

      const response = await fetch(
        `http://localhost:4000/get-child-comments?${urlSearchParams}`,
        {
          method: "get",
          credentials: "include",
        }
      );

      console.log(response);

      if (!response.ok) throw new Error("Something happened get-child-comments");

      const { data } = await response.json();

      setLocalComments(
        localComments.map((comm) => {
          return {
            ...comm,
            tier: 0,
            ...(comm.id == commentWithReplies.id && {
              replies: data,
              repliesToggled: !comm.repliesToggled,
              reply_count: data.length,
            }),
          };
        })
      );
    } else {
      setCommentIdWithRepliesOpening(null);
      setLocalComments(
        localComments.map((comm) => {
          return {
            ...comm,
            tier: 0,
            ...(comm.id == commentWithReplies.id && {
              replies: [],
              repliesToggled: false,
            }),
          };
        })
      );
    }
    setRepliesLoading(false);
  }

  return (
    <div className="comments-section">
      {user ? (
        <form onSubmit={(e) => handleNewCommentSubmit(e)} className="comment-form">
          <textarea
            placeholder="Write Something"
            onChange={(e) => setNewCommentBody(e.target.value)}
            value={newCommentBody}
          />
          <button type="submit" disabled={!newCommentBody}>
            Submit <SendIcon />
          </button>
        </form>
      ) : (
        <LoginPrompt message="to leave a comment." />
      )}
      <CommentsList
        passedComments={localComments}
        handleCommentSubmit={handleNewCommentSubmit}
        handleRepliesClickFromRootLevel={handleRepliesClick}
        handleDeleteComment={handleDeleteComment}
        isRootLevel={true}
        setRootLevelComments={setLocalComments}
        setError={setError}
        getComments={getComments}
        repliesLoadingFromRootLevel={repliesLoading}
        commentIdWithRepliesOpening={commentIdWithRepliesOpening}
        postType="For Sale"
      />
    </div>
  );
}
