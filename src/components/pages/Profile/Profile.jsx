import { useParams } from "react-router-dom";
import "./Profile.css";
import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabase";
import { useSelector } from "react-redux";

const Profile = () => {
  // const { userID } = useParams();
  const [listingsLoading, setListingsLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = useSelector(state => state.auth.session.user)

  useEffect(() => {
    getProfile();
  }, []);

  if (!listingsLoading) {
    setListingsLoading(true);
  }

  async function getProfile() {
    try {

      const {data: data1, error: error1} = await supabase.rpc('get_user_profile_complex', {
        p_user_id: user.id
      })

      console.log(data1, error1)

      // const { data: sellerProfileData, error: error2 } = await supabase.rpc("get_items", {
      //   p_user_email: userID,
      // });

      // if (error2) throw error2.message;

      // if (!sellerProfileData) throw "No seller profile data found";

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

      if (!data) throw "No listings available";
      console.log({ data, error });
    } catch (error) {
      console.log(error);
    }
  }

  if (error) return <p>{error}</p>;
  return <div>{user.username}</div>;
};
export default Profile;
