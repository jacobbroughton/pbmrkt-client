import { useState } from "react";
import "./UpdatePassword.css";
import { Link, useNavigate } from "react-router-dom";
import { LoadingOverlay } from "../../ui/LoadingOverlay/LoadingOverlay";
import PageTitle from "../../ui/PageTitle/PageTitle";

export const UpdatePassword = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    try {
      e.preventDefault();
      setLoading(true);

      // todo -- add update password functionality http

      alert("Doesn't do anything, add update password functionality")
      // navigate("/update-password");
    } catch (error) {
      console.error(error);
      setError(error.toString());
    }
    setLoading(false);
  }

  return (
    <main className="reset-password">
      <PageTitle title="Update password" />
      {error && <div className="error-text">{error}</div>}
      <h1>Reset Password</h1>
      <form onSubmit={handleSubmit} className="standard">
        <p>
          Need to create an account? <Link to="/register">Register here</Link>
        </p>
        <div className="form-block">
          <>
            <div className="form-group">
              <label htmlFor="email">New Password</label>
              <input
                placeholder="New Password"
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </>
        </div>

        <button type="submit" disabled={newPassword === "" || loading}>
          Submit
        </button>
      </form>
      {loading && <LoadingOverlay message="Updating your password..." />}
    </main>
  );
};
