import { useEffect, useState } from "react";
import { Comment } from "../Comment/Comment";
import { supabase } from "../../../utils/supabase";
import { useSelector } from "react-redux";
import { CommentsIcon } from "../Icons/CommentsIcon";
import "./CommentsList.css";

export const CommentsList = ({
  passedComments,
  handleDeleteComment,
  handleRepliesClickFromRootLevel,
  isRootLevel,
  setRootLevelComments,
  setError,
  getComments,
  repliesLoadingFromRootLevel,
  commentIdWithRepliesOpening,
  postType,
}) => {
  const [localComments, setLocalComments] = useState(passedComments);
  const [commentWithReplyWindowID, setCommentWithReplyWindowID] = useState(null);
  const [newReplyBody, setNewReplyBody] = useState("");
  const [repliesLoading, setRepliesLoading] = useState(false);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    setLocalComments(passedComments);
  }, [passedComments]);

  async function handleReplySubmit(e, repliedComment) {
    e.preventDefault();

    try {
      const { data, error } = await supabase.rpc("add_comment", {
        p_body: newReplyBody,
        p_created_by_id: user.auth_id,
        p_item_id: repliedComment.item_id,
        p_parent_id: repliedComment.id,
      });

      if (error) throw error.message;

      const { data: data3, error: error3 } = supabase.storage
        .from("profile_pictures")
        .getPublicUrl(data[0].profile_picture_path || "placeholders/user-placeholder");

      data[0] = {
        ...data[0],
        profile_picture_url: data3.publicUrl,
      };

      if (error3) throw error.message;

      if (repliedComment.created_by_id != user.auth_id) {
        const { data: data2, error: error2 } = await supabase.rpc(
          "add_comment_notification",
          {
            p_message: newReplyBody,
            p_type: "Reply",
            p_url: "",
            p_item_id: repliedComment.item_id,
            p_comment_id: data[0].id,
            p_user_id: user.auth_id,
            p_related_user_id: repliedComment.created_by_id,
          }
        );

        if (error2) throw error2.message;
      }

      setCommentWithReplyWindowID(null);
      setLocalComments(
        localComments.map((comment) => {
          return {
            ...comment,
            ...(comment.id == repliedComment.id && {
              replies: [...(comment.replies || []), data[0]],
              reply_count: comment.reply_count ? comment.reply_count + 1 : 1,
            }),
          };
        })
      );

      setNewReplyBody("");
    } catch (error) {
      console.error(error);
      setError(error.toString());
    }
  }

  async function handleRepliesClick(e, commentWithReplies) {
    e.preventDefault();
    try {
      if (!commentWithReplies.repliesToggled) {
        setRepliesLoading(true);
        const { data, error } = await supabase.rpc("get_child_comments", {
          p_item_id: commentWithReplies.item_id,
          p_parent_comment_id: commentWithReplies.id,
          p_post_type,
        });

        const replies = data.map((comment) => {
          const { data: data2, error: error2 } = supabase.storage
            .from("profile_pictures")
            .getPublicUrl(
              comment.profile_picture_path || "placeholders/user-placeholder"
            );

          if (error2) throw error.message;

          return {
            ...comment,
            profile_picture_url: data2.publicUrl,
          };
        });

        if (error) throw error.message;

        const updatedComments = localComments.map((comm) => {
          return {
            ...comm,
            tier: comm.tier + 1,
            ...(comm.id == commentWithReplies.id && {
              replies: replies,
              repliesToggled: !comm.repliesToggled,
            }),
          };
        });

        if (isRootLevel) {
          setRootLevelComments(updatedComments);
        } else {
          setLocalComments(updatedComments);
        }
      } else {
        const updatedComments = localComments.map((comm) => {
          return {
            ...comm,
            tier: comm.tier + 1,
            ...(comm.id == commentWithReplies.id && {
              replies: [],
              repliesToggled: !comm.repliesToggled,
            }),
          };
        });

        setLocalComments(updatedComments);
      }
    } catch (error) {
      console.error(error);
      setError(error.toString());
    }

    setRepliesLoading(false);
  }
  return (
    <div className={`comments-list ${isRootLevel ? "is-root-level" : ""}`}>
      {!localComments || localComments?.length == 0 ? (
        <div className="no-comments-container">
          <CommentsIcon />
          <p>No Comments Yet</p>
          <p>Be the first to share what you think!</p>
        </div>
      ) : (
        localComments.map((comment) => {
          return (
            <>
              <Comment
                comment={comment}
                commentWithReplyWindowID={commentWithReplyWindowID}
                setCommentWithReplyWindowID={setCommentWithReplyWindowID}
                handleCommentSubmit={(e) => handleReplySubmit(e, comment)}
                setNewReplyBody={setNewReplyBody}
                handleRepliesClick={
                  isRootLevel ? handleRepliesClickFromRootLevel : handleRepliesClick
                }
                handleDeleteComment={handleDeleteComment}
                newReplyBody={newReplyBody}
                isRootLevel={isRootLevel}
                setRootLevelComments={setRootLevelComments}
                getComments={getComments}
                setError={setError}
                repliesLoading={
                  isRootLevel
                    ? commentIdWithRepliesOpening == comment.id &&
                      repliesLoadingFromRootLevel
                    : repliesLoading
                }
                postType={postType}
              />
            </>
          );
        })
      )}
    </div>
  );
};
