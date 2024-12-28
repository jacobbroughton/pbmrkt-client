import { useRef, useState } from "react";
import { supabase } from "../../../utils/supabase";
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

      for (let i = 0; i < imageFiles.length; i++) {
        const thisUploadUUID = uuidv4();
        const file = imageFiles[i];
        const { data, error } = await supabase.storage
          .from(isForWantedItem ? "wanted_item_images" : "item_images")
          .upload(`temp/${user.auth_id}/${generatedGroupId}/${thisUploadUUID}`, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          console.error(error);
          throw error.message;
        }

        if (isForWantedItem) {
          const response = await fetch(
            "http://localhost:4000/add-wanted-item-photo-temp",
            {
              method: "post",
              headers: {
                "content-type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({
                group_id: generatedGroupId,
                generated_id: data.id,
                full_path: data.fullPath,
                path: data.path,
                is_cover: i == 0,
                created_by_id: user.auth_id,
              }),
            }
          );

          if (!response.ok)
            throw new Error("Something happened at add-wanted-item-photo-temp");

          const data = await response.json();

          tempImages.push(data[0]);
        } else {
          const response = await fetch("http://localhost:4000/add-item-photo-temp", {
            method: "post",
            headers: {
              "content-type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              group_id: generatedGroupId,
              generated_id: data.id,
              full_path: data.fullPath,
              path: data.path,
              is_cover: i == 0,
              created_by_id: user.auth_id,
            }),
          });

          if (!response.ok) throw new Error("Something happened at add-item-photo-temp");

          const data = await response.json();

          tempImages.push(data[0]);
        }

        index += 1;
        setNumPhotosUploaded(index);
      }

      const { data, error } = await supabase.storage
        .from(isForWantedItem ? "wanted_item_images" : "item_images")
        .list(`temp/${user.auth_id}/${generatedGroupId}/`, {
          limit: 100,
          offset: 0,
        });

      if (error) {
        console.error(error);
        throw error.message;
      }

      setNewCoverPhotoId(data[0].id);
      setPhotos(
        data.map((photo, i) => ({
          ...photo,
          is_cover: i == 0,
        }))
      );

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
      photos.map((photo) => ({
        ...photo,
        is_cover: photo.id == clickedPhoto.id,
      }))
    );
  }

  async function handleImageDelete(image) {
    if (isForWantedItem) {
      const response = await fetch(
        "http://localhost:4000/delete-temp-wanted-item-image",
        {
          method: "post",
          headers: {
            "content-type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            mage_name: `temp/${user.auth_id}/${generatedGroupId}/${image.name}`,
          }),
        }
      );

      if (!response.ok)
        throw new Error("Something happened at delete-temp-wanted-item-image");
    } else {
      const response = await fetch("http://localhost:4000/delete-temp-image", {
        method: "post",
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          image_name: `temp/${user.auth_id}/${generatedGroupId}/${image.name}`,
        }),
      });

      if (!response.ok) throw new Error("Something happened at delete-temp-image");
    }

    const photosLeft = photos.filter((photo) => photo.id != image.id);

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

      const paths = photos.map(
        (photo) => `temp/${user.auth_id}/${generatedGroupId}/${photo.name}`
      );

      const { data, error } = await supabase.storage
        .from(isForWantedItem ? "wanted_item_images" : "item_images")
        .remove(paths);

      if (error) {
        console.error(error);
        throw error.message;
      }

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
              user_id: user.auth_id,
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
            user_id: user.auth_id,
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
      className={`form-block photo-uploader ${
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
                    src={`https://mrczauafzaqkmjtqioan.supabase.co/storage/v1/object/public/${
                      isForWantedItem ? "wanted_item_images" : "item_images"
                    }/temp/${user.auth_id}/${generatedGroupId}/${
                      image.name
                    }?width=73&height=73`}
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
                className={`photo-upload ${markedFieldKey == "images" ? "marked" : ""} ${
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
