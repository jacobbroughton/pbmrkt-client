import { useDispatch, useSelector } from "react-redux";
import "./RightSideMenu.css";
import { Link, useNavigate } from "react-router-dom";
import { toggleModal } from "../../../redux/modals";
import { supabase } from "../../../utils/supabase";
import LogOutIcon from "../Icons/LogOutIcon";
import { useEffect, useRef } from "react";

const RightSideMenu = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const rightSideMenuRef = useRef(null);
  const user = useSelector((state) => state.auth.session?.user);

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
      const { data } = await supabase.auth.signOut();

      console.log(data);

      // dispatch(setUser(null));
      dispatch(toggleModal({ key: "rightSideMenu", value: false }));
      navigate("/login");
    } catch (e) {
      if (typeof e === "string") {
        alert(e);
      } else if (e instanceof Error) {
        alert("ERROR: " + e.message);
      }
    }
  }

  return (
    <div className="right-side-menu" ref={rightSideMenuRef}>
      <Link
        to={`/user/${user?.id}`}
        className="menu-item"
        onClick={() => dispatch(toggleModal({ key: "rightSideMenu", value: false }))}
      >
        <div className="profile-link">
          <div className="profile-picture"></div>
          <div className="info">
            <label>View Profile</label>
            <p className="user-email">{user.email}</p>
          </div>
        </div>
      </Link>
      <button className="menu-item" onClick={handleLogout}>
        <LogOutIcon />
        Logout
      </button>
    </div>
  );
};
export default RightSideMenu;
