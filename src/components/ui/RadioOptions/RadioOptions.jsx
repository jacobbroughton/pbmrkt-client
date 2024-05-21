import RadioIcon from "../Icons/RadioIcon";
import "./RadioOptions.css";

const RadioOptions = ({ options, handleRadioOptionClick }) => {
  return (
    <div className="radio-options" >
      {options.map((option) => (
        <div
          className={`radio-option ${option.checked ? "checked" : ""}`}
          onClick={() => handleRadioOptionClick(option)}
          key={option.id}
        >
          <RadioIcon checked={option.checked} />
          <label>{option.value}</label>
        </div>
      ))}
    </div>
  );
};
export default RadioOptions;
