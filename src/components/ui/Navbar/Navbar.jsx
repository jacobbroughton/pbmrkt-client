import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleModal } from "../../../redux/modals";
import { resetFilters } from "../../../redux/filters";
import RightSideMenu from "../RightSideMenu/RightSideMenu";
import HomeIcon from "../Icons/HomeIcon";
import FilterIcon from "../Icons/FilterIcon";
import { setSearchBarToggled } from "../../../redux/search";
import { setFlag } from "../../../redux/flags";
import useWindowSize from "../../../utils/useWindowSize";
import { isOnMobile } from "../../../utils/usefulFunctions";
import NotificationsMenu from "../NotificationsMenu/NotificationsMenu";
import BellIcon from "../Icons/BellIcon";
import { supabase } from "../../../utils/supabase";
import { useEffect, useState } from "react";
import Caret from "../Icons/Caret";
import SearchModal from "../SearchModal/SearchModal";
import PlusIcon from "../Icons/PlusIcon";
import SearchIcon from "../Icons/SearchIcon";
import "./Navbar.css";

function Navbar() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { session, user } = useSelector((state) => state.auth);
  const modals = useSelector((state) => state.modals);
  const search = useSelector((state) => state.search);
  const [notifications, setNotifications] = useState(null);

  const windowSize = useWindowSize();

  function handleRightSideMenuToggle(e) {
    e.preventDefault();
    e.stopPropagation();

    dispatch(toggleModal({ key: "notificationsMenu", value: false }));
    dispatch(toggleModal({ key: "rightSideMenu", value: !modals.rightSideMenuToggled }));
  }

  function handleNotificationsMenuToggle(e) {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleModal({ key: "rightSideMenu", value: false }));

    dispatch(
      toggleModal({ key: "notificationsMenu", value: !modals.notificationsMenuToggled })
    );
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

  useEffect(() => {
    if (user) handleNotificationsSubscribe();
  }, [user]);

  const unreadNotificationCount = notifications?.filter(
    (notif) => notif.status == "Unread"
  ).length;

  return (
    <nav className='desktop'>
      {/* {isOnMobile() && <h1>You're on mobile!</h1>} */}
      <div className="home-link-and-filter-button">
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
        {location.pathname == "/" && (
          <button
            className="filters-toggle-button"
            onClick={() =>
              dispatch(
                toggleModal({
                  key: "filtersSidebar",
                  value: windowSize.width > 625 ? !modals.filtersSidebarToggled : true,
                })
              )
            }
          >
            {!modals.filtersSidebarToggled ? (
              <Caret direction={"right"} />
            ) : (
              <Caret direction={"left"} />
            )}{" "}
            <FilterIcon />
          </button>
        )}
        {/* <SearchBar handleSearchSubmit={handleSearchSubmit} /> */}
        <button
          className="search-toggle"
          onClick={(e) => {
            e.stopPropagation();
            dispatch(toggleModal({ key: "searchModal", value: true }));
            dispatch(setSearchBarToggled(!search.searchBarToggled));
          }}
        >
          <SearchIcon />
        </button>
      </div>

      <div className="right-side">
        <Link to="/sell" className="sell-link">
          <PlusIcon /> 
        </Link>

        {session?.user ? (
          <>
            {((isOnMobile() && search.searchBarToggled) || true) && (
              <button
                type="button"
                className="notifications-menu-toggle"
                onClick={handleNotificationsMenuToggle}
              >
                <BellIcon />
                {unreadNotificationCount > 0 && (
                  <span className="unread-notification-count">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={handleRightSideMenuToggle}
              className="right-side-menu-button"
            >
              <img className="profile-picture" src={user.profile_picture_url} />
            </button>
          </>
        ) : (
          <Link to="/login" className="login-link">
            Login
          </Link>
        )}
      </div>
      {modals.rightSideMenuToggled && session && <RightSideMenu />}
      {modals.notificationsMenuToggled && session && (
        <NotificationsMenu
          notifications={notifications}
          setNotifications={setNotifications}
        />
      )}
      {modals.searchModalToggled && <SearchModal />}
    </nav>
  );
}

export default Navbar;
