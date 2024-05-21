import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import Listings from "./components/pages/Home/Home";
import Navbar from "./components/ui/Navbar/Navbar";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSession, setUser } from "./redux/auth.js";
import Sell from "./components/pages/Sell/Sell.jsx";
import Item from "./components/pages/Item/Item.jsx";
import { supabase } from "./utils/supabase.js";
import Login from "./components/pages/Login/Login.jsx";
import Register from "./components/pages/Register/Register.jsx";
import UserProfile from "./components/pages/UserProfile/UserProfile.jsx";
import SellerProfile from "./components/pages/SellerProfile/SellerProfile.jsx";
import ResetPassword from "./components/pages/ResetPassword/ResetPassword.jsx";
import UpdatePassword from "./components/pages/UpdatePassword/UpdatePassword.jsx";
import LoadingOverlay from "./components/ui/LoadingOverlay/LoadingOverlay.jsx";

function App() {
  const dispatch = useDispatch();

  const { session, user } = useSelector((state) => state.auth);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [error, setError] = useState(null);

  // function onAuthStateChange(callback) {
  //   let currentSession = null;
  //   return supabase.auth.onAuthStateChange((event, _session) => {
  //     if (currentSession && _session?.user?.id == currentSession?.user?.id) return;
  //     console.log({ currentSession, _session });
  //     // dispatch(setSession(_session));
  //     // dispatch(setUser(_session.user));
  //     // setSessionLoading(false);
  //     getUser(_session)
  //     callback(session);
  //   });
  // }

  async function getUser(passedSession) {
    try {
      const { data: data, error: error } = await supabase.rpc("get_user_profile_simple", {
        p_username: passedSession.user.user_metadata.username,
      });

      if (error) {
        console.log(error);
        throw error.message;
      }

      const sbUserWithDBUser = {
        ...passedSession.user,
        ...data[0],
      };

      if (!session)
        dispatch(
          setSession({
            ...passedSession,
            user: sbUserWithDBUser,
          })
        );

      setSessionLoading(false);
    } catch (error) {
      setError(error.toString());
    }
  }

  // useEffect(() => {
  //   setSessionLoading(true);
  //   supabase.auth.getSession().then(async ({ data: { _session } }) => {
  //     if (!_session) return;

  //     getUser();
  //   });

  //   const { data } = onAuthStateChange((_event, innerSession) => {
  //     if (sessionLoading) setSessionLoading(false);

  //     // if (_event === "INITIAL_SESSION") {
  //     //   if (!session) dispatch(setSession(innerSession));
  //     //   // handle initial session
  //     // } else if (_event === "SIGNED_IN") {
  //     //   // handle sign in event
  //     // } else if (_event === "SIGNED_OUT") {
  //     //   // handle sign out event
  //     // } else if (_event === "PASSWORD_RECOVERY") {
  //     //   // handle password recovery event
  //     // } else if (_event === "TOKEN_REFRESHED") {
  //     //   // handle token refreshed event
  //     // } else if (_event === "USER_UPDATED") {
  //     //   // handle user updated event
  //     // }
  //     // if (!user) getUser(innerSession)
  //     // if (user?.id !== innerSession?.user?.id) dispatch(setSession(innerSession))
  //   });

  //   return () => data.subscription.unsubscribe();
  // }, []);

  const onAuthStateChange = (callback) => {
    let currentSession;
    return supabase.auth.onAuthStateChange((event, _session) => {
      if (_session?.user?.id == currentSession?.user?.id) return;
      currentSession = _session;
      // dispatch(setSession(_session))
      getUser(_session);
      callback(event);
    });
  };

  useEffect(() => {
    setTimeout(() => {
      const {
        data: { subscription },
      } = onAuthStateChange((event, session) => {
        console.log(event);

        return () => {
          subscription.unsubscribe();
        };
      });
    }, 0);
  }, []);

  if (sessionLoading) return <LoadingOverlay message={"Loading..."} />;

  const PrivateRoutes = () => {
    console.log(session);
    const userAuthenticated = session && !sessionLoading;
    return userAuthenticated ? <Outlet /> : <Navigate to="/login" />;
  };

  return (
    <>
      <Navbar />
      <main>
        {error && <p className="error-text small-text">{error}</p>}
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
