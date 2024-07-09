import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleModal } from "../../../redux/modals";
import { resetFilters } from "../../../redux/filters";
import { RightSideMenu } from "../RightSideMenu/RightSideMenu";
import { HomeIcon } from "../Icons/HomeIcon";
import { FilterIcon } from "../Icons/FilterIcon";
import { setSearchBarToggled } from "../../../redux/search";
import { setFlag } from "../../../redux/flags";
import { useWindowSize } from "../../../utils/useWindowSize";
import { isOnMobile } from "../../../utils/usefulFunctions";
import { NotificationsMenu } from "../NotificationsMenu/NotificationsMenu";
import { BellIcon } from "../Icons/BellIcon";
import { supabase } from "../../../utils/supabase";
import React, { useEffect, useState } from "react";
import { Caret } from "../Icons/Caret";
import { SearchModal } from "../SearchModal/SearchModal";
import { PlusIcon } from "../Icons/PlusIcon";
import { SearchIcon } from "../Icons/SearchIcon";
import { DesktopSearchToggle } from "../DesktopSearchToggle/DesktopSearchToggle";
import "./Navbar.css";
import HamburgerMenuIcon from "../Icons/HamburgerMenuIcon";

export const Navbar = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const {
    searchModalToggled,
    filtersSidebarToggled,

    rightSideMenuToggled,
    notificationsMenuToggled,
  } = useSelector((state) => state.modals);
  const search = useSelector((state) => state.search);
  const [notifications, setNotifications] = useState(null);
  const [testState, setTestState] = useState("on");

  const windowSize = useWindowSize();
  const navigate = useNavigate();

  function handleRightSideMenuToggle(e) {
    e.preventDefault();
    e.stopPropagation();

    dispatch(toggleModal({ key: "notificationsMenu", value: false }));
    dispatch(toggleModal({ key: "rightSideMenu", value: !rightSideMenuToggled }));
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
            console.log(
              `There was an error subscribing to channel: ${err?.message || "default"}`
            );
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

    function handleKeyDownEvent(e) {
      if (e.code == "Slash" && !searchModalToggled)
        dispatch(toggleModal({ key: "searchModal", value: true }));
    }

    document.addEventListener("keydown", handleKeyDownEvent);

    return () => document.removeEventListener("keydown", handleKeyDownEvent);
  }, [user]);

  const unreadNotificationCount = notifications?.filter(
    (notif) => notif.status == "Unread"
  ).length;

  return (
    <nav className="desktop">
      {/* {isOnMobile() && <h1>You're on mobile!</h1>} */}
      <div className="left-side">
        {location.pathname == "/" && (
          <button
            className={`menu-button ${filtersSidebarToggled ? "toggled" : ""}`}
            onClick={() =>
              dispatch(
                toggleModal({
                  key: "filtersSidebar",
                  value: windowSize.width > 625 ? !filtersSidebarToggled : true,
                })
              )
            }
            type="button"
          >
            <HamburgerMenuIcon />
          </button>
        )}
        <Link
          to="/"
          className="home-link"
          onClick={() => {
            dispatch(resetFilters());
            dispatch(setFlag({ key: "searchedListingsNeedUpdate", value: true }));
          }}
        >
          PBMRKT
        </Link>
        {location.pathname == "/" && (
          <button
            className="filters-toggle-button"
            onClick={() =>
              dispatch(
                toggleModal({
                  key: "filtersSidebar",
                  value: windowSize.width > 625 ? !filtersSidebarToggled : true,
                })
              )
            }
          >
            {!filtersSidebarToggled ? (
              <Caret direction={"right"} />
            ) : (
              <Caret direction={"left"} />
            )}{" "}
            <FilterIcon />
          </button>
        )}
        {/* <SearchBar handleSearchSubmit={handleSearchSubmit} /> */}
      </div>

      <div className="right-side">
        {isOnMobile() ? (
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
        ) : (
          <DesktopSearchToggle />
        )}
        {/* <Link to="/sell" className="sell-link">
          <PlusIcon />
        </Link> */}
        <button
          className="sell-link"
          onClick={() => {
            if (!user) {
              dispatch(toggleModal({ key: "loginModal", value: true }));
              return;
            }

            if (location.pathname == "/sell") return;

            navigate("/sell");
          }}
        >
          <PlusIcon />
        </button>

        {/* Before experimenting below */}
        {/* {user ? ( */}
        <>
          {/* {((isOnMobile() && search.searchBarToggled) || true) && ( */}
          {user && (
            <button
              type="button"
              className={`notifications-menu-toggle ${
                notificationsMenuToggled ? "toggled" : ""
              }`}
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
          {/* )} */}
          <button
            onClick={handleRightSideMenuToggle}
            type="button"
            className="right-side-menu-button"
          >
            <img
              className="profile-picture"
              src={
                user
                  ? user.profile_picture_url
                  : "https://mrczauafzaqkmjtqioan.supabase.co/storage/v1/object/public/profile_pictures/placeholders/user-placeholder"
              }
            />
          </button>
        </>
        {/* ) : ( */}
        {/* // <Link to="/login" className="login-link">
          //   Login
          // </Link>
          // <button */}
        {/* //   className="login-link"
          //   onClick={() => dispatch(toggleModal({ key: "loginModal", value: true }))}
          // >
          //   Login
          // </button> */}
        {/* false */}
        {/* )} */}

        {/* Before experimenting above */}

        {/* <button></button> */}
      </div>

      {rightSideMenuToggled && <RightSideMenu />}
      {notificationsMenuToggled && user && (
        <NotificationsMenu
          notifications={notifications}
          setNotifications={setNotifications}
        />
      )}
      {searchModalToggled && <SearchModal />}
    </nav>
  );
};
