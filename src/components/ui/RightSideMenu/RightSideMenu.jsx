import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toggleModal } from "../../../redux/modals";
import { LogOutIcon } from "../Icons/LogOutIcon";
import { useEffect, useRef, useState } from "react";
import { HomeIcon } from "../Icons/HomeIcon";
import { DollarBillIcon } from "../Icons/DollarBillIcon";
import { setLogoutLoading } from "../../../redux/loading";
import "./RightSideMenu.css";
import BugIcon from "../Icons/BugIcon";
import FeedbackIcon from "../Icons/FeedbackIcon";
import ArrowRightToBracket from "../Icons/ArrowRightToBracket";
import IDCardIcon from "../Icons/IDCardIcon";
import { ErrorBanner } from "../ErrorBanner/ErrorBanner";
import { setUser } from "../../../redux/auth";

export const RightSideMenu = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const rightSideMenuRef = useRef(null);
  const { user } = useSelector((state) => state.auth);
  const [error, setError] = useState(null);

  useEffect(() => {
    function handler(e) {
      if (
        rightSideMenuRef.current &&
        !rightSideMenuRef.current.contains(e.target) &&
        !e.target.classList.contains("right-side-menu-button")
      ) {
        dispatch(toggleModal({ key: "rightSideMenu", value: false }));
      }
    }

    window.addEventListener("click", handler);

    return () => {
      window.removeEventListener("click", handler);
    };
  });

  async function handleLogout(e) {
    e.preventDefault();

    try {
      dispatch(setLogoutLoading(true));

      const response = await fetch("http://localhost:4000/auth/logout", {
        method: "get",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(response.statusText || "There was an issue logging out");
      }

      dispatch(setUser(null));

      navigate("/");

      dispatch(toggleModal({ key: "rightSideMenu", value: false }));
    } catch (error) {
      console.error(error);
      setError(error.toString());
    }

    dispatch(setLogoutLoading(false));
  }

  return (
    <div className="right-side-menu" ref={rightSideMenuRef}>
      {error && (
        <ErrorBanner error={error.toString()} handleCloseBanner={() => setError(null)} />
      )}
      {user && (
        <Link
          to={`/user/${user.username}`}
          className={`menu-item ${location.pathname.includes("/user/") ? "current" : ""}`}
          onClick={() => dispatch(toggleModal({ key: "rightSideMenu", value: false }))}
        >
          <div className="profile-link">
            <img className="profile-image" src={user.profile_image_url} />
            <div className="info">
              <label>View Profile</label>
              <p className="user-email">{user.username}</p>
            </div>
          </div>
        </Link>
      )}
      <Link
        to={`/`}
        className={`menu-item ${location.pathname == "/" ? "current" : ""}`}
        onClick={() => dispatch(toggleModal({ key: "rightSideMenu", value: false }))}
      >
        <HomeIcon />
        <label>Home</label>
      </Link>

      <button
        className="menu-item"
        onClick={() => {
          dispatch(toggleModal({ key: "feedbackModal", value: false }));
          dispatch(toggleModal({ key: "bugModal", value: true }));
          dispatch(toggleModal({ key: "rightSideMenu", value: false }));
        }}
      >
        <BugIcon />
        <label>Report a bug</label>
      </button>
      <button
        className="menu-item"
        onClick={() => {
          dispatch(toggleModal({ key: "feedbackModal", value: true }));
          dispatch(toggleModal({ key: "bugModal", value: false }));
          dispatch(toggleModal({ key: "rightSideMenu", value: false }));
        }}
      >
        <FeedbackIcon />
        <label>Feedback</label>
      </button>
      {user && (
        <button className="menu-item logout" type="button" onClick={handleLogout}>
          <LogOutIcon />
          Logout
        </button>
      )}

      {!user && (
        <>
          <button
            className="menu-item"
            onClick={() => {
              dispatch(toggleModal({ key: "loginModal", value: true }));
              dispatch(toggleModal({ key: "rightSideMenu", value: false }));
            }}
          >
            <ArrowRightToBracket />
            Login
          </button>
          <button
            className="menu-item"
            onClick={() => {
              dispatch(toggleModal({ key: "registerModal", value: true }));
              dispatch(toggleModal({ key: "rightSideMenu", value: false }));
            }}
          >
            <IDCardIcon />
            Register
          </button>
        </>
      )}
    </div>
  );
};
