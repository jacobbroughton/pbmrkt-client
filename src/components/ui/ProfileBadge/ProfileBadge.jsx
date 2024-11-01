import { Link } from "react-router-dom";
import { Stars } from "../Stars/Stars";
import { toggleModal } from "../../../redux/modals";
import { useDispatch } from "react-redux";
import "./ProfileBadge.css"

export function ProfileBadge({
  userInfo = {
    profilePictureUrl: "",
    username: "",
    city: "",
    state: "",
    sellerReviewCount: 0,
    sellerRating: 0,
  },
}) {
  const dispatch = useDispatch();
  return (
    <div className="profile-badge">
      <div className="profile-picture-container">
        <img className="profile-picture" src={userInfo.profilePictureUrl} />
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
            if (userInfo.sellerReviewCount.count <= 0) return;
            dispatch(toggleModal({ key: "sellerReviewsModal", value: true }));
          }}
          disabled={userInfo.sellerReviewCount.count == 0}
        >
          <Stars rating={userInfo.sellerRating} />{" "}
          <span>({userInfo.sellerReviewCount})</span>
        </button>
      </div>
    </div>
  );
}
