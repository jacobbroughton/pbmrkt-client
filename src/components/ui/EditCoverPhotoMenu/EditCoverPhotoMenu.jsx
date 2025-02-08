import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { toggleModal } from "../../../redux/modals";
import { ErrorBanner } from "../ErrorBanner/ErrorBanner";
import { EditIcon } from "../Icons/EditIcon";
import { TrashIcon } from "../Icons/TrashIcon";
import "./EditCoverPhotoMenu.css";
import { ExpandIcon } from "../Icons/ExpandIcon";
import { UploadIcon } from "../Icons/UploadIcon";

export const EditCoverPhotoMenu = ({
  localUser,
  setLocalUser,
  newCoverPhotoLoading,
  setNewCoverPhotoLoading,
  setCoverPhotoStagedForFullScreen,
}) => {
  const dispatch = useDispatch();
  const editCoverPhotoMenuRef = useRef(null);
  const { user } = useSelector((state) => state.auth);
  const [error, setError] = useState(null);

  useEffect(() => {
    function handler(e) {
      if (
        editCoverPhotoMenuRef.current &&
        !editCoverPhotoMenuRef.current.contains(e.target) &&
        !e.target.classList.contains("edit-cover-image-menu-button")
      ) {
        dispatch(toggleModal({ key: "editCoverPhotoMenu", value: false }));
        dispatch(toggleModal({ key: "fullScreenImageModal", value: false }));
      }
    }

    window.addEventListener("click", handler);

    return () => {
      window.removeEventListener("click", handler);
    };
  });

  async function uploadCoverPhoto(e) {
    try {
      setNewCoverPhotoLoading(true);

      const thisUploadUUID = uuidv4();
      const file = e.target.files[0];

      const formData = new FormData();
      formData.append("cover-image-upload", file);

      const resposne = await fetch("http://localhost:4000/upload-cover-image", {
        method: "post",
        body: formData,
        credentials: "include",
      });

      if (!resposne.ok) throw new Error("There was an error at upload cover image");

      const data = await resposne.json();

      if (!data.url) throw "New cover image path not found";

      const { url: newCoverPhotoUrl } = data;

      setLocalUser({
        ...localUser,
        cover_image_url: newCoverPhotoUrl,
      });
    } catch (error) {
      console.error(error);
      setError(error.toString());
    }

    setNewCoverPhotoLoading(false);
  }

  return (
    <div className="edit-cover-image-menu" ref={editCoverPhotoMenuRef}>
      {error && (
        <ErrorBanner error={error.toString()} handleCloseBanner={() => setError(null)} />
      )}

      {/* <button
        className="menu-item"
        onClick={() => {
          dispatch(toggleModal({ key: "feedbackModal", value: false }));
          dispatch(toggleModal({ key: "bugModal", value: true }));
          dispatch(toggleModal({ key: "editCoverPhotoMenu", value: false }));
        }}
      >
        <EditIcon />
        <label>Upload a new cover image</label>
      </button> */}
      <label htmlFor="edit-cover-image" className="menu-item">
        <input
          type="file"
          className=""
          title="Edit cover image"
          id="edit-cover-image"
          onChange={uploadCoverPhoto}
        />
        {newCoverPhotoLoading ? <p>...</p> : <UploadIcon />} Upload a new cover image
      </label>
      <button
        className="menu-item"
        onClick={() => {
          setCoverPhotoStagedForFullScreen(true);
          dispatch(toggleModal({ key: "editCoverPhotoMenu", value: false }));
          dispatch(toggleModal({ key: "fullScreenImageModal", value: true }));
        }}
      >
        <ExpandIcon />
        <label>View cover image</label>
      </button>
      <button
        className="menu-item"
        onClick={() => {
          alert("This doesn't do anything");
        }}
      >
        <TrashIcon />
        <label>Delete cover image</label>
      </button>
    </div>
  );
};
