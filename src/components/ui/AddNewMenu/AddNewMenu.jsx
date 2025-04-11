import { Link } from "react-router-dom";
import { DollarBillIcon } from "../Icons/DollarBillIcon";
import "./AddNewMenu.css";
import { toggleModal } from "../../../redux/modals";
import { useDispatch, useSelector } from "react-redux";
import { PlusIcon } from "../Icons/PlusIcon";
import { useEffect, useRef } from "react";
import { WarningCircle } from "../Icons/WarningCircle";

export const AddNewMenu = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
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
        className={`add-new-menu-item ${location.pathname == "/sell" ? "current" : ""}`}
        onClick={() => dispatch(toggleModal({ key: "addNewMenu", value: false }))}
      >
        <DollarBillIcon />
        <div className="content">
          <label>Sell {!user}</label>
          {!user.eligible_to_sell && (
            <p className="complete-profile-message">
              <i>Complete your profile</i>
            </p>
          )}
        </div>
      </Link>
      <Link
        to={`/wanted`}
        className={`add-new-menu-item ${location.pathname == "/wanted" ? "current" : ""}`}
        onClick={() => dispatch(toggleModal({ key: "addNewMenu", value: false }))}
      >
        <PlusIcon />
        <div className="content">
          <label>Request / WTB / ISO</label>
          {!user.eligible_to_sell && (
            <p className="complete-profile-message">
              <i>Complete your profile</i>
            </p>
          )}
        </div>
      </Link>
    </div>
  );
};
