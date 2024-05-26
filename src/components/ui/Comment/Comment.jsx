import { useSelector } from "react-redux";
import CommentsList from "../CommentsList/CommentsList";
import "./Comment.css";
import Chevron from "../Icons/Chevron";
import SendIcon from "../Icons/SendIcon";
import { getTimeAgo } from "../../../utils/usefulFunctions";

const Comment = ({
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
}) => {
  const { session } = useSelector((state) => state.auth);


  return (
    <div
      key={comment.id}
      className={`comment ${isRootLevel ? "is-root-level" : ""}`}
      // style={{marginLeft: `${comment.depth * 15}px`}}
    >
      <div className="bars-and-content">
        {/* {[...new Array(comment.depth)].map((depthIndex) => (
          <div className="depth-bar" id={depthIndex}></div>
        ))} */}
        <div className="profile-picture-container">
          <img className="profile-picture" src={comment.profile_picture_url} />
          {comment.reply_count >= 1 && comment.repliesToggled && (
            <>
              <div
                className="thread-bar-target"
                onClick={(e) => handleRepliesClick(e, comment)}
              ></div>
              <div className="thread-bar"></div>
            </>
          )}
        </div>
        <div className="comment-contents">
          <div className="comment-header">
            <p className="tiny-text bold">{comment.username}</p>{" "}
            <p
              className="tiny-text"
              title={new Date(comment.created_dttm).toLocaleString()}
            >
              {getTimeAgo(new Date(comment.created_dttm))}
            </p>
          </div>
          <p className="tiny-text">{comment.eff_status ? false : <span>DELETED</span>}</p>
          <p>{comment.eff_status ? comment.body : "DELETED"} </p>
          {comment.eff_status &&
          comment.created_by_id == session?.user.id &&
          comment.id != commentWithReplyWindowID ? (
            <div className="controls">
              <button
                className="button"
                onClick={() => {
                  setNewReplyBody("");
                  setCommentWithReplyWindowID(comment.id);
                }}
              >
                Reply
              </button>
              <button
                className="button"
                onClick={(e) => handleDeleteComment(e, comment.id)}
                type="button"
              >
                Delete
              </button>
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
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Comment;
