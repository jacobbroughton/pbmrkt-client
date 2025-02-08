import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { toggleModal } from "../../../redux/modals";
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
      const { data: foundUserComplex } = await response.json();

      const urlSearchParams3 = new URLSearchParams({
        reviewee_id: foundUserComplex.id,
      }).toString();

      const response4 = await fetch(
        `http://localhost:4000/get-seller-reviews?${urlSearchParams3}`,
        {
          method: "get",
          credentials: "include",
        }
      );

      if (!response4.ok) throw new Error("Something happened get-seller-reviews");

      let { data: data4 } = await response4.json();

      if (!data4) throw new Error("Seller reviews not found");

      setReviews({
        count: data4.length,
        list: data4,
      });

      setLocalUser(foundUserComplex);

      getListings(foundUserComplex);
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

      const response = await fetch(`http://localhost:4000/get-items/?${paramsAsString}`);

      if (!response.ok)
        throw new Error("Something happened at get-items at user profile");

      let { data: data2 } = await response.json();

      if (!data2 || !data2.length === 0) throw new Error("No items were fetched");

      data2 = data2.map((item) => {
        return {
          ...item,
          profile_picture: "",
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

      setLocalUser({
        ...localUser,
        profile_image_url: newProfileImageUrl,
      });
    } catch (error) {
      console.error(error);
      setError(error.toString());
    }

    setNewProfilePictureLoading(false);
  }

  const isAdmin = user?.id == localUser?.id;

  if (loading)
    return <LoadingOverlay message="Loading user..." verticalAlignment={"center"} />;

  if (error) return <p className="error-text">{error.toString()}</p>;

  return (
    <main className="user-profile-page">
      <PageTitle title={`${localUser.username}'s Profile`} />
      {error && (
        <ErrorBanner
          error={error.toString()}
          handleCloseBanner={() => setError(null)}
          hasMargin={true}
        />
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
          className="cover-image"
          src={
            localUser.cover_image_url ||
            "../../../assets/background-images/placeholder-cover-image.png"
          }
        />

        {isAdmin && (
          <div className="edit-cover-image-container">
            <button
              className="edit-cover-image"
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
          <div className="profile-image-container">
            <img className="profile-image" src={localUser.profile_image_url} />
            {isAdmin && (
              <label htmlFor="change-profile-image">
                <input
                  type="file"
                  className=""
                  title="Edit profile picture"
                  id="change-profile-image"
                  onChange={uploadProfilePicture}
                />
                <EditIcon loading={newProfilePictureLoading} />
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
          photos={[{ url: localUser.cover_image_url }]}
          selectedPhoto={{ url: localUser.cover_image_url }}
        />
      )}
    </main>
  );
};
