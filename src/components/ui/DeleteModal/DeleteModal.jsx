import { XIcon } from "../Icons/XIcon";
import { useEffect, useRef } from "react";
import "./DeleteModal.css";
import { toggleModal } from "../../../redux/modals";
import { useDispatch } from "react-redux";

export function DeleteModal({ label = "", handleDeleteClick, deleteLoading }) {
  const modalRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    function handler(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        dispatch(toggleModal({ key: "deleteModal", value: false }));
      }
    }

    document.addEventListener("click", handler);

    return () => document.removeEventListener("click", handler);
  });

  return (
    <>
      <div className="delete-modal" ref={modalRef}>
        <div className="header">
          <h1>{label || "Delete?"}</h1>
          <button
            onClick={(e) => {
              e.preventDefault();
              dispatch(toggleModal({ key: "deleteModal", value: false }));
            }}
          >
            <XIcon />
          </button>
        </div>
        <div className="content">
          <p>This can't be undone</p>
        </div>
        <div className="controls">
          <button
            onClick={() => {
              if (deleteLoading) return
              dispatch(toggleModal({ key: "deleteModal", value: false }));
            }}
          >
            Cancel
          </button>
          <button
            className="delete"
            onClick={() => {
              if (deleteLoading) return
              handleDeleteClick();
              dispatch(toggleModal({ key: "deleteModal", value: false }));
            }}
          >
            {deleteLoading ? 'Deleting' : 'Delete'}
          </button>
        </div>
      </div>
      <div className="delete-modal-overlay"></div>
    </>
  );
}
