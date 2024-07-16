import "./SkeletonsListingList.css";

export const SkeletonsListingList = ({ hasOverlay, message }) => {
  return (
    <div className="listings-list-skeletons">
      {hasOverlay && (
        <>
          <div className="overlay-content">
            <p>{message}</p>
          </div>
          <div className="gradient-overlay"></div>
        </>
      )}
      {[...new Array(10)].map((num, i) => (
        <div className="listing-list-skeleton">&nbsp;</div>
      ))}
    </div>
  );
};
