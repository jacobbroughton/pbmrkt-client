import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleModal } from "../../../redux/modals";
import { Link } from "react-router-dom";

const CompleteProfileModal = () => {
  const dispatch = useDispatch();
  const modalRef = useRef(null);
  const user = useSelector((state) => state.auth.user);
  const [rating, setRating] = useState(0);
  const [error, setError] = useState(null);
  // const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    function handler(e) {
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target) &&
        !e.target.classList.contains("complete-profile-modal-toggle-button")
      ) {
        dispatch(toggleModal({ key: "completeProfileModal", value: false }));
      }
    }

    window.addEventListener("click", handler);

    return () => {
      window.removeEventListener("click", handler);
    };
  });

  return (
    <div>
      In order to proceed, please complete your profile
      <button
        onClick={() =>
          dispatch(toggleModal({ key: "complete-profile-modal", value: false }))
        }
      >
        Cancel
      </button>
      <Link to='/edit-profile'>Go to 'Edit Profile' Page</Link>
    </div>
  );
};
export default CompleteProfileModal;
