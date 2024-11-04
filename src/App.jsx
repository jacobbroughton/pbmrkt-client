import { Navigate, Outlet, Route, Routes, useNavigate } from "react-router-dom";
import { Listings } from "./components/pages/Home/Home";
import { Navbar } from "./components/ui/Navbar/Navbar";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSession, setUser } from "./redux/auth.js";
import { Sell } from "./components/pages/Sell/Sell.jsx";
import { Item } from "./components/pages/Item/Item.jsx";
import { supabase } from "./utils/supabase";
import { Login } from "./components/pages/Login/Login.jsx";
import { Register } from "./components/pages/Register/Register.jsx";
import { UserProfile } from "./components/pages/UserProfile/UserProfile.jsx";
import { ResetPassword } from "./components/pages/ResetPassword/ResetPassword.jsx";
import { UpdatePassword } from "./components/pages/UpdatePassword/UpdatePassword.jsx";
import { LoadingOverlay } from "./components/ui/LoadingOverlay/LoadingOverlay.jsx";
import { isOnMobile } from "./utils/usefulFunctions";
import { MobileBottomNav } from "./components/ui/MobileBottomNav/MobileBottomNav.jsx";
import { LoginModal } from "./components/ui/LoginModal/LoginModal.jsx";
import { RegisterModal } from "./components/ui/RegisterModal/RegisterModal.jsx";
import { ResetPasswordModal } from "./components/ui/ResetPasswordModal/ResetPasswordModal.jsx";
import FeedbackModal from "./components/ui/FeedbackModal/FeedbackModal.jsx";
import BugModal from "./components/ui/BugModal/BugModal.jsx";
import { SearchModal } from "./components/ui/SearchModal/SearchModal.jsx";
import { CreateWantedItem } from "./components/pages/CreateWantedItem/CreateWantedItem.jsx";
import { WantedItem } from "./components/pages/WantedItem/WantedItem.jsx";
import { ErrorBanner } from "./components/ui/ErrorBanner/ErrorBanner";
import { MobileSearchBar } from "./components/ui/MobileSearchBar/MobileSearchBar";

export function App() {
  const dispatch = useDispatch();

  const session = useSelector((state) => state.auth.session);
  const resetPasswordModalToggled = useSelector(
    (state) => state.modals.resetPasswordModalToggled
  );
  const registerModalToggled = useSelector((state) => state.modals.registerModalToggled);
  const loginModalToggled = useSelector((state) => state.modals.loginModalToggled);
  const bugModalToggled = useSelector((state) => state.modals.bugModalToggled);
  const feedbackModalToggled = useSelector((state) => state.modals.feedbackModalToggled);
  const searchModalToggled = useSelector((state) => state.modals.searchModalToggled);
  const navigate = useNavigate();
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
    if (!session && !sessionLoading) navigate("/login");

    setTimeout(() => {
      const {
        data: { subscription },
      } = onAuthStateChange((event) => {
        if (event == "SIGNED_OUT") {
          dispatch(setSession(null));
          dispatch(setUser(null));
        }

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
        {error && (
          <ErrorBanner
            error={error.toString()}
            handleCloseBanner={() => setError(null)}
          />
        )}
        <Routes>
          <Route path="*" element={<p>Page not found</p>} />
          <Route element={<Listings />} path="/" />
          <Route element={<Register />} path="/register" />
          <Route element={<Login />} path="/login" />
          <Route element={<PrivateRoutes />}>
            <Route path="/sell" element={<Sell />} />
            <Route path="/wanted" element={<CreateWantedItem />} />
            <Route path="/update-password" element={<UpdatePassword />} />
          </Route>
          <Route path="/user/:username" element={<UserProfile />} />
          <Route element={<Item />} path="/listing/:itemID" />
          <Route element={<WantedItem />} path="/wanted/:wantedItemID" />
          <Route element={<ResetPassword />} path="/reset-password" />
        </Routes>
        {loginModalToggled && <LoginModal />}
        {registerModalToggled && <RegisterModal />}
        {resetPasswordModalToggled && <ResetPasswordModal />}
        {bugModalToggled && <BugModal />}
        {feedbackModalToggled && <FeedbackModal />}
        {searchModalToggled && <SearchModal />}
      </main>
    </>
  );
}
