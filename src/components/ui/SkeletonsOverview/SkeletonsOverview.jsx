import "./SkeletonsOverview.css";

export const SkeletonsOverview = ({ hasOverlay, message }) => {
  return (
    <div className="overview-skeletons">
      {hasOverlay && (
        <>
          <div className="overlay-content">
            <p>{message}</p>
          </div>
          <div className="gradient-overlay"></div>
        </>
      )}
      <div className="view-all-skeleton">&nbsp;</div>
      <div className="grid">
        {[...new Array(10)].map((num, i) => (
          <div className="overview-skeleton" key={i}>&nbsp;</div>
        ))}
      </div>
    </div>
  );
};
