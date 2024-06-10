import { useEffect, useRef } from "react";
import "./SellerReviewsModal.css";
import { toggleModal } from "../../../redux/modals";
import { setFlag } from "../../../redux/flags";
import { useDispatch, useSelector } from "react-redux";
import Stars from "../Stars/Stars";
import XIcon from "../Icons/XIcon";
import { Link } from "react-router-dom";
import { getTimeAgo } from "../../../utils/usefulFunctions";

const SellerReviewsModal = ({ seller, reviews }) => {
  const modalRef = useRef(null);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    function handler(e) {
      console.log(e.target);
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target) &&
        !e.target.classList.contains("reviews-list-toggle-button") &&
        !e.target.classList.contains("stars-button")
      ) {
        dispatch(toggleModal({ key: "sellerReviewsModal", value: false }));
      }
    }

    window.addEventListener("click", handler);

    return () => {
      window.removeEventListener("click", handler);
    };
  });
  console.log(reviews);

  return (
    <div ref={modalRef} className="modal seller-reviews">
      <div className="header">
        <h3>{seller.username}'s Reviews</h3>
        <button
          className="button"
          onClick={() =>
            dispatch(toggleModal({ key: "sellerReviewsModal", value: false }))
          }
        >
          Close <XIcon />
        </button>
      </div>
      {user.auth_id != seller.auth_id ||
        (!reviews.list.find((rev) => {
          console.log(rev, user);
          return rev.created_by_id == user.auth_id;
        }) && (
          <button
            className="add-review-modal-toggle-button"
            onClick={() => dispatch(toggleModal({ key: "addReviewModal", value: true }))}
          >
            Add Review
          </button>
        ))}
      <ul>
        {reviews.list?.map((review) => (
          <li>
            <p className="title">{review.title}</p>
            <p className="body">{review.body}</p>
            <div className="stars-username-and-date">
              <Stars rating={review.rating} /> from
              <Link
                to={`/user/${review.username}`}
                onClick={() => {
                  dispatch(setFlag({ key: "sellerProfileNeedsUpdate", value: true }));
                  dispatch(toggleModal({ key: "sellerReviewsModal", value: false }));
                }}
              >
                {review.username}
              </Link>
              <p title={new Date(review.created_at).toLocaleString()}>
                {getTimeAgo(new Date(review.created_at))}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default SellerReviewsModal;
