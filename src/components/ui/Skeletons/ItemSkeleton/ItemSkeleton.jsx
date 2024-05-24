import "./ItemSkeleton.css";

const ItemSkeleton = () => {
  return (
    <div className="item-skeleton-container">
      <div className="image-skeleton skeleton">&nbsp;</div>
      <div className="words-skeleton short skeleton">&nbsp;</div>
      <div className="words-skeleton skeleton">&nbsp;</div>
      <div className="profile-picture-and-name-skeletons">
        <div className="profile-picture skeleton"></div>
        <div className="words-skeleton skeleton"></div>
      </div>
    </div>
  );
};
export default ItemSkeleton;
