import { useState } from "react";
import "./BugModal.css";
import { supabase } from "../../../utils/supabase";
import { useDispatch, useSelector } from "react-redux";
import { ModalOverlay } from "../ModalOverlay/ModalOverlay";
import { toggleModal } from "../../../redux/modals";
import { XIcon } from "../Icons/XIcon";

const BugModal = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [submitLoading, setSubmitLoading] = useState(false);
  const [bugBody, setBugBody] = useState("");
  const [name, setName] = useState(user?.first_name + " " + user?.last_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    try {
      e.preventDefault();

      setSubmitLoading(true);

      const { data, error } = await supabase.rpc("add_bug", {
        p_body: bugBody,
        p_name: name,
        p_email: email,
        p_user_id: user.auth_id,
      });

      if (error) throw error.message;

      console.log("add_bug", data);

      setBugBody("")
    } catch (error) {
      console.log(error);
      setError(error.toString());
    }

    setSubmitLoading(false);
  }

  return (
    <>
      <div className="bug modal">
        {error && <p className="small-text error-text">{error.toString()}</p>}
        <div className="header">
          <h2>Find a bug?</h2>
          <button
            onClick={() => dispatch(toggleModal({ key: "bugModal", value: false }))}
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
              <textarea
                value={bugBody}
                onChange={(e) => setBugBody(e.target.value)}
                placeholder="Describe what happened"
              />
            </div>
            <button type="submit" className="button" disabled={!bugBody}>
              Submit{submitLoading ? " (Loading)" : ""}
            </button>
          </form>
        </div>
      </div>
      <ModalOverlay
        zIndex={6}
        onClick={() => {
          dispatch(toggleModal({ key: "bugModal", value: false }));
        }}
      />
    </>
  );
};
export default BugModal;
