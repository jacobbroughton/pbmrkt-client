import { useEffect, useState } from "react";
import Comment from "../Comment/Comment";
import { supabase } from "../../../utils/supabase";
import { useSelector } from "react-redux";
import "./CommentsList.css";
import FrogIcon from "../Icons/FrogIcon";

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
      const { data, error } = await supabase.rpc("get_child_comments", {
        p_item_id: commentWithReplies.item_id,
        p_parent_comment_id: commentWithReplies.id,
      });

      const replies = data.map((comment) => {
        console.log(comment.profile_picture_path);
        const { data: data2, error: error2 } = supabase.storage
          .from("profile_pictures")
          .getPublicUrl(comment.profile_picture_path || "placeholders/user-placeholder");

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
    } catch (error) {
      setError(error.toString());
    }
  }
  return (
    <div className="comments-list">
      {!localComments || localComments?.length == 0 ? (
        <div className="no-comments-container">
          <p>It's too quiet here, leave a comment!</p>
          <FrogIcon/>
        </div>
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
