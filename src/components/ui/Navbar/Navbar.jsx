import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { closeAllModals, toggleModal } from "../../../redux/modals";
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
import React, { useEffect, useState } from "react";
import { Caret } from "../Icons/Caret";
import { PlusIcon } from "../Icons/PlusIcon";
import { SearchIcon } from "../Icons/SearchIcon.tsx";
import { DesktopSearchToggle } from "../DesktopSearchToggle/DesktopSearchToggle";
import "./Navbar.css";
import { HamburgerMenuIcon } from "../Icons/HamburgerMenuIcon";
import { AddNewMenu } from "../AddNewMenu/AddNewMenu";

export const Navbar = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const {
    filtersSidebarToggled,
    rightSideMenuToggled,
    notificationsMenuToggled,
    addNewMenuToggled,
  } = useSelector((state) => state.modals);
  const search = useSelector((state) => state.search);
  const [notifications, setNotifications] = useState(null);

  function handleRightSideMenuToggle(e) {
    e.preventDefault();
    e.stopPropagation();

    // dispatch(toggleModal({ key: "addNewMenu", value: false }));
    // dispatch(toggleModal({ key: "notificationsMenu", value: false }));
    // dispatch(toggleModal({ key: "searchModal", value: false }));
    dispatch(
      toggleModal({ key: "rightSideMenu", value: !rightSideMenuToggled, closeAll: true })
    );
  }

  function handleNotificationsMenuToggle(e) {
    e.preventDefault();
    e.stopPropagation();
    // dispatch(toggleModal({ key: "addNewMenu", value: false }));
    // dispatch(toggleModal({ key: "rightSideMenu", value: false }));
    // dispatch(toggleModal({ key: "searchModal", value: false }));
    dispatch(
      toggleModal({
        key: "notificationsMenu",
        value: !notificationsMenuToggled,
        closeAll: true,
      })
    );
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
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (user) handleNotificationsSubscribe();
  }, [user]);

  const unreadNotificationCount = notifications?.filter((notif) => notif.is_read).length;

  return (
    <nav className="desktop">
      <div className="left-side">
        {location.pathname == "/" && (
          <button
            className={`menu-button ${filtersSidebarToggled ? "toggled" : ""}`}
            onClick={() =>
              dispatch(
                toggleModal({
                  key: "filtersSidebar",
                  value: !filtersSidebarToggled,
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
            dispatch(closeAllModals({ keepSidebarOpen: true }));
          }}
        >
          PBMRKT
        </Link>
        {location.pathname == "/" && isOnMobile() && (
          <button
            className="filters-toggle-button"
            onClick={() =>
              dispatch(
                toggleModal({
                  key: "filtersSidebar",
                  value: !filtersSidebarToggled,
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

        <button
          className={`add-new-menu-toggle ${addNewMenuToggled ? "toggled" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            dispatch(
              toggleModal({
                key: "addNewMenu",
                value: !addNewMenuToggled,
                closeAll: true,
              })
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
                <span className="unread-notification-count">
                  {unreadNotificationCount}
                </span>
              )}
            </button>
          )}
          <button
            onClick={handleRightSideMenuToggle}
            type="button"
            className="right-side-menu-button"
          >
            <img
              className="profile-image"
              src={
                user
                  ? user.profile_image_url
                  : "../../../assets/images/user-placeholder.jpeg"
              }
            />
          </button>
        </>
      </div>

      {addNewMenuToggled && <AddNewMenu />}
      {rightSideMenuToggled && <RightSideMenu />}
      {notificationsMenuToggled && user && (
        <NotificationsMenu
          notifications={notifications}
          setNotifications={setNotifications}
        />
      )}
    </nav>
  );
};
