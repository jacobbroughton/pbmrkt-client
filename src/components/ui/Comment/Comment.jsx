import { useSelector } from "react-redux";
import CommentsList from "../CommentsList/CommentsList";
import "./Comment.css";

const Comment = ({
  comment,
  commentWithReplyWindowID,
  setCommentWithReplyWindowID,
  handleCommentSubmit,
  setNewReplyBody,
  handleRepliesClick,
  handleDeleteComment,
  newReplyBody,
  // isRootLevel,
  setRootLevelComments,
  setError,
  getComments,
}) => {

  const {user} = useSelector(state => state.auth.session)

  return (
    <div
      key={comment.id}
      className="comment"
      // style={{marginLeft: `${comment.depth * 15}px`}}
    >
      <div className="bars-and-content">
        {[...new Array(comment.depth)].map((depthIndex) => (
          <div className="depth-bar" id={depthIndex}></div>
        ))}
        <div className="comment-contents">
          <p className="tiny-text">
            {comment.eff_status ? <span>{comment.created_by_email} at{" "}
            {new Date(comment.created_dttm).toLocaleString()}</span> : <span>DELETED</span>} 
          </p>
          <p>{comment.eff_status ? comment.body : "DELETED"} </p>
          {comment.eff_status && (comment.created_by_id == user.id) ? (
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
              <button className="button"  onClick={(e) => handleDeleteComment(e, comment.id)} type="button">
                Delete
              </button>
            </div>
          ) : (
            false
          )}
          {comment.reply_count >= 1 && (
            <button className="button"  onClick={(e) => handleRepliesClick(e, comment)}>
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
              <button type="submit">Submit</button>
              <button className="button"  onClick={() => setCommentWithReplyWindowID(null)}>X</button>
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
