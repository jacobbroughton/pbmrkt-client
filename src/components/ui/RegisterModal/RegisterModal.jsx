import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingOverlay } from "../../ui/LoadingOverlay/LoadingOverlay";
import { ModalOverlay } from "../../ui/ModalOverlay/ModalOverlay";
import "./RegisterModal.css";
import { useDispatch, useSelector } from "react-redux";
import { toggleModal } from "../../../redux/modals";
import { smoothScrollConfig } from "../../../utils/constants.js";
import { isValidEmail, isValidUsername } from "../../../utils/usefulFunctions";
import { CityStateFieldset } from "../../ui/CityStateFieldset/CityStateFieldset.jsx";
import { Chevron } from "../../ui/Icons/Chevron";
import { EyeIcon } from "../../ui/Icons/EyeIcon";
import { FieldErrorButtons } from "../FieldErrorButtons/FieldErrorButtons.jsx";

export const RegisterModal = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { verifyUserCheckedEmailModalToggled } = useSelector((state) => state.modals);
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
  const [usernameExists, setUsernameExists] = useState(false);
  const [usernameExistsLoading, setUsernameExistsLoading] = useState("");
  const [usernameIsInitial, setUsernameIsInitial] = useState(true);
  const [usernameHasBeenInteracted, setUsernameHasBeenInteracted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [optionalFieldsShowing, setOptionalFieldsShowing] = useState(false);
  const [markedFieldKey, setMarkedFieldKey] = useState(null);

  const emailRef = useRef(null);
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

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

      const response = await fetch("http://localhost:4000/auth/signup", {
        method: "post",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          username,
        }),
      });

      if (!response.ok) {
        throw new Error(response.statusText || "There was an error at signup");
      }

      await response.json();

      setLoading(false);
      dispatch(toggleModal({ key: "verifyUserCheckedEmailModal", value: true }));

      // dispatch(setSession(data));
      // navigate("/login");
    } catch (e) {
      setRegisterError(e.toString());
      setLoading(false);
    }
  }

  async function confirmUserCheckedTheirEmail() {
    // navigate("/login");
    dispatch(toggleModal({ key: "verifyUserCheckedEmailModal", value: false }));
    dispatch(toggleModal({ key: "registerModal", value: false }));
    dispatch(toggleModal({ key: "loginModal", value: true }));
  }

  async function checkForExistingMatchingUsername(newUsername) {
    try {
      setUsernameIsInitial(false);
      setUsernameExistsLoading(true);

      const urlSearchParams = new URLSearchParams({ username: newUsername }).toString();

      const response = await fetch(
        `http://localhost:4000/auth/check-for-existing-username/?${urlSearchParams}`
      );

      if (!response.ok) throw new Error("Something happened check-for-existing-username");

      const { data: numMatchingUsernameRecords } = await response.json();

      setUsernameExists(numMatchingUsernameRecords >= 1);
    } catch (error) {
      console.error(error);
      setRegisterError(error.toString());
    }

    setUsernameExistsLoading(false);
  }

  async function handleConfirmationEmailResend() {
    try {
      // TODO - add the functionality
      alert("Doesn't work, add functionality for handleConfirmationEmailResend")
    } catch (error) {
      console.error(error);
      setRegisterError(error.toString());
    }
  }

  const fieldErrors = [
    {
      fieldKey: "email",
      warningText: "Add a valid email",
      active: !isValidEmail(email),
      onClick: (e) => {
        e.preventDefault();
        emailRef.current.scrollIntoView(smoothScrollConfig);
      },
    },
    {
      fieldKey: "username",
      warningText: "Create your username",
      // active: !sellerName,
      active: !isValidUsername(username) || usernameExists || !username,
      onClick: (e) => {
        e.preventDefault();
        usernameRef.current.scrollIntoView(smoothScrollConfig);
      },
    },
    {
      fieldKey: "password",
      warningText: "Create your password",
      active: !password,
      onClick: (e) => {
        e.preventDefault();
        passwordRef.current.scrollIntoView(smoothScrollConfig);
      },
    },
  ];

  const submitDisabled =
    usernameExists ||
    !isValidEmail(email) ||
    !isValidUsername(username) ||
    username === "" ||
    password === "";

  return (
    <>
      <div className="modal register">
        {registerError && <div className="error-text">{registerError}</div>}
        <h1>Register</h1>
        <form onSubmit={handleSubmit} className="standard">
          <p>
            Have an account already?{" "}
            <button
              className="link-button"
              onClick={() => {
                dispatch(toggleModal({ key: "registerModal", value: false }));
                dispatch(toggleModal({ key: "loginModal", value: true }));
              }}
            >
              Sign In
            </button>
          </p>

          <div className="form-block">
            <div className="form-groups-parent">
              <div
                className={`form-group ${markedFieldKey == "email" ? "marked" : ""}`}
                ref={emailRef}
              >
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
              <div
                className={`form-group ${markedFieldKey == "username" ? "marked" : ""}`}
                ref={usernameRef}
              >
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
                    </div>
                  ) : !isValidUsername(username) ? (
                    <p className="small-text error-text">
                      Can't include these characters: {"{ }"} | \ ” % ~ # &lt; &gt;
                      [space]
                    </p>
                  ) : !usernameIsInitial ? (
                    <p className="small-text">You're good to use this username</p>
                  ) : (
                    false
                  ))}
              </div>
              <div
                className={`form-group ${markedFieldKey == "password" ? "marked" : ""}`}
                ref={passwordRef}
              >
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
            </div>
          </div>

          {/* <div className="form-block optional-fields">
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
                <fieldset>
                  <div className="form-group">
                    <label htmlFor="first-name">First Name</label>
                    <input
                      placeholder="First Name"
                      onChange={(e) => setFirstName(e.target.value)}
                      value={firstName}
                      id="first-name"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="last-name">Last Name</label>
                    <input
                      placeholder="Last Name"
                      onChange={(e) => setLastName(e.target.value)}
                      value={lastName}
                      id="last-name"
                    />
                  </div>
                </fieldset>
                <CityStateFieldset
                  state={state}
                  city={city}
                  setCity={setCity}
                  setState={setState}
                />
                <div className="form-group">
                  <label htmlFor="phone-number">Phone Number</label>
                  <input
                    placeholder="7048290000"
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    type="tel"
                    value={phoneNumber}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="last-name">About You</label>
                  <textarea
                    placeholder="Write something about you or the business this account represents"
                    onChange={(e) => setBio(e.target.value)}
                    value={bio}
                    id="bio"
                  />
                </div>
              </div>
            )}
          </div> */}

          {fieldErrors.filter((fieldError) => fieldError.active).length >= 1 && (
            <FieldErrorButtons
              fieldErrors={fieldErrors}
              setMarkedFieldKey={setMarkedFieldKey}
            />
          )}

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
      <ModalOverlay
        zIndex={6}
        onClick={() => dispatch(toggleModal({ key: "registerModal", value: false }))}
      />
    </>
  );
};
