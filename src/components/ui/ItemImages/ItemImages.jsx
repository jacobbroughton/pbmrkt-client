import { useDispatch } from "react-redux";
import { toggleModal } from "../../../redux/modals";
import { ExpandIcon } from "../Icons/ExpandIcon";
import "./ItemImages.css";

export function ItemImages({ photos, selectedPhoto, setSelectedPhoto }) {
  const dispatch = useDispatch();
  console.log(photos)
  return (
    <div className="item-images">
      <div
        className="main-image-parent"
        onDoubleClick={() =>
          dispatch(toggleModal({ key: "fullScreenImageModal", value: true }))
        }
      >
        {selectedPhoto ? (
          <img className="item-main-image" src={selectedPhoto.url} />
        ) : (
          <div className="main-image-placeholder"></div>
        )}
        <button
          className="expand-image-button"
          onClick={() =>
            dispatch(toggleModal({ key: "fullScreenImageModal", value: true }))
          }
        >
          <ExpandIcon />
        </button>
      </div>
      {photos.length > 1 && (
        <div className="item-thumbnails">
          {photos.map((image) => (
            <div className="item-thumbnail-image-container">
              <img
                key={image.id}
                className={`item-thumbnail-image ${
                  image.id === selectedPhoto?.id ? "selected" : ""
                }`}
                onClick={() => setSelectedPhoto(image)}
                onDoubleClick={() => {
                  setSelectedPhoto(image);
                  dispatch(toggleModal({ key: "fullScreenImageModal", value: true }));
                }}
                src={image.url}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
