import { useParams } from "react-router-dom";
import "./UserProfile.css";
import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabase";
import { useSelector } from "react-redux";
import ListingGrid from "../ListingGrid/ListingGrid";

const UserProfile = () => {
  // const { userID } = useParams();
  const [listings, setListings] = useState();
  const [listingsLoading, setListingsLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = useSelector((state) => state.auth.session.user);

  useEffect(() => {
    getProfile();
  }, []);

  if (!listingsLoading) {
    setListingsLoading(true);
  }

  async function getProfile() {
    try {
      const { data, error } = await supabase.rpc("get_user_profile", {
        p_user_id: user.id,
      });

      if (error) throw error.message;

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
  }

  if (error) return <p>{error}</p>;

  return (
    <div className="user-profile-page">
      <h1>{user.username}</h1>
      <p>Account created {new Date(user.created_at).toLocaleString()}</p>
      <ListingGrid listings={listings} />
    </div>
  );
};
export default UserProfile;
