import { useEffect, useRef } from "react";
import "./NotificationsMenu.css";
import { toggleModal } from "../../../redux/modals";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { getTimeAgo } from "../../../utils/usefulFunctions";

const NotificationsMenu = ({ notifications }) => {
  const dispatch = useDispatch();
  const notificationsMenuRef = useRef(null);

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

  return (
    <div className="notifications-menu" ref={notificationsMenuRef}>
      <div className="header">
        <p>Notifications</p>
      </div>
      <ul>
        {notifications ? (
          notifications?.map((notification) => (
            <li>
              <Link
                to={`/${notification.item_id}`}
                onClick={() => {
                  dispatch(toggleModal({ key: "notificationsMenu", value: false }));
                  // TODO - Update 'read'/'unread' status
                }}
              >
                {notification.type == "Comment" ? (
                  <p>x commented on your post</p>
                ) : notification.type == "Reply" ? (
                  <p>x replied to your comment</p>
                ) : (
                  <p className="time-ago">
                    {getTimeAgo(new Date(notification.created_at))}
                  </p>
                )}
              </Link>
            </li>
          ))
        ) : (
          <div className="no-notifications">
            You don't have any notifications right now...
          </div>
        )}
      </ul>
    </div>
  );
};
export default NotificationsMenu;
