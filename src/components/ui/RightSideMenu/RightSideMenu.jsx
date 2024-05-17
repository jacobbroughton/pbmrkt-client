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
  const user = useSelector((state) => state.auth.session?.user);
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
      dispatch(toggleModal({ key: "rightSideMenu", value: false }));
      const { data } = await supabase.auth.signOut();

      if (!data) navigate("/login");
    } catch (e) {
      setError(e.toString());
    }
  }

  return (
    <div className="right-side-menu" ref={rightSideMenuRef}>
      {error && <p className="error">{error}</p>}
      <Link
        to={`/profile`}
        className="menu-item"
        onClick={() => dispatch(toggleModal({ key: "rightSideMenu", value: false }))}
      >
        <div className="profile-link">
          <div className="profile-picture"></div>
          <div className="info">
            <label>View Profile</label>
            <p className="user-email">{user.username}</p>
          </div>
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
