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
import { useNotification } from "../../../hooks/useNotification";
import { DeleteModal } from "../DeleteModal/DeleteModal";

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
  postType,
}) => {
  const { user } = useSelector((state) => state.auth);
  const { deleteModalToggled } = useSelector((state) => state.modals);
  const dispatch = useDispatch();

  const [votes, setVotes] = useState(comment.votes);
  const [existingVote, setExistingVote] = useState(comment.existing_vote || null);
  const [userVote, setUpdatedVote] = useState(comment.existing_vote || null);
  const [voteNeedsUpdate, setVoteNeedsUpdate] = useState(false);

  const { createNotification } = useNotification();

  async function handleUpvote(e, comment) {
    let initialVote = existingVote;

    try {
      if (!user) {
        dispatch(toggleModal({ key: "loginModal", value: true }));
        return;
      }

      const response2 = await fetch("http://localhost:4000/add-comment-vote", {
        method: "post",
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          comment_id: comment.id,
          vote_direction: "Up",
          user_id: user?.auth_id,
        }),
      });

      if (!response2.ok) throw new Error("Something happened at add-comment-vote");

      setUpdatedVote("Up");

      if (!existingVote) {
        setVotes((prevVotes) => (prevVotes += 1));
      } else if (existingVote == "Down") {
        setVotes((prevVotes) => (prevVotes += 2));
      } else if (existingVote == "Up") {
        setVotes((prevVotes) => (prevVotes -= 1));
        setUpdatedVote(null);
      }

      const commentId = data[0].id;

      await createNotification(user.auth_id, comment.created_by_id, commentId, 3);

      setExistingVote(data[0].vote_direction);
      setVoteNeedsUpdate(true);
    } catch (error) {
      console.error(error);
      setError(error.toString());
    }
  }

  async function handleDownvote(e, comment) {
    let initialVote = existingVote;

    try {
      if (!user) {
        dispatch(toggleModal({ key: "loginModal", value: true }));
        return;
      }

      // Add reference here (ike 'to vote, you'll need to sign in)

      const response2 = await fetch("http://localhost:4000/add-comment-vote", {
        method: "post",
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          comment_id: comment.id,
          vote_direction: "Down",
          user_id: user?.auth_id,
        }),
      });

      if (!response2.ok) throw new Error("Something happened at add-comment-vote");

      if (!existingVote) {
        setVotes((prevVotes) => (prevVotes -= 1));
      } else if (existingVote == "Up") {
        setVotes((prevVotes) => (prevVotes -= 2));
      } else if (existingVote == "Down") {
        setVotes((prevVotes) => (prevVotes += 1));
        setUpdatedVote(null);
      }

      const commentId = data[0].id;

      await createNotification(user.auth_id, comment.created_by_id, commentId, 4);

      setExistingVote(data[0].vote_direction);
      setVoteNeedsUpdate(true);
    } catch (error) {
      console.error(error);
      setError(error.toString());
    }
  }

  return (
    <div
      key={comment.id}
      className={`comment ${comment.is_deleted ? "deleted" : ""} ${
        isRootLevel ? "is-root-level" : ""
      }`}
    >
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
          <p className="comment-body">
            {comment.is_deleted ? "This comment has been deleted" : comment.body}
          </p>
          {comment.id != commentWithReplyWindowID ? (
            <div className="controls">
              <div className="like-and-dislike">
                <button
                  disabled={comment.is_deleted}
                  onClick={(e) => handleUpvote(e, comment)}
                  className={`up ${existingVote == "Up" ? "selected" : ""}`}
                >
                  <Arrow direction="up" />
                </button>
                <span>{votes}</span>
                <button
                  disabled={comment.is_deleted}
                  onClick={(e) => handleDownvote(e, comment)}
                  className={`down ${existingVote == "Down" ? "selected" : ""}`}
                >
                  <Arrow direction="down" />
                </button>
              </div>
              {!comment.is_deleted ? (
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
                      // onClick={(e) => handleDeleteComment(e, comment.id)}
                      onClick={(e) =>
                        dispatch(toggleModal({ key: "deleteModal", value: true }))
                      }
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
                postType={postType}
              />
            </div>
          )}
        </div>
      </div>
      {deleteModalToggled && (
        <DeleteModal
          label="Delete this comment?"
          // deleteLoading={deleteItemLoading}
          handleDeleteClick={async () => {
            try {
              console.log("delete comment, this block doesn't do anything");
            } catch (error) {
              console.error(error);
            }
          }}
        />
      )}
    </div>
  );
};
