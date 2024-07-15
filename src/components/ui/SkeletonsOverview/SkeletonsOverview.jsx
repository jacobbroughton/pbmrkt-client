import "./SkeletonsOverview.css";

export const SkeletonsOverview = () => {
  return (
    <div className="overview-skeletons">
      {[...new Array(10)].map((num, i) => (
        <div className="overview-skeleton">&nbsp;</div>
      ))}
    </div>
  );
};
