import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { toggleModal } from "../../../redux/modals";
import { supabase } from "../../../utils/supabase";
import {
  capitalizeWords,
  getCheckedOps,
  getTimeAgo,
} from "../../../utils/usefulFunctions";
import { AddReviewModal } from "../../ui/AddReviewModal/AddReviewModal";
import { EditUserProfileModal } from "../../ui/EditUserProfileModal/EditUserProfileModal";
import { EditIcon } from "../../ui/Icons/EditIcon";
import { SortIcon } from "../../ui/Icons/SortIcon";
import { ListingGrid } from "../../ui/ListingGrid/ListingGrid";
import { LoadingOverlay } from "../../ui/LoadingOverlay/LoadingOverlay";
import { ModalOverlay } from "../../ui/ModalOverlay/ModalOverlay";
import { SellerReviewsModal } from "../../ui/SellerReviewsModal/SellerReviewsModal";
import { SkeletonsListingGrid } from "../../ui/SkeletonsListingGrid/SkeletonsListingGrid";
import { Stars } from "../../ui/Stars/Stars";
import "./UserProfile.css";
import { ErrorBanner } from "../../ui/ErrorBanner/ErrorBanner";
import { SortSelect } from "../../ui/SortSelect/SortSelect";
import { LocationIcon } from "../../ui/Icons/LocationIcon";
import { CalendarIcon } from "../../ui/Icons/CalendarIcon";
import { ListingList } from "../../ui/ListingList/ListingList";
import { CommentIcon } from "../../ui/Icons/CommentIcon";
import { SkeletonsListingList } from "../../ui/SkeletonsListingList/SkeletonsListingList";
import { ImageIcon } from "../../ui/Icons/ImageIcon";
import { EditCoverPhotoMenu } from "../../ui/EditCoverPhotoMenu/EditCoverPhotoMenu";
import { FullScreenImageModal } from "../../ui/FullScreenImageModal/FullScreenImageModal";
import PageTitle from "../../ui/PageTitle/PageTitle";
import { Tabs } from "../../ui/Tabs/Tabs";

