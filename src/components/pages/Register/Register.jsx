import { useEffect, useState } from "react";
import "./Register.css";
import LoadingOverlay from "../../ui/LoadingOverlay/LoadingOverlay";
import ModalOverlay from "../../ui/ModalOverlay/ModalOverlay";
import { Link, useNavigate } from "react-router-dom";
// import { setUser } from "../../../redux/auth";
import { useDispatch, useSelector } from "react-redux";
import { supabase } from "../../../utils/supabase";
import { setSession } from "../../../redux/auth";
import EyeIcon from "../../ui/Icons/EyeIcon";
import Chevron from "../../ui/Icons/Chevron";
import { toggleModal } from "../../../redux/modals";
import { states, statesAndCities } from "../../../utils/statesAndCities.js";
import { capitalizeWords } from "../../../utils/usefulFunctions.js";
import Footer from "../../ui/Footer/Footer.jsx";
import SortIcon from "../../ui/Icons/SortIcon.jsx";
import CityStateFieldset from "../../ui/CityStateFieldset/CityStateFieldset.jsx";

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { verifyUserCheckedEmailModalToggled } =
    useSelector((state) => state.modals);
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [usernameExists, setUsernameExists] = useState(0);
  const [usernameExistsLoading, setUsernameExistsLoading] = useState("");
  const [usernameIsInitial, setUsernameIsInitial] = useState(true);
  const [usernameHasBeenInteracted, setUsernameHasBeenInteracted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [optionalFieldsShowing, setOptionalFieldsShowing] = useState(false);
  const [human, setHuman] = useState("");

  useEffect(() => {
    const debounceFn = setTimeout(() => {
      if (username == "" && usernameIsInitial) return;

      checkForExistingMatchingUsername(username);
    }, 1500);

    return () => clearTimeout(debounceFn);
  }, [username]);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            phoneNumber,
          },
        },
      });

      if (error) {
        console.error(error);
        throw error.message;
      }
      if (!data) throw "no data after signup";

      const user = data.user;

      const { error: error2 } = await supabase.rpc("add_user", {
        p_generated_id: user.id,
        p_email: user.email,
        p_username: username,
        p_phone_number: phoneNumber,
        p_first_name: firstName,
        p_last_name: lastName,
        p_state: state,
        p_city: city,
        p_bio: bio,
      });

      if (error2) throw error2.message;

      dispatch(toggleModal({ key: "verifyUserCheckedEmailModal", value: true }));

      // dispatch(setSession(data));
      // navigate("/login");
    } catch (e) {
      setRegisterError(e.toString());
      setLoading(false);
    }
  }

  async function confirmUserCheckedTheirEmail() {
    navigate("/login");
    dispatch(toggleModal({ key: "verifyUserCheckedEmailModal", value: true }));
  }

  async function checkForExistingMatchingUsername(newUsername) {
    try {
      setUsernameIsInitial(false);
      setUsernameExistsLoading(true);

      const { data, error } = await supabase.rpc("check_for_existing_username", {
        p_username: newUsername,
      });

      if (error) {
        console.error(error);
        throw error.message;
      }

      setUsernameExists(data);
    } catch (error) {
      setRegisterError(error.toString());
    }

    setUsernameExistsLoading(false);
  }

  async function handleConfirmationEmailResend() {
    try {
      console;
      const { data, error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `https://pbmrkt.onrender.com/`,
        },
      });
      if (error) throw error.message;

      console.log("resend email", data);
    } catch (error) {
      console.error(error);
      setRegisterError(error.toString());
    }
  }

  const isValidEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  // { } | \ ” % ~ # < >
  const isValidUsername = (username) => {
    return !String(username).match(/\.|[{]|[}]|\||\\|["]|[%]|[~]|[#]|[<]|[>]/g);
  };

  const submitDisabled =
    !isValidEmail(email) ||
    !isValidUsername(username) ||
    username === "" ||
    password === "" ||
    password.length <= 6; //|| phoneNumber == "";

  return (
    <>
      <div className="register">
        {registerError && <div className="error-text">{registerError}</div>}
        <h1>Register</h1>
        <form onSubmit={handleSubmit} className="standard">
          <p>
            Have an account already? <Link to="/login">Sign in</Link>
          </p>

          <div className="form-block">
            <div className="form-groups-parent">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  placeholder="Email"
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (!usernameHasBeenInteracted)
                      setUsername(e.target.value.split("@")[0].replace(".", "_"));
                  }}
                  type="email"
                />
                {email == "" ? (
                  <p className="small-text">Email field can't be empty</p>
                ) : !isValidEmail(email) ? (
                  <p className="error-text small-text">Not a valid email</p>
                ) : (
                  false
                )}
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-and-visible-toggle">
                  <input
                    placeholder="Password"
                    type={passwordVisible ? "text" : "password"}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
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
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  placeholder="Username"
                  onChange={(e) => {
                    // setUsernameIsInitial(true);
                    setUsername(e.target.value);
                    // checkForExistingMatchingUsername(e.target.value);
                  }}
                  onClick={() => setUsernameHasBeenInteracted(true)}
                  onFocus={() => setUsernameHasBeenInteracted(true)}
                  value={username}
                />
                {!loading &&
                  (usernameExistsLoading ? (
                    <p className="small-text">Checking if this username exists...</p>
                  ) : usernameExists == 1 ? (
                    <div>
                      <p className="small-text error-text">
                        This username is already attached to an account{" "}
                      </p>
                      {/* <button className="button">Options</button> */}
                    </div>
                  ) : !isValidUsername(username) ? (
                    <p className="small-text error-text">
                      Can't include these characters: {"{ }"} | \ ” % ~ # &lt; &gt;
                    </p>
                  ) : !usernameIsInitial ? (
                    <p className="small-text">You're good to use this username</p>
                  ) : (
                    false
                  ))}
              </div>
              <div className="form-group">
                <label htmlFor="username">Human?</label>
                <input
                  placeholder="...?"
                  onChange={(e) => {
                    // setUsernameIsInitial(true);
                    setHuman(e.target.value);
                    // checkForExistingMatchingUsername(e.target.value);
                  }}
                  value={human}
                />
                human?
              </div>
            </div>
          </div>

          <div className="form-block optional-fields">
            <button
              type="button"
              className={`optional-fields-toggle ${
                optionalFieldsShowing ? "toggled" : ""
              }`}
              onClick={() => setOptionalFieldsShowing(!optionalFieldsShowing)}
            >
              <div className="optional-fields-instructions">
                <p>{optionalFieldsShowing ? "Hide" : "Show"} Optional Fields </p>
                <p>You can fill these out later from your profile.</p>
              </div>

              <Chevron direction={optionalFieldsShowing ? "up" : "down"} />
            </button>

            {optionalFieldsShowing && (
              <div className="form-groups-parent">
                <div className="form-group">
                  <label htmlFor="phone-number">
                    Phone Number (Optional, required for selling. Can add later)
                  </label>
                  <input
                    placeholder="Phone Number"
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    type="tel"
                    value={phoneNumber}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="first-name">First Name (Optional)</label>
                  <input
                    placeholder="First Name"
                    onChange={(e) => setFirstName(e.target.value)}
                    value={firstName}
                    id="first-name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="last-name">Last Name (Optional)</label>
                  <input
                    placeholder="Last Name"
                    onChange={(e) => setLastName(e.target.value)}
                    value={lastName}
                    id="last-name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="last-name">About You (Optional)</label>
                  <textarea
                    placeholder="About You"
                    onChange={(e) => setBio(e.target.value)}
                    value={bio}
                    id="bio"
                  />
                </div>

                <CityStateFieldset />
              </div>
            )}
          </div>

          <button type="submit" disabled={submitDisabled}>
            Submit
          </button>
        </form>
        {verifyUserCheckedEmailModalToggled && (
          <>
            <div className="modal confirm-email">
              <p className="large-text ">Check your email</p>
              <p className="small-text">
                An email was just sent to you containing a confirmation link. Click
                'confirm my email' and return here or continue through the email.
              </p>
              <button onClick={confirmUserCheckedTheirEmail} className="confirm-button">
                I have confirmed my email
              </button>
              <div className="resend-email-container">
                <p className="small-text">Didn't get an email?</p>
                <button onClick={handleConfirmationEmailResend}>Resend email</button>
              </div>
            </div>
            <ModalOverlay zIndex={4} />
          </>
        )}

        {loading && (
          <LoadingOverlay
            message={verifyUserCheckedEmailModalToggled ? "" : "Creating your account"}
          />
        )}
      </div>

      {/* <Footer marginTop={200} /> */}
    </>
  );
};
export default Register;
