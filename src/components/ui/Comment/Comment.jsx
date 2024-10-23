import { useDispatch, useSelector } from "react-redux";
import { CommentsList } from "../CommentsList/CommentsList";
import "./Comment.css";
import { Chevron } from "../Icons/Chevron";
import { SendIcon } from "../Icons/SendIcon";
import { getTimeAgo } from "../../../utils/usefulFunctions";
import { Link } from "react-router-dom";
import { MinusIcon } from "../Icons/MinusIcon";
import { PlusIcon } from "../Icons/PlusIcon";
import { Spinner } from "../Icons/Spinner/Spinner";
import { Arrow } from "../Icons/Arrow";
import { supabase } from "../../../utils/supabase";
import { toggleModal } from "../../../redux/modals";
import { useEffect, useState } from "react";

export const Comment = ({
  comment,
  commentWithReplyWindowID,
  setCommentWithReplyWindowID,
  handleCommentSubmit,
  setNewReplyBody,
  handleRepliesClick,
  handleDeleteComment,
  newReplyBody,
  isRootLevel,
  setRootLevelComments,
  setError,
  getComments,
  repliesLoading,
}) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [votes, setVotes] = useState(comment.votes);
  const [existingVote, setExistingVote] = useState(comment.existing_vote || null);
  const [userVote, setUserVote] = useState(comment.existing_vote || null);
  const [voteNeedsUpdate, setVoteNeedsUpdate] = useState(false);

  async function handleUpvote(e, comment) {
    try {
      if (!user) {
        dispatch(toggleModal({ key: "loginModal", value: true }));
        return;
      }

      const { data, error } = await supabase.rpc("add_comment_vote", {
        p_comment_id: comment.id,
        p_vote_direction: "Up",
        p_user_id: user?.auth_id,
      });

      if (error) throw error.message;

      setUserVote("Up");

      if (!existingVote) {
        setVotes((prevVotes) => (prevVotes += 1));
      } else if (existingVote == "Down") {
        setVotes((prevVotes) => (prevVotes += 2));
      } else if (existingVote == "Up") {
        setVotes((prevVotes) => (prevVotes -= 1));
        setUserVote(null);
      }

      const { data: data2, error: error2 } = await supabase.rpc(
        "add_comment_notification",
        {
          p_message: "Upvoted",
          p_type: "Up Vote",
          p_url: "",
          p_item_id: comment.item_id,
          p_comment_id: data[0].id,
          p_user_id: user.auth_id,
          p_related_user_id: comment.created_by_id,
        }
      );

      if (error2) throw error2.message;

      setExistingVote(data[0].vote_direction);
      setVoteNeedsUpdate(true);
    } catch (error) {
      console.error(error);
      setError(error.toString());
    }
  }

  async function handleDownvote(e, comment) {
    try {
      if (!user) {
        dispatch(toggleModal({ key: "loginModal", value: true }));
        return;
      }
      // Add reference here (ike 'to vote, you'll need to sign in)

      const { data, error } = await supabase.rpc("add_comment_vote", {
        p_comment_id: comment.id,
        p_vote_direction: "Down",
        p_user_id: user.auth_id,
      });

      if (error) throw error.message;

      if (!existingVote) {
        setVotes((prevVotes) => (prevVotes -= 1));
      } else if (existingVote == "Up") {
        setVotes((prevVotes) => (prevVotes -= 2));
      } else if (existingVote == "Down") {
        setVotes((prevVotes) => (prevVotes += 1));
        setUserVote(null);
      }

      const { data: data2, error: error2 } = await supabase.rpc(
        "add_comment_notification",
        {
          p_message: "Upvoted",
          p_type: "Down Vote",
          p_url: "",
          p_item_id: comment.item_id,
          p_comment_id: data[0].id,
          p_user_id: user.auth_id,
          p_related_user_id: comment.created_by_id,
        }
      );

      if (error2) throw error2.message;

      setExistingVote(data[0].vote_direction);
      setVoteNeedsUpdate(true);
    } catch (error) {
      console.error(error);
      setError(error.toString());
    }
  }

  return (
    <div key={comment.id} className={`comment ${isRootLevel ? "is-root-level" : ""}`}>
      <div className="bars-and-content">
        <div className="profile-picture-container">
          <Link to={`/user/${comment.username}`} className="profile-picture-link">
            <img className="profile-picture" src={comment.profile_picture_url} />
          </Link>
          {comment.reply_count >= 1 && (
            <>
              <div
                className="thread-bar-target"
                onClick={(e) => handleRepliesClick(e, comment)}
              ></div>

              <div className="thread-bar"></div>
              {repliesLoading ? (
                <Spinner />
              ) : comment.repliesToggled ? (
                <MinusIcon onClick={(e) => handleRepliesClick(e, comment)} />
              ) : (
                <PlusIcon onClick={(e) => handleRepliesClick(e, comment)} />
              )}
            </>
          )}
        </div>
        <div className="comment-contents">
          <div className="comment-header">
            <Link className="tiny-text bold" to={`/user/${comment.username}`}>
              {comment.username}
            </Link>{" "}
            <p
              className="tiny-text"
              title={new Date(comment.created_dttm).toLocaleString()}
            >
              {getTimeAgo(new Date(comment.created_dttm))}
            </p>
          </div>
          <p className={`comment-body ${comment.eff_status ? "" : "deleted"}`}>
            {comment.eff_status ? comment.body : "This comment has been deleted"}
          </p>
          {comment.id != commentWithReplyWindowID ? (
            <div className="controls">
              <div className="like-and-dislike">
                <button
                  disabled={!comment.eff_status}
                  onClick={(e) => handleUpvote(e, comment)}
                  className={`up ${existingVote == "Up" ? "selected" : ""}`}
                >
                  <Arrow direction="up" />
                </button>
                <span>{votes}</span>
                <button
                  disabled={!comment.eff_status}
                  onClick={(e) => handleDownvote(e, comment)}
                  className={`down ${existingVote == "Down" ? "selected" : ""}`}
                >
                  <Arrow direction="down" />
                </button>
              </div>
              {comment.eff_status ? (
                <>
                  <button
                    className="button"
                    onClick={() => {
                      setNewReplyBody("");
                      setCommentWithReplyWindowID(comment.id);
                    }}
                  >
                    Reply
                  </button>
                  {comment.created_by_id == user?.auth_id && (
                    <button
                      className="button"
                      onClick={(e) => handleDeleteComment(e, comment.id)}
                      type="button"
                    >
                      Delete
                    </button>
                  )}
                </>
              ) : (
                false
              )}
            </div>
          ) : (
            false
          )}

          {commentWithReplyWindowID == comment.id ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCommentSubmit(e, comment);
              }}
              className={`comment-form ${
                commentWithReplyWindowID == comment.id ? "is-reply" : ""
              }`}
            >
              <textarea
                placeholder="Add your response..."
                onChange={(e) => setNewReplyBody(e.target.value)}
                value={newReplyBody}
              />
              <div className="buttons">
                <button
                  className="cancel"
                  onClick={() => setCommentWithReplyWindowID(null)}
                >
                  Cancel
                </button>
                <button className="submit" type="submit" disabled={!newReplyBody}>
                  Submit <SendIcon />
                </button>
              </div>
            </form>
          ) : (
            false
          )}

          {comment.reply_count >= 1 && (
            <button
              className="replies-button"
              onClick={(e) => handleRepliesClick(e, comment)}
            >
              <Chevron direction={comment.repliesToggled ? "up" : "down"} />
              {comment.reply_count} Repl{comment.reply_count > 1 ? "ies" : "y"}
            </button>
          )}

          {comment.replies?.length >= 1 && comment.repliesToggled && (
            <div className="replies">
              <CommentsList
                passedComments={comment.replies}
                handleCommentSubmit={(e) => handleCommentSubmit(e, comment)}
                handleDeleteComment={handleDeleteComment}
                handleRepliesClickFromRootLevel={handleRepliesClick}
                isRootLevel={false}
                setRootLevelComments={setRootLevelComments}
                setError={setError}
                getComments={getComments}
                repliesLoadingFromRootLevel={false}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
