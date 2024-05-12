import { useState } from "react";
import "./Register.css";
import LoadingOverlay from "../../ui/LoadingOverlay/LoadingOverlay";
import { Link, useNavigate } from "react-router-dom";
// import { setUser } from "../../../redux/auth";
import { useDispatch } from "react-redux";
import { supabase } from "../../../utils/supabase";
import { setSession } from "../../../redux/auth";

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  // const [firstName, setFirstName] = useState("");
  // const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);

      // const response = await fetch(`http://localhost:3001/register`, {
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

      // if (!data) throw "There was a problem parsing register response";

      // console.log("register ->", data);
      // // dispatch(setUser(data.user));
      // navigate("/");

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            // firstName,
            // lastName,
            username,
            phoneNumber,
          },
        },
      });

      // TODO - Add user to local database

      if (error) throw error.message;

      console.log("Sign up", { data, error });
      dispatch(setSession(data));
      navigate("/");
    } catch (e) {
      setRegisterError(e.toString());
      setLoading(false);
    }
  }

  // function handleGoogleAuth(e) {
  //   e.preventDefault();

  //   supabase.auth.signInWithOAuth({
  //     provider: "google",
  //   });
  // }

  const isValidEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const submitDisabled =
    !isValidEmail(email) ||
    username === "" ||
    password === "" ||
    // firstName == "" ||
    // lastName == "" ||
    phoneNumber == "";

  return (
    <div className="register">
      {registerError && <div className="register-error">{registerError}</div>}
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <p>
          Have an account already? <Link to="/login">Sign in</Link>
        </p>
        {/* <button className='google-auth-button' onClick={handleGoogleAuth} type="button">Sign in with Google</button> */}
        <div className="form-block">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
              type="email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              placeholder="Password"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="form-block">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              placeholder="Username"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
            />
          </div>
          {/* <div className="form-group">
            <label htmlFor="first-name">First Name</label>
            <input
              placeholder="First Name"
              onChange={(e) => setFirstName(e.target.value)}
              value={firstName}
            />
          </div>
          <div className="form-group">
            <label htmlFor="last-name">Last Name</label>
            <input
              placeholder="Last Name"
              onChange={(e) => setLastName(e.target.value)}
              value={lastName}
            />
          </div> */}
          <div className="form-group">
            <label htmlFor="phone-number">Phone Number</label>
            <input
              placeholder="Phone Number"
              onChange={(e) => setPhoneNumber(e.target.value)}
              type="tel"
              value={phoneNumber}
            />
          </div>
        </div>

        <button type="submit" disabled={submitDisabled}>
          Submit
        </button>
      </form>
      {loading && <LoadingOverlay message="Logging you in..." />}
    </div>
  );
};
export default Register;