export const UserProfile = () => {
  const { username: usernameFromURL } = useParams();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const {
    editUserProfileModalToggled,
    addReviewModalToggled,
    sellerReviewsModalToggled,
    editCoverPhotoMenuToggled,
    fullScreenImageModalToggled,
  } = useSelector((state) => state.modals);
  const [listings, setListings] = useState(null);
  const [coverPhotoStagedForFullScreen, setCoverPhotoStagedForFullScreen] =
    useState(false);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localUser, setLocalUser] = useState(null);
  const [reviews, setReviews] = useState({
    count: 0,
    list: [],
  });
  const [sort, setSort] = useState("Date (New-Old)");
  const [newProfilePictureLoading, setNewProfilePictureLoading] = useState(false);
  const [newCoverPhotoLoading, setNewCoverPhotoLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("For Sale");

  useEffect(() => {
    getProfile();
  }, [usernameFromURL]);

  useEffect(() => {
    if (localUser) getListings(localUser);
  }, [localUser, sort]);

  async function getProfile() {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:4000/auth/get-user-profile-complex/${usernameFromURL}`
      );

      if (!response.ok) {
        throw new Error(
          response.statusText || "There was a problem at get-user-profile-complex"
        );
      }
      const data = await response.json();

      if (!data[0]) throw new Error("No profile was found");

      const { data: data3, error: error3 } = supabase.storage
        .from("profile_pictures")
        .getPublicUrl(data[0].profile_picture_path || "placeholders/user-placeholder");

      if (error3) throw error3.message;

      data[0].profile_picture_url = data3.publicUrl;

      const urlSearchParams3 = new URLSearchParams({
        p_reviewee_id: data[0].id,
      }).toString();

      const response4 = await fetch(
        `http://localhost:4000/get-seller-reviews?${urlSearchParams3}`
      );

      if (!response4.ok) throw new Error("Something happened get-seller-reviews");

      let { data: data4 } = await response4.json();

      if (!data4) throw new Error("Seller reviews not found");

      const { data: data5, error: error5 } = supabase.storage
        .from("cover_photos")
        .getPublicUrl(
          data[0].cover_photo_path || "placeholders/user-cover-placeholder.png"
        );

      if (error5) throw error5.message;

      data[0].cover_photo_url = data5.publicUrl;

      setReviews({
        count: data4.length,
        list: data4,
      });

      setLocalUser(data[0]);

      getListings(data[0]);
    } catch (error) {
      console.error(error);
      setError(error.toString());
    }

    setLoading(false);
  }

  async function getListings(passedUser) {
    try {
      setListingsLoading(true);

      const initialConditionOptions = [
        { id: 0, value: "Brand New", checked: true },
        { id: 1, value: "Like New", checked: true },
        { id: 2, value: "Used", checked: true },
        { id: 3, value: "Heavily Used", checked: true },
        { id: 4, value: "Not Functional", checked: true },
      ];

      const initialShippingOptions = [
        { id: 0, value: "Willing to Ship", checked: true },
        { id: 1, value: "Local Only", checked: true },
      ];

      const initialTradeOptions = [
        { id: 0, value: "Accepting Trades", checked: true },
        { id: 1, value: "No Trades", checked: true },
      ];

      const initialNegotiableOptions = [
        { id: 0, value: "Firm", checked: true },
        { id: 1, value: "OBO/Negotiable", checked: true },
      ];

      const params = {
        search_value: "",
        min_price: 0,
        max_price: null,
        state: null,
        condition: getCheckedOps(initialConditionOptions),
        shipping: getCheckedOps(initialShippingOptions),
        trades: getCheckedOps(initialTradeOptions),
        negotiable: getCheckedOps(initialNegotiableOptions),
        sort: sort,
        seller_id: passedUser?.id,
        city: null,
        category_id: null,
      };

      const paramsAsString = new URLSearchParams(params).toString();

      const response = await fetch(`http://localhost:4000/get-items?${paramsAsString}`);

      if (!response.ok) throw new Error("Something happened get-items");

      let { data: data2 } = await response.json();

      if (!data2 || !data2.length === 0) throw new Error("No items were fetched");

      data2 = data2.map((item) => {
        const { data, error } = supabase.storage
          .from("profile_pictures")
          .getPublicUrl(item.profile_picture_path || "placeholders/user-placeholder");

        if (error) throw error.message;

        return {
          ...item,
          profile_picture: data.publicUrl,
        };
      });

      setListings(data2);
    } catch (error) {
      console.error(error);
    } finally {
      setListingsLoading(false);
    }
  }

  async function uploadProfilePicture(e) {
    try {
      setNewProfilePictureLoading(true);

      const thisUploadUUID = uuidv4();
      const file = e.target.files[0];
      const { data, error } = await supabase.storage
        .from("profile_pictures")
        .upload(`${user.id}/${thisUploadUUID}`, file, {
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

      let newProfilePictureUrl = data2.publicUrl;

      const response = await fetch("http://localhost:4000/add-profile-image", {
        method: "post",
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          generated_id: data.id,
          path: data.path,
          full_path: data.fullPath,
          user_id: user.id,
        }),
      });

      if (!response.ok) throw new Error("Something happened at add-profile-image");

      const { data: data3 } = await response.json();

      console.log(data);

      setLocalUser({
        ...localUser,
        profile_picture_url: newProfilePictureUrl,
      });

      // dispatch(
      //   setUserProfilePicture(newProfilePictureUrl)
      // );

      // setProfilePicture(data2[0].full_path);
    } catch (error) {
      console.error(error);
      setError(error.toString());
    }

    setNewProfilePictureLoading(false);
  }

  // async function uploadCoverPhoto(e) {
  //   try {
  //     setNewCoverPhotoLoading(true);

  //     const thisUploadUUID = uuidv4();
  //     const file = e.target.files[0];
  //     const { data, error } = await supabase.storage
  //       .from("cover_photos")
  //       .upload(`${user.id}/${thisUploadUUID}`, file, {
  //         cacheControl: "3600",
  //         upsert: false,
  //       });

  //     if (error) {
  //       console.error(error);
  //       throw error.message;
  //     }

  //     if (!data.path) throw "New profile picture path not found";

  //     const { data: data2, error: error2 } = supabase.storage
  //       .from("cover_photos")
  //       .getPublicUrl(data.path);

  //     if (error2) throw error2.message;

  //     let newCoverPhotoUrl = data2.publicUrl;

  //     const { data: data3, error: error3 } = await supabase.rpc("add_cover_photo", {
  //       p_generated_id: data.id,
  //       p_full_path: data.fullPath,
  //       p_path: data.path,
  //       p_user_id: user.id,
  //     });
  //     if (error3) throw error3.message;

  //     setLocalUser({
  //       ...localUser,
  //       cover_photo_url: newCoverPhotoUrl,
  //     });

  //     // dispatch(
  //     //   setUserCoverPhoto(newCoverPhotoUrl)
  //     // );

  //     // setCoverPhoto(data2[0].full_path);
  //   } catch (error) {
  //     console.error(error);
  //     setError(error.toString());
  //   }

  //   setNewCoverPhotoLoading(false);
  // }

  const isAdmin = user?.id == localUser?.id;

  if (loading)
    return <LoadingOverlay message="Loading user..." verticalAlignment={"center"} />;

  if (error) return <p className="error-text">{error.toString()}</p>;

  return (
    <main className="user-profile-page">
      <PageTitle title={`${localUser.username}'s Profile`} />
      {error && (
        <ErrorBanner error={error.toString()} handleCloseBanner={() => setError(null)} />
      )}
      <section
        className="cover-container"
        onDoubleClick={(e) => {
          e.stopPropagation();
          setCoverPhotoStagedForFullScreen(true);
          dispatch(toggleModal({ key: "editCoverPhotoMenu", value: false }));
          dispatch(toggleModal({ key: "fullScreenImageModal", value: true }));
        }}
      >
        <img
          className="cover-photo"
          src={
            localUser.cover_photo_url ||
            "../../../assets/background-images/placeholder-cover-photo.png"
          }
        />

        {isAdmin && (
          <div className="edit-cover-photo-container">
            <button
              className="edit-cover-photo"
              onClick={(e) => {
                e.stopPropagation();
                dispatch(
                  toggleModal({
                    key: "editCoverPhotoMenu",
                    value: !editCoverPhotoMenuToggled,
                  })
                );
              }}
            >
              <ImageIcon /> Edit Cover Photo
            </button>
            {editCoverPhotoMenuToggled && (
              <EditCoverPhotoMenu
                localUser={localUser}
                setLocalUser={setLocalUser}
                newCoverPhotoLoading={newCoverPhotoLoading}
                setNewCoverPhotoLoading={setNewCoverPhotoLoading}
                setCoverPhotoStagedForFullScreen={setCoverPhotoStagedForFullScreen}
              />
            )}
          </div>
        )}
      </section>
      <section className="main-profile-content">
        <div className="info-section">
          <div className="profile-picture-container">
            <img className="profile-picture" src={localUser.profile_picture_url} />
            {isAdmin && (
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
            )}
          </div>

          <div className="info">
            <h2 className="name">
              {localUser.first_name} {localUser.last_name}
            </h2>
            {/* <p className="username">{localUser.username}</p> */}
            <div className="key-info">
              <p>
                <LocationIcon />
                {!localUser.city || !localUser.state ? (
                  "No location has been added"
                ) : (
                  <>
                    {capitalizeWords(localUser.city)}, {localUser.state}
                  </>
                )}
              </p>
              <p title={new Date(localUser.created_at).toLocaleDateString()}>
                <CalendarIcon />
                Joined {getTimeAgo(new Date(localUser.created_at))}
              </p>
              <p>
                <CommentIcon /> No headline added
              </p>
            </div>
            <div className="info-item-container">
              <label>Buyer Reviews</label>
              <button
                className="stars-button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (reviews.count <= 0) return;
                  dispatch(toggleModal({ key: "sellerReviewsModal", value: true }));
                }}
                disabled={reviews.count == 0}
              >
                <Stars rating={localUser.rating} /> <span>({reviews.count})</span>
              </button>
            </div>
            <div className="info-item-container">
              <label>Bio</label>
              <p>{localUser.bio ? localUser.bio?.trim() : "No bio has been added"}</p>
            </div>
            {isAdmin && (
              <button
                className="edit-profile-button"
                onClick={() =>
                  dispatch(toggleModal({ key: "editUserProfileModal", value: true }))
                }
              >
                <EditIcon /> Edit Profile
              </button>
            )}
          </div>
        </div>
        <div className="controls-and-listings">
          <div className="listing-controls">
            <div className="tabs">
              <Tabs
                tabs={[
                  { label: "For Sale" },
                  { label: "Sold" },
                  { label: "Wanted" },
                  { label: "Saved" },
                ]}
                isSelected={(selectedLabel) => selectedLabel === selectedTab}
                onClick={(option) => setSelectedTab(option.label)}
              />
            </div>
            {/* <p className="my-listings">For Sale</p> */}
            <SortSelect sort={sort} setSort={setSort} />
          </div>
          {listingsLoading ? (
            <div className="listings-wrapper">
              <SkeletonsListingList hasOverlay={false} />
            </div>
          ) : listings?.length ? (
            <div className="listings-wrapper">
              <ListingList listings={listings} isOnUserProfile={true} />
            </div>
          ) : (
            <div className="listings-wrapper">
              <SkeletonsListingList
                message={
                  selectedTab === "For Sale"
                    ? `${localUser.username} hasn't created any for sale listings yet!`
                    : selectedTab === "Wanted"
                    ? `${localUser.username} hasn't created any wanted listings yet!`
                    : selectedTab === "Sold"
                    ? `${localUser.username} hasn't marked any listings as sold yet`
                    : selectedTab === "Saved"
                    ? `${localUser.username} hasn't saved any listings yet`
                    : ""
                }
                hasOverlay={true}
              />
            </div>
          )}
        </div>
      </section>

      {editUserProfileModalToggled && (
        <>
          <EditUserProfileModal setLocalUser={setLocalUser} localUser={localUser} />
          <ModalOverlay
            zIndex={9}
            onClick={() =>
              dispatch(toggleModal({ key: "editUserProfileModal", value: false }))
            }
          />
        </>
      )}
      {addReviewModalToggled && (
        <>
          <AddReviewModal
            seller={localUser}
            setReviews={setReviews}
            reviews={reviews}
            setSeller={setLocalUser}
          />
          <ModalOverlay zIndex={3} />
        </>
      )}
      {sellerReviewsModalToggled && (
        <>
          <SellerReviewsModal seller={localUser} reviews={reviews} zIndex={6} />
          <ModalOverlay zIndex={5} />
        </>
      )}
      {coverPhotoStagedForFullScreen && fullScreenImageModalToggled && (
        <FullScreenImageModal
          photos={[{ url: localUser.cover_photo_url }]}
          selectedPhoto={{ url: localUser.cover_photo_url }}
        />
      )}
    </main>
  );
};
