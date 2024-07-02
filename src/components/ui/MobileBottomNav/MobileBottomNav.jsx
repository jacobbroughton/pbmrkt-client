import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleModal } from "../../../redux/modals";
import { resetFilters } from "../../../redux/filters";
import { RightSideMenu } from "../RightSideMenu/RightSideMenu";
import { HomeIcon } from "../Icons/HomeIcon";
import { setSearchBarToggled } from "../../../redux/search";
import { setFlag } from "../../../redux/flags";
import { isOnMobile } from "../../../utils/usefulFunctions";
import { NotificationsMenu } from "../NotificationsMenu/NotificationsMenu";
import { BellIcon } from "../Icons/BellIcon";
import { supabase } from "../../../utils/supabase";
import { useEffect, useState } from "react";
import { SearchModal } from "../SearchModal/SearchModal";
import { PlusIcon } from "../Icons/PlusIcon";
import { SearchIcon } from "../Icons/SearchIcon";
import { UnauthenticatedOptionsMenu } from "../UnauthenticatedOptionsMenu/UnauthenticatedOptionsMenu";
import "./MobileBottomNav.css";

export function MobileBottomNav() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const {
    rightSideMenuToggled,
    unauthenticatedOptionsMenuToggled,
    notificationsMenuToggled,
    searchModalToggled,
  } = useSelector((state) => state.modals);
  const search = useSelector((state) => state.search);
  const [notifications, setNotifications] = useState(null);

  function handleRightSideMenuToggle(e) {
    e.preventDefault();
    e.stopPropagation();

    if (user) {
      dispatch(toggleModal({ key: "notificationsMenu", value: false }));
      dispatch(toggleModal({ key: "rightSideMenu", value: !rightSideMenuToggled }));
    } else {
      dispatch(
        toggleModal({
          key: "unauthenticatedOptionsMenu",
          value: !unauthenticatedOptionsMenuToggled,
          closeAll: true,
        })
      );
    }
  }

  function handleNotificationsMenuToggle(e) {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleModal({ key: "rightSideMenu", value: false }));

    dispatch(toggleModal({ key: "notificationsMenu", value: !notificationsMenuToggled }));
  }

  async function handleNotificationsSubscribe() {
    try {
      if (!user) return;

      const { data, error } = await supabase.rpc("get_comment_notifications", {
        p_user_id: user.auth_id,
      });

      if (error) throw error.message;

      let localNotifications = data.map((notif) => {
        console.log(notif.profile_picture_path);
        const { data: data2, error: error2 } = supabase.storage
          .from("profile_pictures")
          .getPublicUrl(notif.profile_picture_path || "placeholders/user-placeholder");

        if (error2) throw error.message;

        return {
          ...notif,
          profile_picture_url: data2.publicUrl,
        };
      });

      setNotifications(localNotifications);

      supabase
        .channel("comment_notifications")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "comment_notifications",
            filter: `related_user_id=eq.${user.auth_id}`,
          },
          (payload) => {
            console.log("Change received!", payload);
            if (payload.new.related_user_id != user.auth_id) {
              localNotifications.unshift(payload.new);
              setNotifications(localNotifications);
            }
          }
        )
        .subscribe((status, err) => {
          if (status === "SUBSCRIBED") {
            console.log("Connected!");
          }

          if (status === "CHANNEL_ERROR") {
            console.log(`There was an error subscribing to channel: ${err.message}`);
          }

          if (status === "TIMED_OUT") {
            console.log("Realtime server did not respond in time.");
          }

          if (status === "CLOSED") {
            console.log("Realtime channel was unexpectedly closed.");
          }
        });
    } catch (error) {
      console.error(error);
    }
  }

  function handleSearchToggle(e) {
    console.log("swag");
    e.stopPropagation();
    dispatch(toggleModal({ key: "searchModal", value: true, closeAll: true }));
    dispatch(setSearchBarToggled(!search.searchBarToggled));
  }

  useEffect(() => {
    if (user) handleNotificationsSubscribe();
  }, [user]);

  // useEffect(() => {
  //   return () => alert("hello")
  // }, [])

  const unreadNotificationCount = notifications?.filter(
    (notif) => notif.status == "Unread"
  ).length;

  return (
    <nav className="mobile-nav">
      {/* {isOnMobile() && <h1>You're on mobile!</h1>} */}
      <Link
        to="/"
        className="home-link"
        onClick={() => {
          dispatch(resetFilters());
          dispatch(setFlag({ key: "searchedListingsNeedUpdate", value: true }));
        }}
      >
        <HomeIcon />
      </Link>

      <button className="search-toggle" onClick={handleSearchToggle}>
        <SearchIcon />
      </button>

      <Link to="/sell" className="sell-link">
        {isOnMobile() ? <PlusIcon /> : "Sell"}
      </Link>

      {/* {session?.user ? ( */}
      <>
        {user && (
          <button
            type="button"
            className="notifications-menu-toggle"
            onClick={handleNotificationsMenuToggle}
          >
            <BellIcon />
            {unreadNotificationCount > 0 && (
              <span className="unread-notification-count">{unreadNotificationCount}</span>
            )}
          </button>
        )}
        <button onClick={handleRightSideMenuToggle} className="right-side-menu-button">
          <div className="profile-picture-container">
            <img
              className="profile-picture"
              src={
                user?.profile_picture_url ??
                "https://mrczauafzaqkmjtqioan.supabase.co/storage/v1/object/public/profile_pictures/placeholders/user-placeholder?t=2024-06-20T15%3A58%3A46.381Z"
              }
            />
          </div>
        </button>
      </>
      {/* ) : (
        <Link to="/login" className="login-link">
          Login
        </Link>
      )} */}

      {rightSideMenuToggled && user && <RightSideMenu />}
      {unauthenticatedOptionsMenuToggled && <UnauthenticatedOptionsMenu />}
      {notificationsMenuToggled && user && (
        <NotificationsMenu
          notifications={notifications}
          setNotifications={setNotifications}
        />
      )}
      {searchModalToggled && <SearchModal />}
    </nav>
  );
}
