import ModalOverlay from "../ModalOverlay/ModalOverlay";
import XIcon from "../Icons/XIcon";
import { useDispatch } from "react-redux";
import { toggleModal } from "../../../redux/modals";
import "./FullScreenImageModal.css";
import Arrow from "../Icons/Arrow";
import { useEffect, useState } from "react";

const FullScreenImageModal = ({ photos, selectedPhoto }) => {
  const dispatch = useDispatch();

  photos = photos.map((photo, i) => ({
    ...photo,
    index: i,
  }));

  const [selectedPhotoLocal, setSelectedPhotoLocal] = useState(
    selectedPhoto
      ? {
          ...selectedPhoto,
          index:
            photos.find((innerPhoto) => innerPhoto.id == selectedPhoto.id)?.index || 0,
        }
      : null
  );

  console.log(selectedPhotoLocal);

  useEffect(() => {
    console.log("asdf");
  }, [selectedPhotoLocal]);

  function handlePreviousPhoto() {
    if (selectedPhotoLocal?.index <= 0) {
      setSelectedPhotoLocal(photos[photos.length - 1]);
      return;
    }
    setSelectedPhotoLocal(photos[selectedPhotoLocal?.index - 1]);
  }

  function handleNextPhoto() {
    if (selectedPhotoLocal?.index >= photos.length - 1) {
      setSelectedPhotoLocal(photos[0]);
      return;
    }
    setSelectedPhotoLocal(photos[selectedPhotoLocal?.index + 1]);
  }

  return (
    <>
      <div className="modal full-screen-image-modal">
      <div className="item-thumbnails">
          {photos.length > 1 && photos.map((photo) => (
             <div className="item-thumbnail-image-container">
            <img
              key={photo.id}
              className={`item-thumbnail-image ${
                photo.id === selectedPhotoLocal?.id ? "selected" : ""
              }`}
              onClick={() => setSelectedPhotoLocal(photo)}
              src={photo.url}
            />
            </div>
          ))}
        </div>
          <button
            className="close-button"
            onClick={() =>
              dispatch(toggleModal({ key: "fullScreenImageModal", value: false }))
            }
          >
            Close <XIcon />
          </button>
        <div className="image-container">
      
          <img src={selectedPhotoLocal?.url} />
          {photos?.length > 1 && (
            <div className="buttons-overlay">
              <button className="previous" onClick={handlePreviousPhoto}>
                <Arrow direction="left" />
              </button>
              <button className="next" onClick={handleNextPhoto}>
                <Arrow direction="right" />
              </button>
            </div>
          )}
        </div>

      </div>
      <ModalOverlay
        zIndex={6}
        onClick={() =>
          dispatch(toggleModal({ key: "fullScreenImageModal", value: false }))
        }
      />
    </>
  );
};
export default FullScreenImageModal;
