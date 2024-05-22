import { useDispatch, useSelector } from "react-redux";
import "./RightSideMenu.css";
import { Link, useNavigate } from "react-router-dom";
import { toggleModal } from "../../../redux/modals";
import { supabase } from "../../../utils/supabase";
import LogOutIcon from "../Icons/LogOutIcon";
import { useEffect, useRef, useState } from "react";

const RightSideMenu = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const rightSideMenuRef = useRef(null);
  const { session } = useSelector((state) => state.auth);
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
      const { data, error } = await supabase.auth.signOut();

      console.log(data, error);

      if (error) throw error.message;

      if (!data) navigate("/login");

      dispatch(toggleModal({ key: "rightSideMenu", value: false }));
    } catch (e) {
      setError(e.toString());
    }
  }

  return (
    <div className="right-side-menu" ref={rightSideMenuRef}>
      {error && <p className="error-text small-text">{error}</p>}
      <Link
        to={`/profile`}
        className="menu-item"
        onClick={() => dispatch(toggleModal({ key: "rightSideMenu", value: false }))}
      >
        <div className="profile-link">
          <div className="profile-picture"></div>
          <div className="info">
            <label>View Profile</label>
            <p className="user-email">{session?.user.username}</p>
          </div>
        </div>
      </Link>
      <Link
        to={`/`}
        className="menu-item"
        onClick={() => dispatch(toggleModal({ key: "rightSideMenu", value: false }))}
      >
        <div className="sell-link">
            <label>Home</label>
        </div>
      </Link>
      <Link
        to={`/sell`}
        className="menu-item sell"
        onClick={() => dispatch(toggleModal({ key: "rightSideMenu", value: false }))}
      >
        <div className="sell-link">
            <label>Sell</label>
        </div>
      </Link>
      <button className="menu-item logout" onClick={handleLogout}>
        <LogOutIcon />
        Logout
      </button>
    </div>
  );
};
export default RightSideMenu;
