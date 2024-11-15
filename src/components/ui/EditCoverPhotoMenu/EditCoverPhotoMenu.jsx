import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { toggleModal } from "../../../redux/modals";
import { ErrorBanner } from "../ErrorBanner/ErrorBanner";
import { EditIcon } from "../Icons/EditIcon";
import { TrashIcon } from "../Icons/TrashIcon";
import "./EditCoverPhotoMenu.css";
import { supabase } from "../../../utils/supabase";
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
        !e.target.classList.contains("edit-cover-photo-menu-button")
      ) {
        dispatch(toggleModal({ key: "editCoverPhotoMenu", value: false }));
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
      const { data, error } = await supabase.storage
        .from("cover_photos")
        .upload(`${user.auth_id}/${thisUploadUUID}`, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error(error);
        throw error.message;
      }

      if (!data.path) throw "New profile picture path not found";

      const { data: data2, error: error2 } = supabase.storage
        .from("cover_photos")
        .getPublicUrl(data.path);

      if (error2) throw error2.message;

      let newCoverPhotoUrl = data2.publicUrl;

      const { error: error3 } = await supabase.rpc("add_cover_photo", {
        p_generated_id: data.id,
        p_full_path: data.fullPath,
        p_path: data.path,
        p_user_id: user.auth_id,
      });
      if (error3) throw error3.message;

      setLocalUser({
        ...localUser,
        cover_photo_url: newCoverPhotoUrl,
      });
    } catch (error) {
      console.error(error);
      setError(error.toString());
    }

    setNewCoverPhotoLoading(false);
  }

  return (
    <div className="edit-cover-photo-menu" ref={editCoverPhotoMenuRef}>
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
        <label>Upload a new cover photo</label>
      </button> */}
      <label htmlFor="edit-cover-photo" className="menu-item">
        <input
          type="file"
          className=""
          title="Edit cover photo"
          id="edit-cover-photo"
          onChange={uploadCoverPhoto}
        />
        {newCoverPhotoLoading ? <p>...</p> : <UploadIcon />} Upload a new cover photo
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
        <label>View cover photo</label>
      </button>
      <button
        className="menu-item"
        onClick={() => {
          dispatch(toggleModal({ key: "feedbackModal", value: true }));
          dispatch(toggleModal({ key: "bugModal", value: false }));
          dispatch(toggleModal({ key: "editCoverPhotoMenu", value: false }));
        }}
      >
        <TrashIcon />
        <label>Delete cover photo</label>
      </button>
    </div>
  );
};
