import "./SkeletonsListingList.css";

export const SkeletonsListingList = () => {
  return (
    <div className="listings-list-skeletons">
      {[...new Array(10)].map((num, i) => (
        <div className="listing-list-skeleton">&nbsp;</div>
      ))}
    </div>
  );
};
