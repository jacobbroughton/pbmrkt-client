import { Link } from "react-router-dom";
import { Stars } from "../Stars/Stars";
import { toggleModal } from "../../../redux/modals";
import { useDispatch } from "react-redux";
import "./ProfileBadge.css";

export function ProfileBadge({
  userInfo = {
    profile_image_url: "",
    username: "",
    city: "",
    state: "",
    review_count: 0,
    rating: 0,
  },
}) {
  const dispatch = useDispatch();

  return (
    <div className="profile-badge">
      <div className="profile-image-container">
        <img className="profile-image" src={userInfo.profile_image_url} />
      </div>
      <div className="text">
        <Link to={`/user/${userInfo.username}`} className="user-link">
          {userInfo.username}
        </Link>
        <p>
          {userInfo.city}, {userInfo.state}
        </p>
        <button
          className="stars-button"
          onClick={(e) => {
            e.stopPropagation();
            if (userInfo.review_count <= 0) return;
            dispatch(toggleModal({ key: "sellerReviewsModal", value: true }));
          }}
          disabled={userInfo.review_count == 0}
        >
          <Stars rating={userInfo.rating} /> <span>({userInfo.review_count})</span>
        </button>
      </div>
    </div>
  );
}
