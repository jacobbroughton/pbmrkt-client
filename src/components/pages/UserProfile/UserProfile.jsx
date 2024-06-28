import { Link, useParams } from "react-router-dom";
import "./UserProfile.css";
import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabase";
import { useDispatch, useSelector } from "react-redux";
import ListingGrid from "../../ui/ListingGrid/ListingGrid";
import LoadingOverlay from "../../ui/LoadingOverlay/LoadingOverlay";
import Stars from "../../ui/Stars/Stars";
import { toggleModal } from "../../../redux/modals";
import { v4 as uuidv4 } from "uuid";
import EditIcon from "../../ui/Icons/EditIcon";
import ItemSkeleton from "../../ui/Skeletons/ItemSkeleton/ItemSkeleton";
import Footer from "../../ui/Footer/Footer";
import ThreeDots from "../../ui/Icons/ThreeDots";
import EditUserProfileModal from "../../ui/EditUserProfileModal/EditUserProfileModal";
import ModalOverlay from "../../ui/ModalOverlay/ModalOverlay";
import SkeletonsListingGrid from "../../ui/SkeletonsListingGrid/SkeletonsListingGrid";
import { getTimeAgo } from "../../../utils/usefulFunctions";
import AddReviewModal from "../../ui/AddReviewModal/AddReviewModal";
import SellerReviewsModal from "../../ui/SellerReviewsModal/SellerReviewsModal";

const UserProfile = () => {
  const { username: usernameFromURL } = useParams();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const modals = useSelector((state) => state.modals);
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localUser, setLocalUser] = useState(null);
  const [reviews, setReviews] = useState({
    count: 0,
    list: [],
  });
  const [newProfilePictureLoading, setNewProfilePictureLoading] = useState(false);

  useEffect(() => {
    getProfile();
  }, []);

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

      console.log(data[0]);

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

      // (p_brand, p_category_id, p_city, p_condition, p_max_price, p_min_price, p_model, p_negotiable, p_search_value, p_seller_id, p_shipping, p_sort, p_state, p_trades)

      let { data: data2, error: error2 } = await supabase.rpc("get_items", {
        p_search_value: "",
        p_brand: "",
        p_model: "",
        p_min_price: 0,
        p_max_price: null,
        p_state: null,
        p_condition: [
          { id: 0, value: "Brand New", checked: true },
          { id: 1, value: "Like New", checked: true },
          { id: 2, value: "Used", cdhecked: true },
          { id: 3, value: "Heavily Used", checked: true },
          { id: 4, value: "Not Functional", checked: true },
        ]
          .filter((option) => option.checked)
          .map((option) => option.value),
        p_shipping: [
          { id: 0, value: "Willing to Ship", checked: true },
          { id: 1, value: "Local Only", checked: true },
        ]
          .filter((option) => option.checked)
          .map((option) => option.value),
        p_trades: [
          { id: 0, value: "Accepting Trades", checked: true },
          { id: 1, value: "No Trades", checked: true },
        ]
          .filter((option) => option.checked)
          .map((option) => option.value),
        p_negotiable: [
          { id: 0, value: "Firm", checked: true },
          { id: 1, value: "OBO/Negotiable", checked: true },
        ]
          .filter((option) => option.checked)
          .map((option) => option.value),
        p_sort: "Date Listed (New-Old)",
        p_seller_id: data[0]?.auth_id,
        p_city: null,
        p_category_id: null,
      });

      if (error2) throw error2.message;

      if (!data2) throw "No listings available";

      console.log(data2)

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
      setError(error.toString());
    }

    setLoading(false);
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

      console.log(data);

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

  return (
    <>
      <div className="user-profile-page">
        {error && <p className="error-text small-text">{error.toString()}</p>}
        <div className="info-section">
          <div className="picture-and-info">
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
              <h3 className="username">{localUser.username}</h3>
              <p className="member-since" title="">
                Joined {getTimeAgo(new Date(localUser.created_at))} |{" "}
                {new Date(localUser.created_at).toLocaleDateString()}
              </p>
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

              {/* <button
              className="stars-button"
              onClick={() =>
                dispatch(toggleModal({ key: "userReviewsModal", value: true }))
              }
              disabled={reviews.count == 0}
            >
              <Stars rating={localUser.rating} /> <span>({reviews.count})</span>
            </button> */}
            </div>
            {/* <button
            className="edit-button"
            onClick={() =>
              dispatch(toggleModal({ key: "editUserProfileModal", value: true }))
            }
          >
            <ThreeDots />
          </button> */}
          </div>
          <div className="user-info-containers">
            <div className="user-info-container">
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
            <div className="user-info-container">
              <label>Location</label>
              <p>
                {!localUser.city || !localUser.state ? (
                  "No location has been added"
                ) : (
                  <>
                    {localUser.city}, {localUser.state}
                  </>
                )}
              </p>
            </div>
            <div className="user-info-container bio ">
              <label>Bio</label>
              <p>
                {localUser.bio
                  ? localUser.bio?.trim()
                  : "No bio has been added"}
              </p>
            </div>
          </div>
        </div>
        {listings?.length ? (
          <ListingGrid listings={listings} />
        ) : (
          <SkeletonsListingGrid
            message={`${localUser.username} hasn't created any listings yet!`}
            // link={{ url: "/sell", label: "Sell something" }}
            blinking={false}
            hasOverlay={true}
            numSkeletons={10}
          />
        )}

        {modals.editUserProfileModalToggled && (
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
        {modals.addReviewModalToggled && (
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
        {modals.sellerReviewsModalToggled && (
          <>
            <SellerReviewsModal
              seller={localUser}
              reviews={reviews}
            />
            <ModalOverlay zIndex={5} />
          </>
        )}
      </div>
      {/* <Footer /> */}
    </>
  );
};
export default UserProfile;
