import { useParams } from "react-router-dom";
import "./Profile.css";
import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabase";

const Profile = () => {
  const { userID } = useParams();
  const [listingsLoading, setListingsLoading] = useState(true);

  useEffect(() => {
    getProfile();
  }, []);

  if (!listingsLoading) {
    setListingsLoading(true);
  }

  // auth.session.user
  // user: {
  //   id: '01646d43-7dd2-421e-a933-582d50a8b1e0',
  //   aud: 'authenticated',
  //   role: 'authenticated',
  //   email: 'jlbroughton88@gmail.com',
  //   email_confirmed_at: '2024-04-21T02:22:43.026385Z',
  //   phone: '',
  //   confirmation_sent_at: '2024-04-21T02:21:59.053762Z',
  //   confirmed_at: '2024-04-21T02:22:43.026385Z',
  //   last_sign_in_at: '2024-05-09T13:16:16.261137Z',
  //   app_metadata: {
  //     provider: 'email',
  //     providers: [
  //       'email'
  //     ]
  //   },
  //   user_metadata: {
  //     email: 'jlbroughton88@gmail.com',
  //     email_verified: false,
  //     phone_verified: false,
  //     sub: '01646d43-7dd2-421e-a933-582d50a8b1e0'
  //   },
  //   identities: [
  //     {
  //       identity_id: '2c1fb681-8a8d-49a1-88d7-d65303e5bdb2',
  //       id: '01646d43-7dd2-421e-a933-582d50a8b1e0',
  //       user_id: '01646d43-7dd2-421e-a933-582d50a8b1e0',
  //       identity_data: {
  //         email: 'jlbroughton88@gmail.com',
  //         email_verified: false,
  //         phone_verified: false,
  //         sub: '01646d43-7dd2-421e-a933-582d50a8b1e0'
  //       },
  //       provider: 'email',
  //       last_sign_in_at: '2024-04-21T02:21:59.050467Z',
  //       created_at: '2024-04-21T02:21:59.05051Z',
  //       updated_at: '2024-04-21T02:21:59.05051Z',
  //       email: 'jlbroughton88@gmail.com'
  //     }
  //   ],
  //   created_at: '2024-04-21T02:21:59.048343Z',
  //   updated_at: '2024-05-10T11:05:52.123632Z',
  //   is_anonymous: false
  async function getProfile() {
    // Get seller's profile

    const {data: sellerProfileData, error: error2} = await supabase.rpc('get_items', {
      p_user_email: userID
    })
    
    // Get Items
    const { data, error } = await supabase.rpc("get_items", {
      p_search_value: "",
      p_brand: "",
      p_model: "",
      p_min_price: 0,
      p_max_price: null,
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
      p_seller_id: sellerProfileData.id,
      p_location: "",
    });

    if (!data) throw "No listings available";
    console.log({ data, error });
  }

  return <div>{userID}</div>;
};
export default Profile;
