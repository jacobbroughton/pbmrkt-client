import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LoadingOverlay } from "../../ui/LoadingOverlay/LoadingOverlay";
import { useDispatch, useSelector } from "react-redux";
import { toggleModal } from "../../../redux/modals";
import { ModalOverlay } from "../../ui/ModalOverlay/ModalOverlay";
import "./ResetPasswordModal.css";
import { isValidEmail } from "../../../utils/usefulFunctions";

export const ResetPasswordModal = () => {
  const dispatch = useDispatch();
  const { validateResetPasswordModalToggled } = useSelector((state) => state.modals);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(null);
  const [email, setEmail] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [needsEmailSent, setNeedsEmailSent] = useState(false);

  useEffect(() => {
    return () => {
      dispatch(toggleModal({ key: "validateResetPasswordModal", value: false }));
    };
  }, []);

  useEffect(() => {
    const debounceFn = setTimeout(() => {
      if (needsEmailSent) {
        sendEmail();
      }
    }, 5000);

    return () => clearTimeout(debounceFn);
  }, [needsEmailSent]);

  async function handleRequestEmail(e) {
    try {
      e.preventDefault();
      if (!email) throw "No email was provided";

      // setLoading(true);
      setNeedsEmailSent(true);
      // navigate("/update-password");
      dispatch(toggleModal({ key: "validateResetPasswordModal", value: true }));
    } catch (error) {
      console.error(error);
      setError(error.toString());
    }
  }

  async function sendEmail() {
    try {
      setLoading(true);

      // TODO - Add functionality for this
      alert("Doesn't work, fix sendEmail()");

      setIsVerifying(true);
    } catch (error) {
      console.error(error);
      setError(error.toString());
    }

    setNeedsEmailSent(false);
    setLoading(false);
  }

  async function handleValidated() {
    dispatch(toggleModal({ key: "validateResetPasswordModal", value: false }));
    dispatch(toggleModal({ key: "resetPasswordModal", value: false }));
    dispatch(toggleModal({ key: "loginModal", value: true }));
    // navigate("/update-password");
  }

  return (
    <>
      <div className="modal reset-password">
        {error && <div className="error-text">{error}</div>}
        <h1>Reset Password</h1>
        <form onSubmit={handleRequestEmail} className="standard">
          <p>
            Need to create an account?
            <button
              onClick={() => {
                dispatch(toggleModal({ key: "resetPasswordModal", value: false }));
                dispatch(toggleModal({ key: "registerModal", value: true }));
              }}
              className="link-button"
              type="button"
            >
              Register Here
            </button>
          </p>
          <div className="form-block">
            <>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
              </div>
            </>
          </div>

          <button
            type="submit"
            disabled={email === "" || loading || !isValidEmail(email)}
          >
            Send Email
          </button>
        </form>
        {validateResetPasswordModalToggled && (
          <>
            <div className="modal is-verifying-modal">
              <p className="large-text ">Check your email</p>
              <p className="small-text">
                An email was just sent to you containing a verification button. Click
                'validate' on the email and return here or continue through the email.
              </p>
              <button onClick={handleValidated} type="button" className="button">
                Verify & Login
              </button>
            </div>
            <ModalOverlay zIndex={6} />
          </>
        )}
        {loading && <LoadingOverlay message="Sending you an email..." zIndex={5} />}
      </div>

      <ModalOverlay
        zIndex={5}
        onClick={() => dispatch(toggleModal({ key: "resetPasswordModal" }))}
      />
    </>
  );
};
