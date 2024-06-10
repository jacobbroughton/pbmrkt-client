import LoadingOverlay from "../../ui/LoadingOverlay/LoadingOverlay";
import EyeIcon from "../../ui/Icons/EyeIcon";
import Footer from "../../ui/Footer/Footer";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../../utils/supabase";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error(error);
        throw error.message;
      }

      console.log("Signed in", data);

      // TODO - Check for user in tbl_user, decline with support message
      const { data: data2, error: error2 } = await supabase.rpc(
        "check_for_user_in_local_db",
        {
          p_user_id: data.user.id,
        }
      );

      if (error2) throw error2.message;

      if (data2 == 0)
        throw "There was a problem finding the user account you are trying to access.";

      navigate("/");
    } catch (error) {
      console.error(error);
      setLoginError(error.toString());
    }
    setLoading(false);
  }

  return (
    <>
      <div className="login">
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
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-and-visible-toggle">
                <input
                  placeholder="Password"
                  type={passwordVisible ? "text" : "password"}
                  onChange={(e) => setPassword(e.target.value)}
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

          <button type="submit" disabled={email === "" || password === ""}>
            Submit
          </button>

          <p>
            <Link type="button" to={`/reset-password`}>
              Forgot password?
            </Link>
          </p>
        </form>
        {loading && <LoadingOverlay message="Logging you in..." />}
      </div>
      <Footer />
    </>
  );
};
export default Login;
