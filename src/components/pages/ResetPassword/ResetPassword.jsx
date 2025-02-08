import { useEffect, useState } from "react";
import "./ResetPassword.css";
import { Link, useNavigate } from "react-router-dom";
import { LoadingOverlay } from "../../ui/LoadingOverlay/LoadingOverlay";
import { useDispatch, useSelector } from "react-redux";
import { toggleModal } from "../../../redux/modals";
import { ModalOverlay } from "../../ui/ModalOverlay/ModalOverlay";
import PageTitle from "../../ui/PageTitle/PageTitle";

export const ResetPassword = () => {
  const dispatch = useDispatch();
  const { validateResetPasswordModalToggled } = useSelector((state) => state.modals);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(null);
  const [email, setEmail] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      dispatch(toggleModal({ key: "validateResetPasswordModal", value: false }));
    };
  }, []);

  async function handleRequestEmail(e) {
    try {
      e.preventDefault();
      setLoading(true);

      setIsVerifying(true);
      dispatch(toggleModal({ key: "validateResetPasswordModal", value: true }));
    } catch (error) {
      console.error(error);
      setError(error.toString());
    }
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }

  async function handleValidated() {
    dispatch(toggleModal({ key: "validateResetPasswordModal", value: false }));
    navigate("/update-password");
  }

  return (
    <main>
      <PageTitle title="Reset Password" />
      <div className="reset-password">
        {error && <div className="error-text">{error}</div>}
        <h1>Reset Password</h1>
        <form onSubmit={handleRequestEmail} className="standard">
          <p>
            Need to create an account? <Link to="/register">Register here</Link>
          </p>
          <div className="form-block">
            <>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
              </div>
            </>
          </div>

          <button type="submit" disabled={email === "" || loading}>
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
                Verify
              </button>
            </div>
            <ModalOverlay zIndex={5} />
          </>
        )}
        {loading && <LoadingOverlay message="Sending you an email..." zIndex={5} />}
      </div>
    </main>
  );
};
