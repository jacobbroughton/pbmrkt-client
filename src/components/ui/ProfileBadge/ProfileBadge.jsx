import { Link } from "react-router-dom";
import { Stars } from "../Stars/Stars";
import { toggleModal } from "../../../redux/modals";
import { useDispatch } from "react-redux";
import "./ProfileBadge.css";

export function ProfileBadge({
  userInfo = {
    profileImageUrl: "",
    username: "",
    city: "",
    state: "",
    reviewCount: 0,
    rating: 0,
  },
}) {
  const dispatch = useDispatch();

  return (
    <div className="profile-badge">
      <div className="profile-image-container">
        <img className="profile-image" src={userInfo.profileImageUrl} />
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
            if (userInfo.reviewCount <= 0) return;
            dispatch(toggleModal({ key: "sellerReviewsModal", value: true }));
          }}
          disabled={userInfo.reviewCount == 0}
        >
          <Stars rating={userInfo.rating} /> <span>({userInfo.reviewCount})</span>
        </button>
      </div>
    </div>
  );
}
