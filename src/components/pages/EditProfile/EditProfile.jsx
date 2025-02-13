import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../../redux/auth";
import { v4 as uuidv4 } from "uuid";
import {
  capitalizeWords,
  isValidEmail,
  isValidPhoneNumber,
} from "../../../utils/usefulFunctions";
import { ErrorBanner } from "../../ui/ErrorBanner/ErrorBanner";
import { toggleModal } from "../../../redux/modals";
import { EditIcon } from "../../ui/Icons/EditIcon";
import { SortIcon } from "../../ui/Icons/SortIcon";
import { states, statesAndCities } from "../../../utils/statesAndCities.js";
import "./EditProfile.css";
import { Arrow } from "../../ui/Icons/Arrow.jsx";
import PageTitle from "../../ui/PageTitle/PageTitle.jsx";
import { EditCoverPhotoMenu } from "../../ui/EditCoverPhotoMenu/EditCoverPhotoMenu.jsx";
import { ImageIcon } from "../../ui/Icons/ImageIcon.jsx";

export const EditProfile = () => {
  const dispatch = useDispatch();

  const cityRef = useRef(null);
  const user = useSelector((state) => state.auth.user);
  const editCoverPhotoMenuToggled = useSelector(
    (state) => state.modals.editCoverPhotoMenuToggled
  );
  const [originalUser, setOriginalUser] = useState(user);
  const [modifiedUser, setModifiedUser] = useState(user);
  const [firstName, setFirstName] = useState(modifiedUser.first_name || "");
  const [lastName, setLastName] = useState(modifiedUser.last_name || "");
  const [city, setCity] = useState(modifiedUser.city || "");
  const [state, setState] = useState(modifiedUser.state || "");
  const [bio, setBio] = useState(modifiedUser.bio || "");
  const [phoneNumber, setPhoneNumber] = useState(modifiedUser.phone_number || "");
  const [email, setEmail] = useState(modifiedUser.email || "");
  const [headline, setHeadline] = useState(modifiedUser.headline || "");
  const [error, setError] = useState(null);
  const [newProfilePictureLoading, setNewProfilePictureLoading] = useState(false);
  const [newCoverImageLoading, setNewCoverImageLoading] = useState(false);
  const [newprofileImageUrl, setNewprofileImageUrl] = useState(null);
  const [markedFieldKey, setMarkedFieldKey] = useState(null);
  const [cantFindCity, setCantFindCity] = useState(false);

  const [coverPhotoStagedForFullScreen, setCoverPhotoStagedForFullScreen] =
    useState(false);

  // mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_KEY;

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:4000/edit-user-profile", {
        method: "post",
        credentials: "include",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
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

      const response2 = await fetch(
        `http://localhost:4000/auth/get-user-profile-complex/${user.username}`
      );

      if (!response2.ok) {
        throw new Error(
          response2.statusText || "There was a problem at get-user-profile-complex"
        );
      }
      const { data: foundUserComplex } = await response2.json();

      console.log(foundUserComplex);

      setModifiedUser(foundUserComplex);
      setOriginalUser(foundUserComplex);
      dispatch(setUser(foundUserComplex));
      // dispatch(toggleModal({ key: "editUserProfileModal", value: false }));
    } catch (error) {
      console.error(error);
      setError(error);
    }
  }
  
  async function uploadProfilePicture(e) {
    try {
      setNewProfilePictureLoading(true);

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

      setModifiedUser({
        ...modifiedUser,
        profile_image_url: newProfileImageUrl,
      });
    } catch (error) {
      console.error(error);
      setError(error.toString());
    }

    setNewProfilePictureLoading(false);
  }


  async function uploadCoverImage(e) {
    try {
      setNewCoverImageLoading(true);

      const file = e.target.files[0];

      const formData = new FormData();
      formData.append("cover-image-upload", file);

      const response2 = await fetch("http://localhost:4000/upload-cover-image", {
        method: "post",
        body: formData,
        credentials: "include",
      });

      if (!response2.ok) throw new Error("There was an error at upload cover image");

      const dataFromUpload = await response2.json();

      if (!dataFromUpload.url) throw "New cover image path not found";

      let newProfileImageUrl = dataFromUpload.url;

      setModifiedUser({
        ...modifiedUser,
        profile_image_url: newProfileImageUrl,
      });
    } catch (error) {
      console.error(error);
      setError(error.toString());
    }

    setNewCoverImageLoading(false);
  }

  async function uploadCoverImage(e) {
    try {
      setNewCoverImageLoading(true);

      const thisUploadUUID = uuidv4();

      const file = e.target.files[0];

      const formData = new FormData();
      formData.append("cover-image-upload", file);

      const response2 = await fetch("http://localhost:4000/upload-cover-image", {
        method: "post",
        body: formData,
        credentials: "include",
      });

      if (!response2.ok) throw new Error("There was an error at upload profile picture");

      const dataFromUpload = await response2.json();

      if (!dataFromUpload.url) throw "New cover image path not found";

      setModifiedUser({
        ...modifiedUser,
        cover_image_url: dataFromUpload.url
      })

      // let newProfileImageUrl = dataFromUpload.url;

      // const response = await fetch("http://localhost:4000/add-profile-image", {
      //   method: "post",
      //   headers: {
      //     "content-type": "application/json",
      //   },
      //   credentials: "include",
      //   body: JSON.stringify({
      //     generated_id: data.id,
      //     full_path: data.fullPath,
      //     path: data.path,
      //   }),
      // });

      // if (!response.ok) throw new Error("Something happened at add-profile-image");

      // const { data: data3 } = await response.json();

      // setModifiedUser({
      //   ...modifiedUser,
      //   profile_image_url: "",
      // });

      // setNewprofileImageUrl(newProfileImageUrl);
      // dispatch(
      //   setUserCover(newProfileImageUrl)
      // );

      // setCover(data2[0].full_path);
    } catch (error) {
      console.error(error);
      setError(error.toString());
    }

    setNewCoverImageLoading(false);
  }

  const submitDisabled =
    !isValidPhoneNumber(phoneNumber) ||
    !isValidEmail(email) ||
    (firstName == modifiedUser.first_name &&
      lastName == modifiedUser.last_name &&
      city == modifiedUser.city &&
      state == modifiedUser.state &&
      bio == modifiedUser.bio &&
      phoneNumber == modifiedUser.phone_number &&
      email == modifiedUser.email);

  return (
    <main className="edit-user-profile">
      <PageTitle title="Sell | PBMRKT" />
      {error && (
        <ErrorBanner
          error={error.toString()}
          handleCloseBanner={() => setError(null)}
          hasMargin={true}
        />
      )}

      {error && (
        <ErrorBanner error={error.toString()} handleCloseBanner={() => setError(null)} />
      )}

      <form onSubmit={handleSubmit} className="">
        <div className="form-block">
          {/* <div className="header">
            <h2>Upload Images</h2>
          </div> */}
          <div className="form-content">
            <div className="form-group">
              <label>Change your profile picture</label>
              <div className="profile-image-container">
                <img className="profile-image" src={modifiedUser.profile_image_url} />
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
            <div className="form-group">
              <label>Change your cover image</label>
              <div className="cover-image-container">
                <img className="cover-image" src={modifiedUser.cover_image_url} />
                <label htmlFor="change-cover-image">
                  <input
                    type="file"
                    className=""
                    title="Edit cover image"
                    id="change-cover-image"
                    onChange={uploadCoverImage}
                  />
                  {newCoverImageLoading ? <p>...</p> : <EditIcon />}
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className="form-block">
          {/* <div className="header">
            <h2>Your Info</h2>
          </div> */}
          <div className="form-content">
            <fieldset>
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
            </fieldset>
          </div>

          <div className="form-content">
            <fieldset>
              <div className="form-group">
                <label htmlFor="state">State</label>
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
            </fieldset>

            <fieldset>
              <div className="form-group">
                <label htmlFor="phone-number">Phone Number</label>
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
            </fieldset>
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
        </div>

        <button type="submit" disabled={submitDisabled}>
          Submit
        </button>
      </form>
    </main>
  );
};
