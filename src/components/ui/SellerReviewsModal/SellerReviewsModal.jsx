import { useEffect, useRef } from "react";
import "./SellerReviewsModal.css";
import { toggleModal } from "../../../redux/modals";
import { useDispatch } from "react-redux";
import Stars from "../Stars/Stars";

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
      <div>
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
            <Stars rating={review.rating}/>
            <p className="title">{review.title}</p>
            <p className="body">{review.body}</p>
            <p className="username-and-date">
              {review.username} at {new Date(review.created_at).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default SellerReviewsModal;
