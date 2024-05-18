import { useParams } from "react-router-dom";
import "./SellerProfile.css";
import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabase";
import { useDispatch, useSelector } from "react-redux";
import { toggleModal } from "../../../redux/modals";
import ListingGrid from "../ListingGrid/ListingGrid";
import AddReviewModal from "../../ui/AddReviewModal/AddReviewModal";
import LoadingOverlay from "../../ui/LoadingOverlay/LoadingOverlay";
import SellerReviewsModal from "../../ui/SellerReviewsModal/SellerReviewsModal";

const SellerProfile = () => {
  const { username } = useParams();
  const [listings, setListings] = useState(null);
  const [seller, setSeller] = useState(null);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [reviews, setReviews] = useState({
    count: 0,
    list: [],
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState(null);
  const modals = useSelector((state) => state.modals);
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.session.user);

  useEffect(() => {
    getProfile();

    return () => {
      dispatch(toggleModal({ key: "addReviewModal", value: false }));
    };
  }, []);

  // if (!listingsLoading) {
  //   setListingsLoading(true);
  // }

  async function getProfile() {
    try {
      const { data: data1, error: error1 } = await supabase.rpc("get_seller_profile", {
        p_username: username,
        p_viewer_id: user.id,
      });

      if (error1) throw error1.message;

      if (!data1[0]) throw "Seller not found";

      const fetchedSeller = data1[0];

      setSeller(fetchedSeller);

      const { data: reviews, error: error2 } = await supabase.rpc("get_seller_reviews", {
        p_reviewee_id: fetchedSeller.auth_id,
      });

      if (error2) throw error2.message;

      console.log("reviews for seller", reviews);

      setReviews({
        count: reviews.length,
        list: reviews,
      });

      // Get Items
      const { data, error } = await supabase.rpc("get_items", {
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

      if (error) { console.log(error); throw error.message; }

      if (!data) throw "No listings available";

      console.log({ data, error });
      setListings(data);
    } catch (error) {
      console.log(error);
    }
    setListingsLoading(false);
    setProfileLoading(false);
  }

  console.log(reviews);

  if (error) return <p>{error}</p>;

  if (listingsLoading) return <LoadingOverlay message="Fetching seller profile..." />;

  if (!seller) return "Seller not found";

  return (
    <div className="seller-profile-page">
      <h1>{seller.username}</h1>
      <div className="reviews">
        <button
          className="button reviews-list-toggle-button"
          onClick={() =>
            dispatch(toggleModal({ key: "sellerReviewsModal", value: true }))
          }
        >
          {reviews.count} Reviews
        </button>
        {!seller.review_given && (
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
        )}
      </div>
      <ListingGrid listings={listings} />
      {modals.addReviewModalToggled && (
        <>
          <AddReviewModal seller={seller} setReviews={setReviews} reviews={reviews} />
          <LoadingOverlay />
        </>
      )}
      {modals.sellerReviewsModalToggled && (
        <>
          <SellerReviewsModal seller={seller} setReviews={setReviews} reviews={reviews} />
          <LoadingOverlay />
        </>
      )}
    </div>
  );
};
export default SellerProfile;
