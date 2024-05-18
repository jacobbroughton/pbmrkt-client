import "./ItemSkeleton.css";

const ItemSkeleton = () => {
  return (
    <div className="item-skeleton-container">
      <div className="image-skeleton skeleton">&nbsp;</div>
      <div className="words-skeleton skeleton">&nbsp;</div>
      <div className="words-skeleton short  skeleton">&nbsp;</div>
    </div>
  );
};
export default ItemSkeleton;
