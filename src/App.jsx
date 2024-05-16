import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import Listings from "./components/pages/Home/Home";
import Navbar from "./components/ui/Navbar/Navbar";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSession } from "./redux/auth.js";
import Sell from "./components/pages/Sell/Sell.jsx";
import Item from "./components/pages/Item/Item.jsx";
import { supabase } from "./utils/supabase.js";
import Login from "./components/pages/Login/Login.jsx";
import Register from "./components/pages/Register/Register.jsx";
import UserProfile from "./components/pages/UserProfile/UserProfile.jsx";
import SellerProfile from "./components/pages/SellerProfile/SellerProfile.jsx";
import ResetPassword from "./components/pages/ResetPassword/ResetPassword.jsx";
import UpdatePassword from "./components/pages/UpdatePassword/UpdatePassword.jsx";

function App() {
  const dispatch = useDispatch();

  const { session } = useSelector((state) => state.auth);
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    setSessionLoading(true);
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      try {
        console.log("here", session.user.id);

        const { data: data, error: error } = await supabase.rpc(
          "get_user_profile_simple",
          {
            p_username: session.user.user_metadata.username,
          }
        );

        if (error) throw error.message;
        console.log(data, error);

        const sbUserWithDBUser = {
          ...session.user,
          ...data[0],
        };

        dispatch(
          setSession({
            ...session,
            user: sbUserWithDBUser,
          })
        );
      } catch (error) {
        console.error(error.toString())
      }
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (sessionLoading) setSessionLoading(false);

      if (_event === "INITIAL_SESSION") {
        // handle initial session
      } else if (_event === "SIGNED_IN") {
        // handle sign in event
      } else if (_event === "SIGNED_OUT") {
        // handle sign out event
      } else if (_event === "PASSWORD_RECOVERY") {
        // handle password recovery event
      } else if (_event === "TOKEN_REFRESHED") {
        // handle token refreshed event
      } else if (_event === "USER_UPDATED") {
        // handle user updated event
      }

      console.log(session);
      dispatch(setSession(session));
    });

    return () => data.subscription.unsubscribe();
  }, []);

  if (sessionLoading) return <main>Loading...</main>;

  const PrivateRoutes = () => {
    const userAuthenticated = session && !sessionLoading;
    console.log("userAuthenticated", userAuthenticated);
    return userAuthenticated ? <Outlet /> : <Navigate to="/login" />;
  };

  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route element={<Listings />} path="/" />
          <Route element={<Register />} path="/register" />
          <Route element={<Login />} path="/login" />
          <Route element={<PrivateRoutes />}>
            <Route path="/sell" element={<Sell />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/update-password" element={<UpdatePassword />} />
          </Route>
          <Route path="/user/:username" element={<SellerProfile />} />

          <Route element={<Item />} path="/:itemID" />
          <Route element={<ResetPassword />} path="/reset-password" />
        </Routes>
      </main>
    </>
  );
}

export default App;
