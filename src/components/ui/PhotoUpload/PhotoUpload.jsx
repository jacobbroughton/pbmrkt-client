import { useRef, useState } from "react";
import { useSelector } from "react-redux";
import { ImagesIcons } from "../Icons/ImagesIcons";
import { TrashIcon } from "../Icons/TrashIcon";
import { StarIcon } from "../Icons/StarIcon";
import { v4 as uuidv4 } from "uuid";
import "./PhotoUpload.css";
import { isOnMobile } from "../../../utils/usefulFunctions";

export function PhotoUpload({
  ref,
  isForWantedItem,
  generatedGroupId,
  photos,
  setPhotos,
  markedFieldKey,
  newCoverPhotoId,
  setNewCoverPhotoId,
  setError,
}) {
  const { user } = useSelector((state) => state.auth);
  const imageInputRef = useRef(null);
  const [draggingPhotos, setDraggingPhotos] = useState(false);
  const [numPhotosUploaded, setNumPhotosUploaded] = useState(0);
  const [totalPhotos, setTotalPhotos] = useState(null);
  const [imagesUploading, setImagesUploading] = useState(false);
  const [discardImagesLoading, setDiscardImagesLoading] = useState(false);

  function handleDragEnter(e) {
    e.preventDefault();
    setDraggingPhotos(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setDraggingPhotos(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDraggingPhotos(false);

    if (e.dataTransfer.files) {
      handleImageUpload(e.dataTransfer.files);
    } else {
      throw "Something happened while dropping images";
    }
  }

  let index = 0;
  async function handleImageUpload(imageFiles) {
    try {
      if (imageFiles.length > 5) {
        throw "Too many files uploaded, maximum: 5";
      }

      const tempImages = [];

      setTotalPhotos(imageFiles.length);

      setImagesUploading(true);

      // TODO - Make sure all images are uploaded

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];

        const formData = new FormData();
        formData.append("item_image_upload", file);
        formData.append("group_id", generatedGroupId);
        formData.append("is_cover", i == 0);

        // TODO - stopped here, next step: get formdata working on add-wanted-item-image-temp" (and other add-item-image queries)

        if (isForWantedItem) {
          const response = await fetch(
            "http://localhost:4000/add-wanted-item-image-temp",
            {
              method: "post",
              credentials: "include",
              body: formData,
            }
          );

          if (!response.ok)
            throw new Error("Something happened at add-wanted-item-image-temp");

          const data = await response.json();

          tempImages.push(data);
        } else {
          const response = await fetch("http://localhost:4000/add-item-image-temp", {
            method: "post",
            credentials: "include",
            body: formData,
          });

          if (!response.ok) throw new Error("Something happened at add-item-image-temp");

          const data = await response.json();

          tempImages.push(data);
        }

        index += 1;
        setNumPhotosUploaded(index);
      }

      setPhotos(tempImages);

      setImagesUploading(false);
      // }
    } catch (error) {
      console.error(error);
      setError(error.toString());
    }
  }
  function handleNewCoverImage(clickedPhoto) {
    setNewCoverPhotoId(clickedPhoto.id);
    setPhotos(
      photos.map((image) => ({
        ...image,
        is_cover: image.id == clickedPhoto.id,
      }))
    );
  }

  async function handleImageDelete(image) {
    const response = await fetch(
      isForWantedItem
        ? "http://localhost:4000/delete-temp-wanted-item-image"
        : "http://localhost:4000/delete-temp-image",
      {
        method: "post",
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          image_name: `temp/${user.id}/${generatedGroupId}/${image.name}`,
        }),
      }
    );

    if (!response.ok)
      throw new Error("Something happened at delete-temp-wanted-item-image");

    const photosLeft = photos.filter((image) => image.id != image.id);

    setPhotos(photosLeft);

    if (photosLeft.length === 0 && imageInputRef.current)
      imageInputRef.current.value = "";

    // TODO - need to delete from storage as well
  }

  async function handleDiscardImages(e) {
    try {
      e.preventDefault();
      // todo - need to delete from tables as well
      setDiscardImagesLoading(true);

      if (isForWantedItem) {
        const response = await fetch(
          "http://localhost:4000/delete-temp-wanted-item-images",
          {
            method: "post",
            headers: {
              "content-type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              user_id: user.id,
              group_id: generatedGroupId,
            }),
          }
        );

        if (!response.ok)
          throw new Error("Something happened at delete-temp-wanted-item-images");
      } else {
        const response = await fetch("http://localhost:4000/delete-temp-images", {
          method: "post",
          headers: {
            "content-type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            user_id: user.id,
            group_id: generatedGroupId,
          }),
        });

        if (!response.ok) throw new Error("Something happened at delete-temp-images");
      }

      setPhotos([]);
      setNumPhotosUploaded(0);
      setDiscardImagesLoading(false);
    } catch (error) {
      console.error(error);
      setError(error.toString());
    }
  }

  const imagesLoadingInitially = imagesUploading && !numPhotosUploaded;
  const imagesLoadingSubsequently = imagesUploading && numPhotosUploaded;

  return (
    <div
      className={`form-block image-uploader ${
        markedFieldKey == "images" ? "marked" : ""
      }`}
    >
      <div className="form-content">
        {photos.length != 0 && (
          <div className="selling-item-images">
            {photos?.map((image) => {
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
                    // src={`https://mrczauafzaqkmjtqioan.supabase.co/storage/v1/object/public/${
                    //   isForWantedItem ? "wanted_item_images" : "item_images"
                    // }/temp/${user.id}/${generatedGroupId}/${
                    //   image.name
                    // }?width=73&height=73`}
                    src={image.url}
                  />
                </div>
              );
            })}
          </div>
        )}
        {photos.length == 0 ? (
          <div className="image-input-and-prompt">
            {(imagesLoadingInitially || imagesLoadingSubsequently) && (
              <p className="small-text">
                {numPhotosUploaded}/{totalPhotos} Image{totalPhotos !== 0 ? "s" : ""}{" "}
                Uploaded
              </p>
            )}
            {imagesLoadingInitially ? (
              <div className="image-skeletons">
                <div className="image-skeleton">&nbsp;</div>
              </div>
            ) : imagesLoadingSubsequently ? (
              <div className="image-skeletons">
                {Array.from(Array(numPhotosUploaded)).map((item, i) => (
                  <div key={i} className="image-skeleton">
                    &nbsp;
                  </div>
                ))}
              </div>
            ) : (
              <label
                className={`image-upload ${markedFieldKey == "images" ? "marked" : ""} ${
                  photos.length > 0 ? "secondary" : ""
                } ${draggingPhotos ? "dragging" : ""}`}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                ref={ref}
              >
                <ImagesIcons />
                <div className="text">
                  <p>Add Photos (Up to 5)</p>
                  {!isOnMobile() && <p>or drag and drop</p>}
                </div>
                <input
                  onChange={(e) => handleImageUpload(e.target.files)}
                  type="file"
                  multiple
                  // accept=".jpg"
                  name="photos"
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
            {discardImagesLoading
              ? "Discarding Images..."
              : "Discard & Upload New Images"}
          </button>
        )}
      </div>
    </div>
  );
}
