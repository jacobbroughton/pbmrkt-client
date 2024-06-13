import { useDispatch, useSelector } from "react-redux";
import "./RightSideMenu.css";
import { Link, useNavigate } from "react-router-dom";
import { toggleModal } from "../../../redux/modals";
import { setUser } from "../../../redux/auth";
import { supabase } from "../../../utils/supabase";
import LogOutIcon from "../Icons/LogOutIcon";
import { useEffect, useRef, useState } from "react";
import HomeIcon from "../Icons/HomeIcon";
import DollarSignIcon from "../Icons/DollarSignIcon";
import DollarBillIcon from "../Icons/DollarBillIcon";
import LoadingOverlay from "../LoadingOverlay/LoadingOverlay";
import { setLogoutLoading } from "../../../redux/loading";

const RightSideMenu = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const rightSideMenuRef = useRef(null);
  const { session, user } = useSelector((state) => state.auth);
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
     dispatch(setLogoutLoading(true)) ;

      const { data, error } = await supabase.auth.signOut();

      if (error) throw error.message;

      navigate("/");

      dispatch(toggleModal({ key: "rightSideMenu", value: false }));
    } catch (error) {
      console.error(error);
      setError(error.toString());
    }

    dispatch(setLogoutLoading(false));
  }

  return (
    <>
      <div className="right-side-menu" ref={rightSideMenuRef}>
        {error && <p className="error-text small-text">{error.toString()}</p>}
        <Link
          to={`/user/${user.username}`}
          className="menu-item"
          onClick={() => dispatch(toggleModal({ key: "rightSideMenu", value: false }))}
        >
          <div className="profile-link">
            <img className="profile-picture" src={user.profile_picture_url} />
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
          <HomeIcon />
          <label>Home</label>
        </Link>
        <Link
          to={`/sell`}
          className="menu-item"
          onClick={() => dispatch(toggleModal({ key: "rightSideMenu", value: false }))}
        >
          <DollarBillIcon />
          <label>Sell</label>
        </Link>
        <button className="menu-item logout" onClick={handleLogout}>
          <LogOutIcon />
          Logout
        </button>
      </div>
      
    </>
  );
};
export default RightSideMenu;
