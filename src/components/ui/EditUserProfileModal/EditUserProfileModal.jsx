import { useDispatch } from "react-redux";
import { toggleModal } from "../../../redux/modals";
import { useRef, useState } from "react";
import { states, statesAndCities } from "../../../utils/statesAndCities.js";
import {
  capitalizeWords,
  isValidEmail,
  isValidPhoneNumber,
} from "../../../utils/usefulFunctions";
import { setUser } from "../../../redux/auth.ts";
import { EditIcon } from "../Icons/EditIcon.jsx";
import { v4 as uuidv4 } from "uuid";
import { XIcon } from "../Icons/XIcon";
import "./EditUserProfileModal.css";
import { MagicWand } from "../Icons/MagicWand.jsx";
import { Arrow } from "../Icons/Arrow.jsx";
import { SortIcon } from "../Icons/SortIcon.tsx";
import { ErrorBanner } from "../ErrorBanner/ErrorBanner";
// import MapboxLocationSearch from "../MapboxLocationSearch/MapboxLocationsearch.tsx";

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
  const [headline, setHeadline] = useState(localUser.headline || "");
  const [error, setError] = useState(null);
  const [newProfilePictureLoading, setNewProfilePictureLoading] = useState(false);
  const [newprofileImageUrl, setNewprofileImageUrl] = useState(null);
  const [markedFieldKey, setMarkedFieldKey] = useState(null);
  const [cantFindCity, setCantFindCity] = useState(false);

  // mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_KEY;

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:4000/edit-user-profile", {
        method: "post",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          user_id: localuser.id,
          phone_number: phoneNumber,
          first_name: firstName,
          last_name: lastName,
          state: state,
          city: city,
          bio: bio,
        }),
      });

      if (!response.ok) {
        throw new Error(
          response.statusText || "There was a problem at edit-user-profile"
        );
      }

      const data = await response.json();

      const newUser = {
        ...data[0],
        profile_image_url: localUser.profile_image_url,
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

      const formData = new FormData();
      formData.append("profile-image-upload", file);

      const response2 = await fetch("http://localhost:4000/upload-profile-image", {
        method: "post",
        body: formData,
        credentials: "include",
      });

      if (!response2.ok) throw new Error("There was an error at upload profile picture");

      const dataFromUpload = await response2.json();

      if (!dataFromUpload.url) throw "New profile picture path not found";

      let newProfileImageUrl = dataFromUpload.url;

      const response = await fetch("http://localhost:4000/add-profile-image", {
        method: "post",
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          generated_id: data.id,
          full_path: data.fullPath,
          path: data.path,
          user_id: localuser.id,
        }),
      });

      if (!response.ok) throw new Error("Something happened at add-profile-image");

      const { data: data3 } = await response.json();

      // dispatch(
      //   setUser({
      //     ...localUser,
      //     profile_image_url: newProfileImageUrl,
      //   })
      // );

      setLocalUser({
        ...localUser,
        profile_image_url: "",
      });

      setNewprofileImageUrl(newProfileImageUrl);
      // dispatch(
      //   setUserProfilePicture(newProfileImageUrl)
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
      {error && (
        <ErrorBanner error={error.toString()} handleCloseBanner={() => setError(null)} />
      )}
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
          {console.log(localUser)}
          <label>Change your profile picture</label>
          <div></div>
          <div className="profile-image-container">
            <img className="profile-image" src={localUser.profile_image_url} />
            <label htmlFor="change-profile-image">
              <input
                type="file"
                className=""
                title="Edit profile picture"
                id="change-profile-image"
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

        <div className="form-group">
          <label htmlFor="email">Headline</label>
          <input
            placeholder="Headline"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
          />
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

        <div className="form-group">
          <label htmlFor="bio">Details about you?</label>
          <textarea
            id="bio"
            value={bio}
            placeholder="I'm 25, i've been playing paintball since i was 15 around the western PA area."
            onChange={(e) => setBio(e.target.value)}
          />
        </div>
        <button type="submit" disabled={submitDisabled}>
          Submit
        </button>
      </form>
    </div>
  );
};
