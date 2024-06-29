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
import ResetPassword from "./components/pages/ResetPassword/ResetPassword.jsx";
import UpdatePassword from "./components/pages/UpdatePassword/UpdatePassword.jsx";
import LoadingOverlay from "./components/ui/LoadingOverlay/LoadingOverlay.jsx";
import { isOnMobile } from "./utils/usefulFunctions.js";
import MobileBottomNav from "./components/ui/MobileBottomNav/MobileBottomNav.jsx";
import LoginModal from "./components/ui/LoginModal/LoginModal.jsx";
import RegisterModal from "./components/ui/RegisterModal/RegisterModal.jsx";
import ResetPasswordModal from "./components/ui/ResetPasswordModal/ResetPasswordModal.jsx";

function App() {
  const dispatch = useDispatch();

  const { session, user } = useSelector((state) => state.auth);
  const  modals = useSelector((state) => state.modals);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [error, setError] = useState(null);

  async function getUser(passedSession) {
    try {
      if (!passedSession) throw "no session sent to getUser()";
      const { data: data, error: error } = await supabase.rpc("get_user_profile_simple", {
        p_username: passedSession.user.user_metadata.username,
      });

      if (error) {
        console.error(error);
        throw error.message;
      }

      if (!data[0]) {
        setSessionLoading(false);
        return;
      }

      const { data: data2, error: error2 } = supabase.storage
        .from("profile_pictures")
        .getPublicUrl(data[0].profile_picture_path || "placeholders/user-placeholder");

      if (error2) throw error2.message;

      let newUser = {
        ...passedSession.user,
        ...data[0],
        profile_picture_url: data2.publicUrl,
      };

      if (!session) {
        dispatch(setUser(newUser));
        dispatch(
          setSession({
            ...passedSession,
            user: newUser,
          })
        );
      }

      setSessionLoading(false);
    } catch (error) {
      console.error(error);
      setError(error);
      setSessionLoading(false);
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
      if (currentSession && _session?.user?.id == currentSession?.user?.id) return;
      currentSession = _session;
      if (_session) {
        getUser(_session);
      } else {
        setSessionLoading(false);
      }

      callback(event);
    });
  };

  useEffect(() => {
    setTimeout(() => {
      const {
        data: { subscription },
      } = onAuthStateChange((event, session) => {
        if (event == "SIGNED_OUT") {
          dispatch(setSession(null));
          dispatch(setUser(null));
        }

        console.log(event);
        return () => {
          subscription.unsubscribe();
        };
      });
    }, 0);
  }, []);

  if (sessionLoading)
    return <LoadingOverlay message={"Loading..."} verticalAlignment={"center"} />;

  const PrivateRoutes = () => {
    const userAuthenticated = session && !sessionLoading;
    return userAuthenticated ? <Outlet /> : <Navigate to="/login" />;
  };

  return (
    <>
      {isOnMobile() ? <MobileBottomNav /> : <Navbar />}
      <main>
        {error && <p className="error-text small-text">{error.toString()}</p>}
        <Routes>
          <Route element={<Listings />} path="/" />
          <Route element={<Register />} path="/register" />
          <Route element={<Login />} path="/login" />
          <Route element={<PrivateRoutes />}>
            <Route path="/sell" element={<Sell />} />
            {/* <Route path="/profile" element={<UserProfile />} /> */}
            <Route path="/update-password" element={<UpdatePassword />} />
          </Route>
          <Route path="/user/:username" element={<UserProfile />} />

          <Route element={<Item />} path="/listing/:itemID" />
          <Route element={<ResetPassword />} path="/reset-password" />
        </Routes>
        {modals.loginModalToggled && <LoginModal/>}
        {modals.registerModalToggled && <RegisterModal/>}
        {modals.resetPasswordModalToggled && <ResetPasswordModal/>}
      </main>
    </>
  );
}

export default App;
