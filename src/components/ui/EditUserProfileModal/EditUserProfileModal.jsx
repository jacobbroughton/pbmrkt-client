import { useDispatch, useSelector } from "react-redux";
import { toggleModal } from "../../../redux/modals";
import { useState } from "react";
import { states, statesAndCities } from "../../../utils/statesAndCities.js";
import "./EditUserProfileModal.css";
import { capitalizeWords } from "../../../utils/usefulFunctions.js";
import { supabase } from "../../../utils/supabase.js";
import { setUser } from "../../../redux/auth.js";

const EditUserProfileModal = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [firstName, setFirstName] = useState(user.first_name || "");
  const [lastName, setLastName] = useState(user.last_name || "");
  const [city, setCity] = useState(user.city || "");
  const [state, setState] = useState(user.state || "");
  const [bio, setBio] = useState(user.bio || "");
  const [phoneNumber, setPhoneNumber] = useState(user.phone_number || "");
  const [email, setEmail] = useState(user.email || "");
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();

    // p_city, p_email, p_first_name, p_last_name, p_phone_number, p_state, p_user_id)
    try {
      const { data, error } = await supabase.rpc("edit_user_profile", {
        p_user_id: user.auth_id,
        // p_email: email,
        p_phone_number: phoneNumber,
        p_first_name: firstName,
        p_last_name: lastName,
        p_state: state,
        p_city: city,
        p_bio: bio,
      });

      //   p_user_id uuid,
      // p_phone_number character varying,
      // p_first_name character varying,
      // p_last_name character varying,
      // p_state character varying,
      // p_city character varying,
      // p_bio character varying
      if (error) throw error.message;
      console.log("edit_user_profile", data);
      dispatch(setUser(data[0]));
      dispatch(toggleModal({ key: "editUserProfileModal", value: false }))
    } catch (error) {
      console.error(error);
      setError(error);
    }
  }

  return (
    <div className="modal edit-user-profile-modal">
      {error && <p className="small-text error-text">{error.toString()}</p>}
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
        <div className="form-groups">
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
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>
        <div className="form-groups">
          <div className="form-group">
            <label htmlFor="email">State</label>
            <select
              onChange={(e) => setState(e.target.value == "All" ? null : e.target.value)}
              value={state}
            >
              {states.map((childState) => (
                <option value={childState} key={childState}>
                  {childState}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="email">City</label>
            <select
              disabled={!state}
              onChange={(e) => setCity(e.target.value == "All" ? null : e.target.value)}
              value={city?.toUpperCase()}
            >
              {statesAndCities[state]?.map((innerCity) => (
                <option value={innerCity}>{capitalizeWords(innerCity)}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="bio">Details about you?</label>
          <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>
        <div className="form-groups">
          <div className="form-group">
            <label htmlFor="email">Phone Number</label>
            <input
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              placeholder="Email"
              value={email}
              type="email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};
export default EditUserProfileModal;
