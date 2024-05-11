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
import Profile from "./components/pages/Profile/Profile.jsx";

function App() {
  const dispatch = useDispatch();

  const { session } = useSelector((state) => state.auth);
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    setSessionLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log(session);
      dispatch(setSession(session));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (sessionLoading) setSessionLoading(false);
      console.log(session);
      dispatch(setSession(session));
    });

    return () => subscription.unsubscribe();
  }, []);

  if (sessionLoading) return <main>Loading...</main>;

  const PrivateRoutes = () => {
    const userAuthenticated = session && !sessionLoading;
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
            <Route path="/user/:userID" element={<Profile />} />
          </Route>
          <Route element={<Item />} path="/:itemID" />
        </Routes>
      </main>
    </>
  );
}

export default App;
