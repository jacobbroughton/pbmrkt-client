import { useState } from "react";
import "./BugModal.css";
import { supabase } from "../../../utils/supabase";
import { useDispatch, useSelector } from "react-redux";
import { ModalOverlay } from "../ModalOverlay/ModalOverlay";
import { toggleModal } from "../../../redux/modals";
import { XIcon } from "../Icons/XIcon";
import { ErrorBanner } from "../ErrorBanner/ErrorBanner";

const BugModal = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [submitLoading, setSubmitLoading] = useState(false);
  const [bugBody, setBugBody] = useState("");
  const [name, setName] = useState(user ? user.first_name + " " + user.last_name : "");
  const [email, setEmail] = useState(user?.email || "");
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    try {
      e.preventDefault();

      setSubmitLoading(true);

      const response = await fetch("http://localhost:4000/add-bug", {
        method: "post",
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          body: bugBody,
          name: name,
          email: email,
          user_id: user?.auth_id,
        }),
      });

      if (!response.ok) throw new Error("Something happened at add-bug");

      await response.json();

      setBugBody("");
    } catch (error) {
      console.error(error);
      setError(error.toString());
    }

    setSubmitLoading(false);
  }

  return (
    <>
      <div className="bug modal">
        {error && (
          <ErrorBanner
            error={error.toString()}
            handleCloseBanner={() => setError(null)}
          />
        )}
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
              <label>Description</label>
              <textarea
                value={bugBody}
                onChange={(e) => setBugBody(e.target.value)}
                placeholder="Describe what happened"
              />
            </div>
            <div className="form-group">
              <label>Name (Optional)</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Smith"
              />
            </div>
            <div className="form-group">
              <label>Email (Optional)</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="johnsmith@gmail.com"
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
