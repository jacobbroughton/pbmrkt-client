import { Link } from "react-router-dom";
import "./UnauthenticatedOptionsMenu.css";
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { toggleModal } from "../../../redux/modals";
import { EnterIcon } from "../Icons/EnterIcon";

export const UnauthenticatedOptionsMenu = () => {
  const menuRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target))
        dispatch(toggleModal({ key: "unauthenticatedOptionsMenu", value: false }));
    }

    document.addEventListener("click", handler);

    return () => {
      document.removeEventListener("click", handler);
    };
  }, [dispatch]);

  const closeModal = () =>
    dispatch(toggleModal({ key: "unauthenticatedOptionsMenu", value: false }));

  return (
    <div className="unauthenticated-options-menu" ref={menuRef}>
      <Link to="/register" onClick={closeModal}>
        Register
      </Link>
      <Link to="/login" onClick={closeModal}>
        Login
      </Link>
    </div>
  );
};
