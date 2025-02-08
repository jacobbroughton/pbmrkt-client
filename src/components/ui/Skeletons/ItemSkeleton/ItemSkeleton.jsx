import "./ItemSkeleton.css";

export const ItemSkeleton = ({ blinking }) => {
  return (
    <div className="item-skeleton-container">
      <div className={`image-skeleton skeleton ${blinking ? "blinking" : ""}`}>
        &nbsp;
      </div>
      <div className={`words-skeleton short skeleton  ${blinking ? "blinking" : ""}`}>
        &nbsp;
      </div>
      <div className={`words-skeleton skeleton  ${blinking ? "blinking" : ""}`}>
        &nbsp;
      </div>
      <div className={`profile-image-and-name-skeletons`}>
        <div className={`words-skeleton skeleton  ${blinking ? "blinking" : ""}`}></div>
      </div>
    </div>
  );
};
