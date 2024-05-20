import { useParams } from "react-router-dom";
import "./UserProfile.css";
import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabase";
import { useDispatch, useSelector } from "react-redux";
import ListingGrid from "../../ui/ListingGrid/ListingGrid";
import LoadingOverlay from "../../ui/LoadingOverlay/LoadingOverlay";
import Stars from "../../ui/Stars/Stars";
import { toggleModal } from "../../../redux/modals";

const UserProfile = () => {
  // const { userID } = useParams();
  const dispatch = useDispatch();
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState({
    count: 0,
    list: [],
  });

  const user = useSelector((state) => state.auth.session.user);

  useEffect(() => {
    getProfile();
  }, []);

  // if (!loading) {
  //   setLoading(true);
  // }

  async function getProfile() {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_user_profile", {
        p_user_id: user.id,
      });

      if (error) {
        console.log(error);
        throw error.message;
      }

      console.log(data);

      // Get Items
      const { data: data2, error: error2 } = await supabase.rpc("get_items", {
        p_search_value: "",
        p_brand: "",
        p_model: "",
        p_min_price: 0,
        p_max_price: null,
        p_state: "",
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
        p_seller_id: user.id,
        p_city: "",
      });

      if (error2) throw error2.message;
      if (!data2) throw "No listings available";

      setListings(data2);

      console.log({ data2, error2 });
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  }

  if (error) return <p>{error}</p>;

  if (loading) return <LoadingOverlay />;

  return (
    <div className="user-profile-page">
      {error && <p className="error-text small-text">{error}</p>}
      <div className="picture-and-info">
        <div className="profile-picture-container">
          <div className="profile-picture">&nbsp;</div>
        </div>
        <div className="info">
          <h1>{user.username}</h1>
          <p>Member since {new Date(user.created_at).toLocaleDateString()}</p>
          <div className="stars-and-reviews-button">
            <Stars rating={user.rating} />
            <div className="buttons">
              <button
                onClick={() =>
                  dispatch(toggleModal({ key: "sellerReviewsModal", value: true }))
                }
              >
                {reviews.count} Reviews
              </button>
              {/* {!seller.review_given && (
                <button
                  className="button add-review-button"
                  onClick={() =>
                    dispatch(
                      toggleModal({
                        key: "addReviewModal",
                        value: !modals.addReviewModalToggled,
                      })
                    )
                  }
                >
                  Leave a review
                </button>
              )} */}
            </div>
          </div>
        </div>
      </div>
      {listings.length ? <ListingGrid listings={listings} /> : <p>No listings found</p>}
    </div>
  );
};
export default UserProfile;
