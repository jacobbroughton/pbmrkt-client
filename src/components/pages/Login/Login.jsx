import { useState } from "react";
import "./Login.css";
import LoadingOverlay from "../../ui/LoadingOverlay/LoadingOverlay";
import { Link, useNavigate } from "react-router-dom";
// import { setUser } from "../../../redux/auth";
import { useDispatch } from "react-redux";
import { supabase } from "../../../utils/supabase";
import EyeIcon from "../../ui/Icons/EyeIcon";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isResetPasswordView, setIsResetPasswordView] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);

      // const response = await fetch(`http://localhost:3001/login`, {
      //   method: "post",
      //   headers: {
      //     Accept: "application/json",
      //     "Content-Type": "application/json;charset=UTF-8",
      //     "Access-Control-Allow-Origin": "http://localhost:3000",
      //   },
      //   credentials: "include",
      //   body: JSON.stringify({
      //     username,
      //     password,
      //   }),
      // });

      // if (!response || response.status !== 200) {
      //   throw "ERROR: " + response?.statusText || "Something happened";
      // }

      // const data = await response.json();

      // if (!data) throw "There was a problem parsing login response";

      // dispatch(setUser(data.user));

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) { console.error(error); throw error.message; }

      navigate("/");
      // dispatch(setUser(data.user));
    } catch (e) {
      setLoginError(e.toString());
    }
    setLoading(false);
  }

  // function handleGoogleAuth(e) {
  //   e.preventDefault();

  //   supabase.auth.signInWithOAuth({
  //     provider: "google",
  //   });
  // }

  return (
    <div className="login">
      {loginError && <div className="error-text">{loginError}</div>}
      <h1>{isResetPasswordView ? "Reset Password" : "Login"}</h1>
      <form onSubmit={handleSubmit} className="standard">
        <p>
          Need to create an account? <Link to="/register">Register here</Link>
        </p>
        {/* <button className='google-auth-button' onClick={handleGoogleAuth} type="button">Sign in with Google</button> */}
        <div className="form-block">
          {isResetPasswordView ? (
            <>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
              </div>
            </>
          ) : (
            <>
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
                <div className='input-and-visible-toggle'>
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
            </>
          )}
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
  );
};
export default Login;
