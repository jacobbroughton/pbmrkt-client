import { useDispatch } from "react-redux";
import { toggleModal } from "../../../redux/modals";
import { useState } from "react";
import "./EditUserProfileModal.css";

const EditUserProfileModal = () => {
  const dispatch = useDispatch();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
  }

  return (
    <div className="modal edit-user-profile-modal">
      <div className="header">
        <h2>Edit profile</h2>
        <button
          className="button"
          onClick={() =>
            dispatch(toggleModal({ key: "editUserProfileModal", value: false }))
          }
        >
          Close
        </button>
      </div>
      <form onSubmit={handleSubmit} className="standard">
        <div className="form-group">
          <label htmlFor="email">First Name</label>
          <input
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Last Name</label>
          <input
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">State</label>
          <input
            placeholder="State"
            value={state}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">City</label>
          <input
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};
export default EditUserProfileModal;
