import { useState } from "react";
import "./BugModal.css";
import { supabase } from "../../../utils/supabase";
import { useDispatch, useSelector } from "react-redux";
import { ModalOverlay } from "../ModalOverlay/ModalOverlay";
import { toggleModal } from "../../../redux/modals";

const BugModal = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [submitLoading, setSubmitLoading] = useState(false);
  const [bugBody, setBugBody] = useState("");
  const [error, setError] = useState(null);

  async function handleSubmit() {
    try {
      setSubmitLoading(true);

      const { data, error } = await supabase.rpc("add_bug", {
        p_body: bugBody,
        p_user_id: user.auth_id,
      });

      if (error) throw error.message;

      console.log("add_bug", data);
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
          <h3>Bug</h3>
        </div>
        <div className="content">
          <form onSubmit={handleSubmit} className="standard">
            <div className="form-group">
              <textarea value={bugBody} onChange={(e) => setBugBody(e.target.value)} />
            </div>
            <button type="submit" className="button">
              Submit{submitLoading ? " (Loading)" : ""}
            </button>
          </form>
        </div>
      </div>
        <ModalOverlay
          zIndex={5}
          onClick={() => {
            dispatch(toggleModal({ key: "bugModal", value: false }));
          }}
        />
    </>
  );
};
export default BugModal;
