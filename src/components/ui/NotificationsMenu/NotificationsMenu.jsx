import { useEffect, useRef, useState } from "react";
import { toggleModal } from "../../../redux/modals";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getTimeAgo } from "../../../utils/usefulFunctions";
import { supabase } from "../../../utils/supabase";
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
      if (notification.status == "Read") return;
      const { data, error } = await supabase.rpc("read_notification", {
        p_notification_id: notification.id,
      });

      if (error) throw error.message;

      if (!data) throw "Something happened when trying to read the notification";

      console.log(data[0]);

      setNotifications(
        notifications.map((notif) => ({
          ...notif,
          ...(notif.id == notification.id && {
            ...data[0],
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
      const { data, error } = await supabase.rpc("mark_all_notifications_read", {
        p_user_id: user.auth_id,
      });

      if (error) throw error.message;

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
        {notifications?.length != 0 ? (
          notifications?.map((notification) => {
            console.log(notification);
            const { data, error } = supabase.storage
              .from("profile_pictures")
              .getPublicUrl(
                notification.profile_picture_path || "placeholders/user-placeholder"
              );

            if (error) throw error.message;

            const profile_picture_url = data.publicUrl;
            return (
              <li key={notification.id}>
                <Link
                  to={`/listing/${notification.item_id}`}
                  onClick={() => {
                    dispatch(toggleModal({ key: "notificationsMenu", value: false }));
                    handleNotificationRead(notification);
                  }}
                >
                  <div className="profile-picture-container">
                    <img className="profile-picture" src={profile_picture_url} />
                  </div>
                  <div className="notification-body">
                    {notification.type == "Comment" ? (
                      <p>{notification.username} commented on your post</p>
                    ) : notification.type == "Reply" ? (
                      <p>{notification.username} replied to your comment</p>
                    ) : notification.type == "Up Vote" ? (
                      <p>{notification.username} liked your comment</p>
                    ) : notification.type == "Down Vote" ? (
                      <p>{notification.username} disliked your comment</p>
                    ) : (
                      false
                    )}
                    <p className="time-ago">
                      {getTimeAgo(new Date(notification.created_at))}
                    </p>
                  </div>
                  <div
                    className={`read-circle ${
                      notification.status == "Read" ? "read" : "unread"
                    }`}
                    title={`This notification${
                      notification.status == "Read"
                        ? `was read at ${notification.read_at}`
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
