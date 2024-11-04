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
      const { error } = await supabase.rpc("read_notification", {
        p_notification_id: notification.id,
      });

      if (error) throw error.message;

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
        {console.log({ notifications })}
        {notifications && notifications?.length != 0 ? (
          notifications?.map((notif) => {
            const { data, error } = supabase.storage
              .from("profile_pictures")
              .getPublicUrl(
                notif.actor_profile_picture_path || "placeholders/user-placeholder"
              );

            if (error) throw error.message;

            const profile_picture_url = data.publicUrl;
            return (
              <li key={notif.id}>
                <Link
                  to={`/listing/${notif.item_id}`}
                  onClick={() => {
                    dispatch(toggleModal({ key: "notificationsMenu", value: false }));
                    if (!notif.is_read) handleNotificationRead(notif);
                  }}
                >
                  <div className="profile-picture-container">
                    <img className="profile-picture" src={profile_picture_url} />
                  </div>
                  <div className="notification-body">
                    {notif.entity_type_id == 1 ? (
                      <p>{notif.actor_username} commented on your post</p>
                    ) : notif.entity_type_id == 2 ? (
                      <p>{notif.actor_username} replied to your comment</p>
                    ) : notif.entity_type_id == 3 ? (
                      <p>{notif.actor_username} liked your comment</p>
                    ) : notif.entity_type_id == 4 ? (
                      <p>{notif.actor_username} disliked your comment</p>
                    ) : notif.entity_type_id == 5 ? (
                      <p>
                        {notif.actor_username} sent you an inquiry for your 'Wanted' post
                      </p>
                    ) : notif.entity_type_id == 6 ? (
                      <p>
                        {notif.actor_username} sent you an inquiry for your 'For sale'
                        post'
                      </p>
                    ) : (
                      false
                    )}

                    <p className="time-ago">{getTimeAgo(new Date(notif.created_at))}</p>
                  </div>
                  <div
                    className={`read-circle ${
                      notif.is_read ? "read" : "unread"
                    }`}
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
