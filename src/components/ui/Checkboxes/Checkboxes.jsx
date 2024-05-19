import { useSelector } from "react-redux";
import Checkbox from "../Icons/Checkbox";
import "./Checkboxes.css";

const Checkboxes = ({ options, handleCheckboxOptionClick }) => {
  return (
    <div className="checkbox-options">
      {options.map((conditionOption) => (
        <div
          className={`checkbox-option ${conditionOption.checked ? "checked" : ""}`}
          onClick={() => handleCheckboxOptionClick(conditionOption)}
        >
          <Checkbox checked={conditionOption.checked} />
          <label>{conditionOption.value}</label>
        </div>
      ))}
    </div>
  );
};
export default Checkboxes;
