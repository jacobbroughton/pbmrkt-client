import { determineStarFillArray } from "../../../utils/usefulFunctions";
import Star from "../Icons/Star.jsx";
import "./Stars.css"

const Stars = ({rating}) => {

  let stars = determineStarFillArray(rating)

  return (
    <div className="stars">
      {stars.map((fillDesc) => {
        return <Star fillType={fillDesc} />;
      })}
    </div>
  );
};
export default Stars;
