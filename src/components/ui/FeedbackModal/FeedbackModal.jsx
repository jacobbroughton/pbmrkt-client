import { useState } from "react";
import "./FeedbackModal.css";
import { supabase } from "../../../utils/supabase";
import { useDispatch, useSelector } from "react-redux";
import { ModalOverlay } from "../ModalOverlay/ModalOverlay";
import { toggleModal } from "../../../redux/modals";
import { XIcon } from "../Icons/XIcon";

const FeedbackModal = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [submitLoading, setSubmitLoading] = useState(false);
  const [feedbackBody, setFeedbackBody] = useState("");
  const [name, setName] = useState(user?.first_name + " " + user?.last_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    try {
      e.preventDefault();

      setSubmitLoading(true);

      const { data, error } = await supabase.rpc("add_feedback", {
        p_body: feedbackBody,
        p_name: name,
        p_email: email,
        p_user_id: user.auth_id,
      });

      if (error) throw error.message;

      setFeedbackBody("")

      console.log("add_feedback", data);
    } catch (error) {
      console.log(error);
      setError(error.toString());
    }

    setSubmitLoading(false);
  }

  return (
    <>
      <div className="feedback modal">
        {error && <p className="small-text error-text">{error.toString()}</p>}
        <div className="header">
          <h2>Feedback</h2>
          <button
            onClick={() => dispatch(toggleModal({ key: "feedbackModal", value: false }))}
            type="button"
            className="button close"
          >
            Close <XIcon />
          </button>
        </div>
        <div className="content">
          <form onSubmit={handleSubmit} className="standard">
            <div className="form-group">
              <label>Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Smith"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="johnsmith@gmail.com"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={feedbackBody}
                onChange={(e) => setFeedbackBody(e.target.value)}
                placeholder="Any feedback is greatly appreciated!"
              />
            </div>
            <button type="submit" className="button" disabled={!feedbackBody}>
              Submit{submitLoading ? " (Loading)" : ""}
            </button>
          </form>
        </div>
      </div>
      <ModalOverlay
        zIndex={6}
        onClick={() => {
          dispatch(toggleModal({ key: "feedbackModal", value: false }));
        }}
      />
    </>
  );
};
export default FeedbackModal;
