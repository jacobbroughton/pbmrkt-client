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
          <div className="profile-picture"></div>
        </div>
        <div className="comment-contents">
          <div className="comment-header">
            <p className="tiny-text bold">{comment.created_by_email}</p>{" "}
            <p className="tiny-text">{getTimeAgo(new Date(comment.created_dttm))}</p>
          </div>
          <p className="tiny-text">{comment.eff_status ? false : <span>DELETED</span>}</p>
          <p>{comment.eff_status ? comment.body : "DELETED"} </p>
          {comment.eff_status && comment.created_by_id == session?.user.id ? (
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
          {comment.reply_count >= 1 && (
            <button
              className="replies-button"
              onClick={(e) => handleRepliesClick(e, comment)}
            >
              <Chevron />
              {comment.reply_count} Replies
            </button>
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
                  className="button"
                  onClick={() => setCommentWithReplyWindowID(null)}
                >
                  Cancel
                </button>
                <button className="button" type="submit">
                  Submit <SendIcon />
                </button>
              </div>
            </form>
          ) : (
            false
          )}

          {comment.replies?.length >= 1 && (
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
