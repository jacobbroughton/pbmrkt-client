import { useSelector } from "react-redux";
import { ImagesIcons } from "../Icons/ImagesIcons";
import { StarIcon } from "../Icons/StarIcon";

export const ImagesInput = ({ images, marked }) => {
  const { user } = useSelector((state) => state.auth);

  function handleNewCoverImage() {
    alert("handleNewCoverImage doesn't do anything")
  }

  return (
    <div>
      {images.length != 0 && (
        <div className="selling-item-images">
          {images?.map((image) => {
            return (
              <div
                key={image.id}
                className={`image-container ${
                  image.id == newCoverPhotoId ? "cover" : ""
                }`}
                onClick={() => handleNewCoverImage(image)}
              >
                {image.is_cover && (
                  <StarIcon title="Marked as 'cover image'. Meaning this image will show in the feed of items for sale, and will be featured on the item listing." />
                )}
                <img
                  src={`https://mrczauafzaqkmjtqioan.supabase.co/storage/v1/object/public/item_images/temp/${user.auth_id}/${generatedGroupId}/${image.name}?width=73&height=73`}
                />
              </div>
            );
          })}
        </div>
      )}
      {images.length == 0 ? (
        <div className="image-input-and-prompt">
          {(imagesStillUploading || imageSkeletonsShowing) && (
            <p className="small-text">
              {numPhotosUploaded}/{totalPhotos} Image{totalPhotos > 1 ? "s" : ""} Uploaded
            </p>
          )}
          {imagesStillUploading ? (
            <div className="image-skeletons">
              <div className="image-skeleton">&nbsp;</div>
            </div>
          ) : imageSkeletonsShowing ? (
            <div className="image-skeletons">
              {Array.from(Array(numPhotosUploaded)).map((item, i) => (
                <div key={i} className="image-skeleton">
                  &nbsp;
                </div>
              ))}
            </div>
          ) : (
            <label
              className={`custom-photo-upload ${marked ? "marked" : ""} ${
                images.length > 0 ? "secondary" : ""
              } ${draggingPhotos ? "dragging" : ""}`}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              // ref={imagesRef}
            >
              <ImagesIcons />
              <div className="text">
                <p>Add Photos (Up to 5)</p>
                <p>or drag and drop</p>
              </div>
              <input
                onChange={(e) => handleImageUpload(e.target.files)}
                type="file"
                multiple
                accept=".jpg"
                name="images"
                ref={imageInputRef}
                capture
              />
            </label>
          )}
        </div>
      ) : (
        <button
          onClick={handleDiscardImages}
          className="reset-images-button"
          disabled={discardImagesLoading}
        >
          <TrashIcon />{" "}
          {discardImagesLoading ? "Discarding Images..." : "Discard & Upload New Images"}
        </button>
      )}
    </div>
  );
};
