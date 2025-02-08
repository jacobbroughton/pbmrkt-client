import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { resetFilters } from "../../../redux/filters";
import { setFlag } from "../../../redux/flags";
import { closeAllModals, toggleModal } from "../../../redux/modals";
import { setSearchBarToggled } from "../../../redux/search";
import { isOnMobile } from "../../../utils/usefulFunctions";
import { BellIcon } from "../Icons/BellIcon";
import { HamburgerMenuIcon } from "../Icons/HamburgerMenuIcon";
import { HomeIcon } from "../Icons/HomeIcon";
import { PlusIcon } from "../Icons/PlusIcon";
import { SearchIcon } from "../Icons/SearchIcon.tsx";
import { NotificationsMenu } from "../NotificationsMenu/NotificationsMenu";
import { RightSideMenu } from "../RightSideMenu/RightSideMenu";
import { UnauthenticatedOptionsMenu } from "../UnauthenticatedOptionsMenu/UnauthenticatedOptionsMenu";
import "./MobileBottomNav.css";
import { AddNewMenu } from "../AddNewMenu/AddNewMenu.jsx";

export function MobileBottomNav() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const {
    rightSideMenuToggled,
    unauthenticatedOptionsMenuToggled,
    notificationsMenuToggled,
    searchModalToggled,
    filtersSidebarToggled,
    addNewMenuToggled,
  } = useSelector((state) => state.modals);
  const search = useSelector((state) => state.search);
  const [notifications, setNotifications] = useState(null);

  function handleRightSideMenuToggle(e) {
    e.preventDefault();
    e.stopPropagation();

    // if (user) {
    dispatch(toggleModal({ key: "notificationsMenu", value: false }));
    dispatch(toggleModal({ key: "rightSideMenu", value: !rightSideMenuToggled }));
    // } else {
    // dispatch(
    //   toggleModal({
    //     key: "unauthenticatedOptionsMenu",
    //     value: !unauthenticatedOptionsMenuToggled,
    //     closeAll: true,
    //   })
    // );
    // }
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

      const urlSearchParams = new URLSearchParams({
        user_id: user?.id,
      }).toString();

      const response = await fetch(
        `http://localhost:4000/get-notifications?${urlSearchParams}`,
        {
          method: "get",
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Something happened get-notifications");

      const { data } = await response.json();

      if (!data || !data.length === 0) throw new Error("No notifications  found");
      let localNotifications = data.map((notif) => {
        return {
          ...notif,
          profile_image_url: "",
        };
      });

      setNotifications(localNotifications);

      //
    } catch (error) {
      console.error(error);
    }
  }

  function handleSearchToggle(e) {
    e.stopPropagation();
    if (filtersSidebarToggled)
      dispatch(toggleModal({ key: "filtersSidebar", value: false }));
    dispatch(closeAllModals());
    dispatch(toggleModal({ key: "searchModal", value: !searchModalToggled }));
    dispatch(setSearchBarToggled(!search.searchBarToggled));
  }

  useEffect(() => {
    if (user) handleNotificationsSubscribe();
  }, [user]);

  // useEffect(() => {
  //   return () => alert("hello")
  // }, [])

  const unreadNotificationCount = notifications?.filter((notif) => notif.is_read).length;

  return (
    <nav className="mobile-nav">
      {location.pathname == "/" ? (
        <button
          className={`sidebar-toggle-button ${filtersSidebarToggled ? "active" : ""}`}
          onClick={() => {
            // if (location.pathname != '/') navigate('/')
            dispatch(closeAllModals());
            dispatch(
              toggleModal({ key: "filtersSidebar", value: !filtersSidebarToggled })
            );
          }}
        >
          <HamburgerMenuIcon />
        </button>
      ) : (
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
      )}

      <button
        className={`search-toggle ${searchModalToggled ? "toggled" : ""}`}
        onClick={handleSearchToggle}
      >
        <SearchIcon />
      </button>

      <button
        className={`add-new-menu-toggle ${addNewMenuToggled ? "toggled" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          dispatch(
            toggleModal({ key: "addNewMenu", value: !addNewMenuToggled, closeAll: true })
          );
        }}
      >
        <PlusIcon />
      </button>

      <>
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
              <span className="unread-notification-count">{unreadNotificationCount}</span>
            )}
          </button>
        )}
        <button
          onClick={handleRightSideMenuToggle}
          className={`right-side-menu-button ${rightSideMenuToggled ? "toggled" : ""}`}
        >
          <div className="profile-image-container">
            <img className="profile-image" src={user?.profile_image_url || ""} />
          </div>
        </button>
      </>

      {addNewMenuToggled && <AddNewMenu />}
      {rightSideMenuToggled && <RightSideMenu />}
      {unauthenticatedOptionsMenuToggled && <UnauthenticatedOptionsMenu />}
      {notificationsMenuToggled && user && (
        <NotificationsMenu
          notifications={notifications}
          setNotifications={setNotifications}
        />
      )}
    </nav>
  );
}
