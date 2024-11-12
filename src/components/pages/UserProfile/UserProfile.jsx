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

export const UserProfile = () => {
  const { username: usernameFromURL } = useParams();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const {
    editUserProfileModalToggled,
    addReviewModalToggled,
    sellerReviewsModalToggled,
  } = useSelector((state) => state.modals);
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localUser, setLocalUser] = useState(null);
  const [reviews, setReviews] = useState({
    count: 0,
    list: [],
  });
  const [sort, setSort] = useState("Date (New-Old)");
  const [newProfilePictureLoading, setNewProfilePictureLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("My Listings");

  useEffect(() => {
    getProfile();
  }, []);

  useEffect(() => {
    if (localUser) getListings(localUser);
  }, [localUser, sort]);

  async function getProfile() {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_user_profile_complex", {
        p_username: usernameFromURL,
      });

      if (error) {
        console.error(error);
        throw error.message;
      }

      if (!data[0]) throw new Error("No profile was found");

      const { data: data3, error: error3 } = supabase.storage
        .from("profile_pictures")
        .getPublicUrl(data[0].profile_picture_path || "placeholders/user-placeholder");

      if (error3) throw error3.message;

      data[0].profile_picture_url = data3.publicUrl;

      const { data: data4, error: error4 } = await supabase.rpc("get_seller_reviews", {
        p_reviewee_id: data[0].auth_id,
      });

      if (error4) throw error4.message;

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
    let { data: data2, error: error2 } = await supabase.rpc("get_items", {
      p_search_value: "",
      p_min_price: 0,
      p_max_price: null,
      p_state: null,
      p_condition: getCheckedOps([
        { id: 0, value: "Brand New", checked: true },
        { id: 1, value: "Like New", checked: true },
        { id: 2, value: "Used", checked: true },
        { id: 3, value: "Heavily Used", checked: true },
        { id: 4, value: "Not Functional", checked: true },
      ]),
      p_shipping: getCheckedOps([
        { id: 0, value: "Willing to Ship", checked: true },
        { id: 1, value: "Local Only", checked: true },
      ]),
      p_trades: getCheckedOps([
        { id: 0, value: "Accepting Trades", checked: true },
        { id: 1, value: "No Trades", checked: true },
      ]),
      p_negotiable: getCheckedOps([
        { id: 0, value: "Firm", checked: true },
        { id: 1, value: "OBO/Negotiable", checked: true },
      ]),
      p_sort: sort,
      p_seller_id: passedUser?.auth_id,
      p_city: null,
      p_category_id: null,
    });

    if (error2) throw error2.message;

    if (!data2) throw "No listings available";

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
  }

  async function uploadProfilePicture(e) {
    try {
      setNewProfilePictureLoading(true);

      const thisUploadUUID = uuidv4();
      const file = e.target.files[0];
      const { data, error } = await supabase.storage
        .from("profile_pictures")
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
        .from("profile_pictures")
        .getPublicUrl(data.path);

      if (error2) throw error2.message;

      let newProfilePictureUrl = data2.publicUrl;

      const { data: data3, error: error3 } = await supabase.rpc("add_profile_image", {
        p_generated_id: data.id,
        p_full_path: data.fullPath,
        p_path: data.path,
        p_user_id: user.auth_id,
      });
      if (error3) throw error3.message;

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

  const isAdmin = user?.auth_id == localUser?.auth_id;

  if (loading)
    return <LoadingOverlay message="Loading user..." verticalAlignment={"center"} />;

  if (error) return <p className="error-text">{error.toString()}</p>;

  return (
    <main className="user-profile-page">
      {error && (
        <ErrorBanner error={error.toString()} handleCloseBanner={() => setError(null)} />
      )}
      <section className="cover-container">
        <img className="cover-photo" />
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
                Edit Profile
              </button>
            )}
          </div>
        </div>
        {listings?.length ? (
          <div className="listings-wrapper">
            <div className="tabs">
              {["My Listings", "Saved Listings"].map((label) => (
                <button
                  onClick={() => setSelectedTab(label)}
                  className={`${label === selectedTab ? "selected" : ""}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="listing-controls">
              {/* <p className="my-listings">My Listings</p> */}
              <SortSelect sort={sort} setSort={setSort} />
            </div>
            <ListingList listings={listings} isOnUserProfile={true} />
          </div>
        ) : (
          <SkeletonsListingGrid
            message={`${localUser.username} hasn't created any listings yet!`}
            // link={{ url: "/sell", label: "Sell something" }}
            blinking={false}
            hasOverlay={true}
            numSkeletons={10}
          />
        )}
      </section>

      {editUserProfileModalToggled && (
        <>
          <EditUserProfileModal setLocalUser={setLocalUser} localUser={localUser} />
          <ModalOverlay
            zIndex={5}
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
    </main>
  );
};
