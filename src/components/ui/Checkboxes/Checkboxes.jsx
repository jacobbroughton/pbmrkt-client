import Checkbox from "../Icons/Checkbox";
import "./Checkboxes.css";

const Checkboxes = ({ options, handleCheckboxOptionClick }) => {
  return (
    <div className="checkbox-options">
      {options.map((option) => (
        <div
          className={`checkbox-option ${option.checked ? "checked" : ""}`}
          onClick={() => handleCheckboxOptionClick(option)}
        >
          <Checkbox checked={option.checked} />
          <label>{option.value}</label>
        </div>
      ))}
    </div>
  );
};
export default Checkboxes;
