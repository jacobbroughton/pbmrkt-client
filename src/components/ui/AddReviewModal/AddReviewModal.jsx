import { useEffect, useRef, useState } from "react";
import { toggleModal } from "../../../redux/modals";
import { useDispatch, useSelector } from "react-redux";
import Star from "../Icons/Star";
import "./AddReviewModal.css";
import { supabase } from "../../../utils/supabase";

const AddReviewModal = ({ seller, reviews, setReviews }) => {
  const dispatch = useDispatch();
  const modalRef = useRef(null);
  const { user } = useSelector((state) => state.auth.session);
  const [rating, setRating] = useState(0);
  const [error, setError] = useState(null);
  // const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    function handler(e) {
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target) &&
        !e.target.classList.contains("add-review-button")
      ) {
        dispatch(toggleModal({ key: "addReviewModal", value: false }));
      }
    }

    window.addEventListener("click", handler);

    return () => {
      window.removeEventListener("click", handler);
    };
  });

  function handleStarMouseOver(e, rating) {
    const { clientX, target } = e;
    const { left, width } = target.getBoundingClientRect();
    const mouseXRelativeToElement = clientX - left;
    const isOnLeft = mouseXRelativeToElement <= width / 2;
    setRating(rating - 1 + (isOnLeft ? 0.5 : 1));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const { data, error } = await supabase.rpc("add_review", {
        p_reviewer_id: user.id,
        p_reviewee_id: seller.auth_id,
        p_rating: rating,
        p_title: title,
        p_body: body,
      });

      if (error) {
        console.log(error);
        throw error.message;
      }

      dispatch(toggleModal({ key: "addReviewModal", value: false }));

      setReviews({
        count: reviews.count + 1,
        list: [...data, ...reviews.list],
      });

      console.log(data);
    } catch (error) {
      setError(error.toString());
    }
  }

  return (
    <div className="add-review modal" ref={modalRef}>
      {error && <p className="error-text">{error}</p>}
      <h2>Give {seller.username} a review</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Rating</label>
          <div className="stars">
            {[1, 2, 3, 4, 5].map((starNum) => (
              <Star
                onHover={(e) => handleStarMouseOver(e, starNum)}
                fillType={
                  starNum - 0.5 > rating ? null : starNum <= rating ? "full" : "half"
                }
              />
            ))}
          </div>
          <input type="range" min="0" max="5" step="0.5" onChange={(e) => setRating(parseFloat(e.target.value))}/>
        </div>
        <div className="form-group">
          <label>Title</label>
          <input onChange={(e) => setTitle(e.target.value)} placeholder="..." />
        </div>
        <div className="form-group">
          <label>Body</label>
          <textarea onChange={(e) => setBody(e.target.value)} placeholder="....." />
        </div>
        <button className="button" type="submit" disabled={rating == 0 || title == '' || body == ''}>
          Submit
        </button>
      </form>
    </div>
  );
};
export default AddReviewModal;
