import { useEffect, useState } from "react";
import Comment from "../Comment/Comment";
import { supabase } from "../../../utils/supabase";
import { useSelector } from "react-redux";
import "./CommentsList.css";

const CommentsList = ({
  passedComments,
  handleDeleteComment,
  handleRepliesClickFromRootLevel,
  isRootLevel,
  setRootLevelComments,
  setError,
  getComments,
}) => {
  const [localComments, setLocalComments] = useState(passedComments);
  const [commentWithReplyWindowID, setCommentWithReplyWindowID] = useState(null);
  const [newReplyBody, setNewReplyBody] = useState("");
  const { session } = useSelector((state) => state.auth);

  useEffect(() => {
    setLocalComments(passedComments);
  }, [passedComments]);

  async function handleReplySubmit(e, repliedComment) {
    e.preventDefault();

    try {
      const { data, error } = await supabase.rpc("add_comment", {
        p_body: newReplyBody,
        p_created_by_id: session.user.id,
        p_item_id: repliedComment.item_id,
        p_parent_id: repliedComment.id,
      });
      if (error) console.error(error);
      else console.log(data);

      console.log(data);

      setCommentWithReplyWindowID(null);
      setLocalComments(
        localComments.map((comment) => {
          return {
            ...comment,
            ...(comment.id == repliedComment.id && {
              replies: [...(comment.replies || []), data[0]],
            }),
          };
        })
      );

      setNewReplyBody("");
    } catch (error) {
      console.log(error);
      setError(error);
    }
  }

  async function handleRepliesClick(e, commentWithReplies) {
    e.preventDefault();

    const { data, error } = await supabase.rpc("get_child_comments", {
      p_item_id: commentWithReplies.item_id,
      p_parent_comment_id: commentWithReplies.id,
    });

    const updatedComments = localComments.map((comm) => {
      return {
        ...comm,
        tier: comm.tier + 1,
        ...(comm.id == commentWithReplies.id && {
          replies: data,
        }),
      };
    });

    if (isRootLevel) {
      setRootLevelComments(updatedComments);
    } else {
      setLocalComments(updatedComments);
    }
  }
  return (
    <div className="comments-list">
      {localComments.length == 0 ? (
        <p>No comments, consider starting the conversation!</p>
      ) : (
        localComments.map((comment) => {
          return (
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
            />
          );
        })
      )}
    </div>
  );
};
export default CommentsList;
