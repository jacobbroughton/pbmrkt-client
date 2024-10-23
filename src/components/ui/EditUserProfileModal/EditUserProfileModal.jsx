import { useDispatch } from "react-redux";
import { toggleModal } from "../../../redux/modals";
import { useRef, useState } from "react";
import { states, statesAndCities } from "../../../utils/statesAndCities.js";
import {
  capitalizeWords,
  isValidEmail,
  isValidPhoneNumber,
} from "../../../utils/usefulFunctions.js";
import { supabase } from "../../../utils/supabase.js";
import { setUser } from "../../../redux/auth.js";
import { EditIcon } from "../Icons/EditIcon.jsx";
import { v4 as uuidv4 } from "uuid";
import { XIcon } from "../Icons/XIcon.jsx";
import "./EditUserProfileModal.css";
import { MagicWand } from "../Icons/MagicWand.jsx";
import { Arrow } from "../Icons/Arrow.jsx";
import { SortIcon } from "../Icons/SortIcon.jsx";
// import MapboxLocationSearch from "../MapboxLocationSearch/MapboxLocationSearch.jsx";

export const EditUserProfileModal = ({ localUser, setLocalUser }) => {
  const dispatch = useDispatch();

  const cityRef = useRef(null);

  const [firstName, setFirstName] = useState(localUser.first_name || "");
  const [lastName, setLastName] = useState(localUser.last_name || "");
  const [city, setCity] = useState(localUser.city || "");
  const [state, setState] = useState(localUser.state || "");
  const [bio, setBio] = useState(localUser.bio || "");
  const [phoneNumber, setPhoneNumber] = useState(localUser.phone_number || "");
  const [email, setEmail] = useState(localUser.email || "");
  const [error, setError] = useState(null);
  const [newProfilePictureLoading, setNewProfilePictureLoading] = useState(false);
  const [newProfilePictureUrl, setNewProfilePictureUrl] = useState(null);
  const [markedFieldKey, setMarkedFieldKey] = useState(null);
  const [cantFindCity, setCantFindCity] = useState(false);

  // mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_KEY;

  async function handleSubmit(e) {
    e.preventDefault();

    // p_city, p_email, p_first_name, p_last_name, p_phone_number, p_state, p_user_id)
    try {
      const { data, error } = await supabase.rpc("edit_user_profile", {
        p_user_id: localUser.auth_id,
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

      const newUser = {
        ...data[0],
        profile_picture_url: localUser.profile_picture_url,
      };

      setLocalUser(newUser);
      dispatch(setUser(newUser));
      dispatch(toggleModal({ key: "editUserProfileModal", value: false }));
    } catch (error) {
      console.error(error);
      setError(error);
    }
  }

  async function uploadProfilePicture(e) {
    try {
      setNewProfilePictureLoading(true);

      const thisUploadUUID = uuidv4();
      const file = e.target.files[0];
      const { data, error } = await supabase.storage
        .from("profile_pictures")
        .upload(`${localUser.auth_id}/${thisUploadUUID}`, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error(error);
        throw error.message;
      }

      if (!data.path) throw "New profile picture path not found";

      const { data: data2, error: error2 } = supabase.storage
        .from("profile_pictures")
        .getPublicUrl(data.path);

      if (error2) throw error2.message;

      let newProfilePictureUrlLocal = data2.publicUrl;

      const { data: data3, error: error3 } = await supabase.rpc("add_profile_image", {
        p_generated_id: data.id,
        p_full_path: data.fullPath,
        p_path: data.path,
        p_user_id: localUser.auth_id,
      });
      if (error3) throw error3.message;

      // dispatch(
      //   setUser({
      //     ...localUser,
      //     profile_picture_url: newProfilePictureUrlLocal,
      //   })
      // );

      const { data: data4, error: error4 } = supabase.storage
        .from("profile_pictures")
        .getPublicUrl(data3.path || "placeholders/user-placeholder");

      if (error4) throw error4.message;

      setLocalUser({
        ...localUser,
        profile_picture_url: data4.publicUrl,
      });

      setNewProfilePictureUrl(newProfilePictureUrlLocal);
      // dispatch(
      //   setUserProfilePicture(newProfilePictureUrlLocal)
      // );

      // setProfilePicture(data2[0].full_path);
    } catch (error) {
      console.error(error);
      setError(error.toString());
    }

    setNewProfilePictureLoading(false);
  }

  const submitDisabled =
    !isValidPhoneNumber(phoneNumber) ||
    !isValidEmail(email) ||
    (firstName == localUser.first_name &&
      lastName == localUser.last_name &&
      city == localUser.city &&
      state == localUser.state &&
      bio == localUser.bio &&
      phoneNumber == localUser.phone_number &&
      email == localUser.email);

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
          Close <XIcon />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="standard">
        <div className="form-group">
          <label>Change your profile picture</label>
          <div></div>
          <div className="profile-picture-container">
            <img className="profile-picture" src={localUser.profile_picture_url} />
            <label htmlFor="change-profile-picture">
              <input
                type="file"
                className=""
                title="Edit profile picture"
                id="change-profile-picture"
                onChange={uploadProfilePicture}
              />
              {newProfilePictureLoading ? <p>...</p> : <EditIcon />}
            </label>
          </div>
        </div>
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
            <div className="select-container">
              <SortIcon />
              <select
                onChange={(e) =>
                  setState(e.target.value == "All" ? null : e.target.value)
                }
                value={state}
              >
                {["Select One", ...states].map((childState) => (
                  <option value={childState} key={childState}>
                    {childState}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            className={`form-group  ${markedFieldKey == "city" ? "marked" : ""} ${
              !state ? "disabled" : ""
            }`}
            ref={cityRef}
          >
            <label htmlFor="city">City</label>
            {cantFindCity ? (
              <>
                <input
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter your city"
                />{" "}
                <button
                  className="cant-find-city-toggle"
                  type="button"
                  onClick={() => setCantFindCity(false)}
                >
                  <Arrow direction={"left"} /> Go back
                </button>
              </>
            ) : (
              <>
                <div className="select-container">
                  <select
                    disabled={!state}
                    onChange={(e) =>
                      setCity(
                        ["All", "Select One"].includes(e.target.value)
                          ? null
                          : e.target.value
                      )
                    }
                    value={city?.toUpperCase()}
                  >
                    {statesAndCities[state]?.map((innerCity) => (
                      <option value={innerCity}>{capitalizeWords(innerCity)}</option>
                    ))}
                  </select>
                  <SortIcon />
                </div>
                <button
                  onClick={() => setCantFindCity(true)}
                  className="cant-find-city-toggle"
                >
                  Can't find your city?
                </button>
              </>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="bio">Details about you?</label>
          <textarea
            id="bio"
            value={bio}
            placeholder="Add some details about you"
            onChange={(e) => setBio(e.target.value)}
          />
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
        <button type="submit" disabled={submitDisabled}>
          Submit
        </button>
      </form>
    </div>
  );
};
