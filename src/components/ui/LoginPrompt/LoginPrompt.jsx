import { useDispatch } from "react-redux";
import { toggleModal } from "../../../redux/modals";
import "./LoginPrompt.css";

export function LoginPrompt({ message }) {
  const dispatch = useDispatch();
  return (
    <p className="login-prompt">
      <button
        className="link-button"
        onClick={() => {
          dispatch(toggleModal({ key: "loginModal", value: true }));
        }}
      >
        Login
      </button>{" "}
      or{" "}
      <button
        className="link-button"
        onClick={() => dispatch(toggleModal({ key: "registerModal", value: true }))}
      >
        Sign Up
      </button>{" "}
      {message}
    </p>
  );
}
