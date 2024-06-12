import { Link } from "react-router-dom";
import ItemSkeleton from "../Skeletons/ItemSkeleton/ItemSkeleton";
import "./SkeletonsListingGrid.css";
import LoadingOverlay from "../LoadingOverlay/LoadingOverlay";

const SkeletonsListingGrid = ({
  message,
  link,
  accountsForSidebar,
  hasOverlay,
  blinking,
  numSkeletons,
  heightPx,
  loading
}) => {
  return (
    <div
      className={`skeletons-grid ${accountsForSidebar ? "accounts-for-sidebar" : ""}`}
      style={{ ...(heightPx && { height: `${heightPx}px` }) }}
    >
      {hasOverlay && (
        <>
          <div className="overlay-content">
            <p>{message}</p>
            {link && <Link to={link.url}>{link.label}</Link>}
          </div>
          <div className="gradient-overlay"></div>
        </>
      )}

      {[...new Array(numSkeletons)].map((num, i) => (
        <ItemSkeleton key={i} blinking={blinking} />
      ))}
      {loading && <LoadingOverlay zIndex={3}/>}
    </div>
  );
};
export default SkeletonsListingGrid;
