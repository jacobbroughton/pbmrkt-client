import { LoadingOverlay } from "../../ui/LoadingOverlay/LoadingOverlay";
import { EyeIcon } from "../../ui/Icons/EyeIcon";
import { Footer } from "../../ui/Footer/Footer";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../../utils/supabase";
import "./Login.css";
import { isValidEmail } from "../../../utils/usefulFunctions";
import PageTitle from "../../ui/PageTitle/PageTitle";

export const Login = () => {
  const navigate = useNavigate();

  const [password, setPassword] = useState("password");
  const [email, setEmail] = useState("testemail@gmail.com");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await fetch("http://localhost:4000/auth/login", {
        method: "post",
        body: JSON.stringify({
          email,
          password,
        }),
        headers: {
          "content-type": "application/json",
        },
      });

      if (!response.ok)
        throw new Error(response.statusText || "There was an error logging in");

      const data = await response.json();

      console.log("Logged in", data);

      navigate("/");
    } catch (error) {
      console.error(error);
      setLoginError(error.toString());
    }
    setLoading(false);
  }

  return (
    <main className="login">
      <PageTitle title="Log In to PBMRKT" />
      <div className="login-form-container">
        {loginError && <div className="error-text">{loginError}</div>}
        <h1>Login</h1>
        <form onSubmit={handleSubmit} className="standard">
          <p>
            Need to create an account? <Link to="/register">Register here</Link>
          </p>
          <div className="form-block">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                placeholder="Email"
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-and-visible-toggle">
                <input
                  placeholder="Password"
                  type={passwordVisible ? "text" : "password"}
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                />
                <button
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  type="button"
                  className="button"
                >
                  <EyeIcon closed={passwordVisible} />
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={email === "" || password === "" || !isValidEmail(email)}
          >
            Submit
          </button>

          <p>
            <Link type="button" to={`/reset-password`}>
              Forgot password?
            </Link>
          </p>
        </form>
      </div>
      {loading && (
        <LoadingOverlay
          message="Logging you in..."
          zIndex={5}
          verticalAlignment={"center"}
        />
      )}
    </main>
  );
};
