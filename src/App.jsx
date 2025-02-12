import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, Route, Routes, useNavigate } from "react-router-dom";
import { CreateWantedItem } from "./components/pages/CreateWantedItem/CreateWantedItem.jsx";
import { Listings } from "./components/pages/Home/Home.jsx";
import { Item } from "./components/pages/Item/Item.jsx";
import { Login } from "./components/pages/Login/Login.jsx";
import { Register } from "./components/pages/Register/Register.jsx";
import { ResetPassword } from "./components/pages/ResetPassword/ResetPassword.jsx";
import { Sell } from "./components/pages/Sell/Sell.jsx";
import { UpdatePassword } from "./components/pages/UpdatePassword/UpdatePassword.jsx";
import { UserProfile } from "./components/pages/UserProfile/UserProfile.jsx";
import { WantedItem } from "./components/pages/WantedItem/WantedItem.jsx";
import BugModal from "./components/ui/BugModal/BugModal.jsx";
import { ErrorBanner } from "./components/ui/ErrorBanner/ErrorBanner.tsx";
import FeedbackModal from "./components/ui/FeedbackModal/FeedbackModal.jsx";
import { LoadingOverlay } from "./components/ui/LoadingOverlay/LoadingOverlay.jsx";
import { LoginModal } from "./components/ui/LoginModal/LoginModal.jsx";
import { MobileBottomNav } from "./components/ui/MobileBottomNav/MobileBottomNav.jsx";
import { Navbar } from "./components/ui/Navbar/Navbar.jsx";
import { RegisterModal } from "./components/ui/RegisterModal/RegisterModal.jsx";
import { ResetPasswordModal } from "./components/ui/ResetPasswordModal/ResetPasswordModal.jsx";
import { SearchModal } from "./components/ui/SearchModal/SearchModal.jsx";
import { setSession, setUser } from "./redux/auth.ts";
import { isOnMobile } from "./utils/usefulFunctions.js";
import { PrivateRoutes } from "./components/wrappers/PrivateRoutes.tsx";
import VerifyEmailRedirect from "./components/pages/VerifyEmailRedirect/VerifyEmailRedirect.tsx";
import { EditForSaleListing } from "./components/pages/EditForSaleListing/EditForSaleListing.jsx";
import { EditProfile } from "./components/pages/EditProfile/EditProfile.jsx";

export function App() {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);

  const resetPasswordModalToggled = useSelector(
    (state) => state.modals.resetPasswordModalToggled
  );
  const registerModalToggled = useSelector((state) => state.modals.registerModalToggled);
  const loginModalToggled = useSelector((state) => state.modals.loginModalToggled);
  const feedbackModalToggled = useSelector((state) => state.modals.feedbackModalToggled);
  const bugModalToggled = useSelector((state) => state.modals.bugModalToggled);
  const searchModalToggled = useSelector((state) => state.modals.searchModalToggled);

  const navigate = useNavigate();
  const [initialUserLoading, setInitialUserLoading] = useState(true);
  const [error, setError] = useState(null);

  async function getUser() {
    try {
      // todo - get username from session

      const response = await fetch("http://localhost:4000/auth", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(response.statusText || "There was a problem at index auth route");
      }

      const data = await response.json();

      dispatch(setUser(data.user));

      if (!data[0]) {
        setInitialUserLoading(false);
        return;
      }

      setInitialUserLoading(false);
    } catch (error) {
      console.error(error);
      setError(error.toString());
      setInitialUserLoading(false);
    }
  }

  useEffect(() => {
    // if (!user && !initialUserLoading) {
    //   alert("");
    //   navigate("/login");}
    getUser();
    // setInitialUserLoading(false);
  }, []);

  if (initialUserLoading)
    return (
      <LoadingOverlay message={"Loading..."} verticalAlignment={"center"} zIndex={3} />
    );

  return (
    <>
      {isOnMobile() ? <MobileBottomNav /> : <Navbar />}
      {error && (
        <ErrorBanner
          error={error.toString()}
          handleCloseBanner={() => setError(null)}
          hasMargin={true}
        />
      )}
      <Routes>
        <Route path="*" element={<p>Page not found</p>} />
        <Route element={<Listings />} path="/" />
        <Route element={<Register />} path="/register" />
        <Route element={<VerifyEmailRedirect />} path="/verify-email-redirect" />
        <Route element={<Login />} path="/login" />
        <Route
          element={<PrivateRoutes user={user} initialUserLoading={initialUserLoading} />}
        >
          <Route path="/sell" element={<Sell />} />
          <Route path="/wanted" element={<CreateWantedItem />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          <Route path="/edit-listing/forsale/:itemID" element={<EditForSaleListing />} />
          {/* <Route path="/edit-listing/wanted/:itemID" element={<EditWantedListing />}} /> */}
        </Route>
        <Route path="/user/:username" element={<UserProfile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
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
      {/* </main> */}
    </>
  );
}
