import Checkbox from "../Icons/Checkbox";
import "./Checkboxes.css";

const Checkboxes = ({ options, handleCheckboxOptionClick, disabled }) => {
  return (
    <div className={`checkbox-options ${disabled ? "disabled" : ""}`}>
      {options.map((option) => (
        <div
          className={`checkbox-option ${option.checked ? "checked" : ""}`}
          onClick={() => handleCheckboxOptionClick(option)}
          key={option.id}
          title={`${option.checked ? 'Uncheck' : 'Check'} "${option.value}"`}
        >
          <Checkbox checked={option.checked} />
          <label>{option.value}</label>
        </div>
      ))}
    </div>
  );
};
export default Checkboxes;
