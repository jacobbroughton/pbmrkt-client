import { useParams } from "react-router-dom";
import "./SellerProfile.css";
import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabase";
import { useDispatch, useSelector } from "react-redux";
import { toggleModal } from "../../../redux/modals";
import ListingGrid from "../../ui/ListingGrid/ListingGrid";
import AddReviewModal from "../../ui/AddReviewModal/AddReviewModal";
import LoadingOverlay from "../../ui/LoadingOverlay/LoadingOverlay";
import SellerReviewsModal from "../../ui/SellerReviewsModal/SellerReviewsModal";
import ModalOverlay from "../../ui/ModalOverlay/ModalOverlay";
import { setFlag } from "../../../redux/flags";
import Stars from "../../ui/Stars/Stars";
import ItemSkeleton from "../../ui/Skeletons/ItemSkeleton/ItemSkeleton";

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
  const flags = useSelector((state) => state.flags);
  const dispatch = useDispatch();

  const { session } = useSelector((state) => state.auth);

  useEffect(() => {
    if (flags.sellerProfileNeedsUpdate) getProfile();
  }, [flags.sellerProfileNeedsUpdate]);

  useEffect(() => {
    getProfile();

    return () => {
      dispatch(toggleModal({ key: "addReviewModal", value: false }));
    };
  }, []);

  async function getProfile() {
    try {
      const { data: data1, error: error1 } = await supabase.rpc("get_seller_profile", {
        p_username: username,
        p_viewer_id: session?.user.id,
      });

      if (error1) throw error1.message;

      if (!data1[0]) throw "Seller not found";

      let fetchedSeller = data1[0];

      const { data: data2, error: error2 } = supabase.storage
        .from("profile_pictures")
        .getPublicUrl(fetchedSeller.profile_picture_path ||  "placeholders/user-placeholder");

      if (error2) throw error2.message


      setSeller({ ...fetchedSeller, profile_picture_url: data2.publicUrl });

      const { data: data3, error: error3 } = await supabase.rpc("get_seller_reviews", {
        p_reviewee_id: fetchedSeller.auth_id,
      });

      if (error3) throw error3.message;

      setReviews({
        count: data3.length,
        list: data3,
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
        p_seller_id: fetchedSeller.auth_id,
        p_city: "",
      });

      if (error) {
        console.error(error);
        throw error.message;
      }

      if (!data) throw "No listings available";

      setListings(data);

      dispatch(setFlag({ key: "sellerProfileNeedsUpdate", value: false }));
    } catch (error) {
      console.error(error);
      setError(error);
    }
    setListingsLoading(false);
    setProfileLoading(false);
  }

  useEffect(() => {
    console.log(seller)
  }, [seller])

  if (error) return <p>{error}</p>;

  if (listingsLoading) return <LoadingOverlay message="Fetching seller profile..." />;

  if (!seller) return "Seller not found";

  return (
    <div className="seller-profile-page">
      {/* <div className="picture-and-info">
        <div className="profile-picture-container">
          <div className="profile-picture">&nbsp;</div>
        </div>
        <div className="info">
          <h1>{seller.username}</h1>
          <p>Member since {new Date(seller.created_at).toLocaleDateString()}</p>
          <button
            className="stars-button"
            onClick={() =>
              dispatch(toggleModal({ key: "sellerReviewsModal", value: true }))
            }
          >
            <Stars rating={session.user.rating} /> ({reviews.count})
          </button>
        </div>
      </div> */}
      <div className="picture-and-info">
        <div className="profile-picture-container">
          <img className="profile-picture" src={seller.profile_picture_url} />
        </div>
        <div className="info">
          <h1>{session.user.username}</h1>
          <p>Member since {new Date(session.user.created_at).toLocaleDateString()}</p>
          <button
            className="stars-button"
            onClick={() =>
              dispatch(toggleModal({ key: "userReviewsModal", value: true }))
            }
          >
            <Stars rating={session.user.rating} /> <span>({reviews.count})</span>
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
      {listings.length ? (
        <ListingGrid listings={listings} />
      ) : (
        <div className="skeletons-grid">
          <div className="overlay-content">
            <p>{seller?.username} hasn't created any listings yet</p>
          </div>
          <div className="gradient-overlay"></div>
          <ItemSkeleton blinking={false} />
          <ItemSkeleton blinking={false} />
          <ItemSkeleton blinking={false} />
          <ItemSkeleton blinking={false} />
          <ItemSkeleton blinking={false} />
          <ItemSkeleton blinking={false} />
          <ItemSkeleton blinking={false} />
          <ItemSkeleton blinking={false} />
          <ItemSkeleton blinking={false} />
          <ItemSkeleton blinking={false} />
        </div>
      )}
      {modals.addReviewModalToggled && (
        <>
          <AddReviewModal
            seller={seller}
            setReviews={setReviews}
            reviews={reviews}
            setSeller={setSeller}
          />
          <LoadingOverlay />
        </>
      )}
      {modals.sellerReviewsModalToggled && (
        <>
          <SellerReviewsModal seller={seller} setReviews={setReviews} reviews={reviews} />
          {/* <LoadingOverlay /> */}
          <ModalOverlay zIndex={1} />
        </>
      )}
    </div>
  );
};
export default SellerProfile;
