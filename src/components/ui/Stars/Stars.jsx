import { determineStarFillArray } from "../../../utils/usefulFunctions";
import Star from "../Icons/Star.jsx";
import "./Stars.css"

const Stars = ({rating}) => {

  let stars = determineStarFillArray(rating)

  return (
    <div className="stars">
      {stars.map((fillDesc, i) => {
        return <Star fillType={fillDesc} key={i} />;
      })}
    </div>
  );
};
export default Stars;
