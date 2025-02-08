import { useEffect, useRef, useState } from "react";
import { toggleModal } from "../../../redux/modals";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getTimeAgo } from "../../../utils/usefulFunctions";
import "./NotificationsMenu.css";

export const NotificationsMenu = ({ notifications, setNotifications }) => {
  const dispatch = useDispatch();
  const notificationsMenuRef = useRef(null);
  const { user } = useSelector((state) => state.auth);
  const [error, setError] = useState(null);

  useEffect(() => {
    function handler(e) {
      if (
        notificationsMenuRef.current &&
        !notificationsMenuRef.current.contains(e.target) &&
        !e.target.classList.contains("notifications-menu-toggle")
      ) {
        dispatch(toggleModal({ key: "notificationsMenu", value: false }));
      }
    }

    window.addEventListener("click", handler);

    return () => {
      window.removeEventListener("click", handler);
    };
  });

  async function handleNotificationRead(notification) {
    try {
      const response = await fetch("http://localhost:4000/read-notification", {
        method: "post",
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          notification_id: notification.id,
        }),
      });

      if (!response.ok) throw new Error("Something happened at read-notification");

      setNotifications(
        notifications.map((notif) => ({
          ...notif,
          ...(notif.id == notification.id && {
            is_read: true,
          }),
        }))
      );
    } catch (error) {
      console.error(error);
      setError(error.toString());
    }
  }

  async function handleMarkAllAsRead() {
    try {
      const response = await fetch("http://localhost:4000/mark-all-notifications-read", {
        method: "post",
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          user_id: user.id,
        }),
      });

      if (!response.ok)
        throw new Error("Something happened at mark-all-notifications-read");

      const data = await response.json();

      setNotifications(data);
    } catch (error) {
      console.error(error);
      setError(error.toString());
    }
  }

  const unreadNotificationCount = notifications?.filter(
    (notif) => notif.status == "Unread"
  ).length;

  return (
    <div className="notifications-menu" ref={notificationsMenuRef}>
      <div className="header">
        <p>Notifications</p>

        <button
          className="mark-all-read"
          onClick={() => handleMarkAllAsRead()}
          disabled={unreadNotificationCount <= 0}
        >
          Mark all as read
        </button>
      </div>
      <ul>
        {notifications && notifications?.length != 0 ? (
          notifications?.map((notif) => {
            const profile_image_url = "";

            let notificationLink = `/`;
            let notificationBody = ``;

            switch (notif.entity_type_id) {
              case 1: {
                // notificationLink = `/listing/${notif.item_id}`;
                notificationLink = `/listing/asdf`;
                notificationBody = `${notif.actor_username} commented on your post`;
                break;
              }
              case 2: {
                notificationLink = `/`;
                notificationBody = `${notif.actor_username} replied to your comment`;
                break;
              }
              case 3: {
                notificationLink = `/`;
                notificationBody = `${notif.actor_username} liked your comment`;
                break;
              }
              case 4: {
                notificationLink = `/`;
                notificationBody = `${notif.actor_username} disliked your comment`;
                break;
              }
              case 5: {
                notificationLink = `${notif.actor_username} sent you an inquiry for your 'Wanted' post`;
                notificationBody = ``;
                break;
              }
              case 6: {
                notificationLink = `/`;
                notificationBody = `${notif.actor_username} sent you an inquiry for your 'For sale' post'`;
                break;
              }
              default: {
                notificationLink = `/`;
                notificationBody = `Unknown notification type`;
              }
            }

            if (notif.entity_type_id == 1)
              return (
                <li key={notif.id}>
                  <Link
                    to={notificationLink}
                    onClick={() => {
                      dispatch(toggleModal({ key: "notificationsMenu", value: false }));
                      if (!notif.is_read) handleNotificationRead(notif);
                    }}
                  >
                    <div className="profile-image-container">
                      <img className="profile-image" src={profile_image_url} />
                    </div>
                    <div className="notification-body">
                      {notificationBody}
                      <p className="time-ago">{getTimeAgo(new Date(notif.created_at))}</p>
                    </div>
                    <div
                      className={`read-circle ${notif.is_read ? "read" : "unread"}`}
                      title={`This notification${
                        notif.status == "Read"
                          ? `was read at ${notif.read_at}`
                          : " has not been read yet"
                      }`}
                    ></div>
                  </Link>
                </li>
              );
          })
        ) : (
          <div className="no-notifications">
            You don't have any notifications right now...
          </div>
        )}
      </ul>
    </div>
  );
};
