import { Link } from "react-router-dom";
import { DollarBillIcon } from "../Icons/DollarBillIcon";
import "./AddNewMenu.css";
import { toggleModal } from "../../../redux/modals";
import { useDispatch } from "react-redux";
import { PlusIcon } from "../Icons/PlusIcon";
import { useEffect, useRef } from "react";

export const AddNewMenu = () => {
  const dispatch = useDispatch();
  const menuRef = useRef(null);

  function handler(e) {
    if (
      menuRef.current &&
      !menuRef.current.contains(e.target) &&
      !e.target.classList.contains("add-new-menu-toggle")
    ) {
      dispatch(toggleModal({ key: "addNewMenu", value: false }));
    }
  }

  useEffect(() => {
    document.addEventListener("click", handler);

    return () => document.removeEventListener("click", handler);
  });


  return (
    <div className="add-new-menu" ref={menuRef}>
      <Link
        to={`/sell`}
        className={`menu-item ${location.pathname == "/sell" ? "current" : ""}`}
        onClick={() => dispatch(toggleModal({ key: "addNewMenu", value: false }))}
      >
        <DollarBillIcon />
        <label>Sell</label>
      </Link>
      <Link
        to={`/wanted`}
        className={`menu-item ${location.pathname == "/wanted" ? "current" : ""}`}
        onClick={() => dispatch(toggleModal({ key: "addNewMenu", value: false }))}
      >
        <PlusIcon />
        <label>Request / WTB / ISO</label>
      </Link>
    </div>
  );
};
