import { useSelector } from "react-redux";
import { CommentsList } from "../CommentsList/CommentsList";
import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabase";
import { SendIcon } from "../Icons/SendIcon";
import { LoginPrompt } from "../LoginPrompt/LoginPrompt";

export function ItemCommentsSection({
  itemInfo = { id: null, createdById: null },
  setError = function () {
    return null;
  },
}) {
  const { user } = useSelector((state) => state.auth);

  const [newCommentBody, setNewCommentBody] = useState("");
  const [localComments, setLocalComments] = useState(null);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [commentIdWithRepliesOpening, setCommentIdWithRepliesOpening] = useState(null);

  async function handleNewCommentSubmit(e) {
    e.preventDefault();

    try {
      if (!newCommentBody) throw "Cannot add comment, body empty";

      const { data, error } = await supabase.rpc("add_comment", {
        p_body: newCommentBody,
        p_created_by_id: user.auth_id,
        p_item_id: itemInfo.id,
        p_parent_id: null,
        p_post_type: "For Sale",
      });

      if (error) throw error.message;
      if (user.auth_id != itemInfo.id) {
        const { error: error2 } = await supabase.rpc("add_comment_notification", {
          p_message: newCommentBody,
          p_type: "Comment",
          p_url: "",
          p_item_id: itemInfo.id,
          p_comment_id: data[0].id,
          p_user_id: user.auth_id,
          p_related_user_id: itemInfo.createdById,
        });

        if (error2) throw error2.message;
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
      const { data, error } = await supabase.rpc("get_comments_experimental", {
        p_item_id: itemInfo.id,
        p_user_id: user?.auth_id,
      });

      if (error) throw error.message;

      const comments = data.map((comment) => {
        const { data: data2, error: error2 } = supabase.storage
          .from("profile_pictures")
          .getPublicUrl(comment.profile_picture_path || "placeholders/user-placeholder");

        if (error2) throw error.message;

        return {
          ...comment,
          replies: [],
          repliesToggled: false,
          profile_picture_url: data2.publicUrl,
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
      await supabase.rpc("delete_comment", {
        p_comment_id: commentId,
      });

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
      const { data, error } = await supabase.rpc("get_child_comments", {
        p_item_id: itemInfo.id,
        p_parent_comment_id: commentWithReplies.id,
        p_user_id: user?.auth_id,
        p_post_type: "For Sale",
      });

      if (error) {
        console.error(error);
        throw error.message;
      }
      const replies = data.map((comment) => {
        const { data: data2, error: error2 } = supabase.storage
          .from("profile_pictures")
          .getPublicUrl(comment.profile_picture_path || "placeholders/user-placeholder");

        if (error2) throw error.message;

        return {
          ...comment,
          profile_picture_url: data2.publicUrl,
        };
      });

      setLocalComments(
        localComments.map((comm) => {
          return {
            ...comm,
            tier: 0,
            ...(comm.id == commentWithReplies.id && {
              replies: replies,
              repliesToggled: !comm.repliesToggled,
              reply_count: replies.length,
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
