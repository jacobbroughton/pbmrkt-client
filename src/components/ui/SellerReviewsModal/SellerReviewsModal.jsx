import { useEffect, useRef } from "react";
import "./SellerReviewsModal.css";
import { toggleModal } from "../../../redux/modals";
import { setFlag } from "../../../redux/flags";
import { useDispatch } from "react-redux";
import Stars from "../Stars/Stars";
import { Link } from "react-router-dom";

const SellerReviewsModal = ({ seller, reviews }) => {
  const modalRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    function handler(e) {
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target) &&
        !e.target.classList.contains("reviews-list-toggle-button")
      ) {
        dispatch(toggleModal({ key: "sellerReviewsModal", value: false }));
      }
    }

    window.addEventListener("click", handler);

    return () => {
      window.removeEventListener("click", handler);
    };
  });

  return (
    <div ref={modalRef} className="modal seller-reviews">
      <div className="header">
        <h2>{seller.username}'s Reviews</h2>
        <button
          onClick={() =>
            dispatch(toggleModal({ key: "sellerReviewsModal", value: false }))
          }
        >
          Close
        </button>
      </div>
      <ul>
        {reviews.list?.map((review) => (
          <li>
            <Stars rating={review.rating} />
            <p className="title">{review.title}</p>
            <p className="body">{review.body}</p>
            <p className="username-and-date">
              <Link
                to={`/user/${review.username}`}
                onClick={() => {
                  dispatch(setFlag({ key: "sellerProfileNeedsUpdate", value: true }));
                  dispatch(toggleModal({ key: "sellerReviewsModal", value: false }))
                }}
              >
                {review.username}
              </Link>{" "}
              at {new Date(review.created_at).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default SellerReviewsModal;
