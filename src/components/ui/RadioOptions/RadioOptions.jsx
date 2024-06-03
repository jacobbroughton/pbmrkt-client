import RadioIcon from "../Icons/RadioIcon";
import "./RadioOptions.css";

const RadioOptions = ({ options, handleRadioOptionClick, disabled }) => {
  return (
    <div className={`radio-options ${disabled ? "disabled" : ""}`}>
      {options.map((option) => (
        <div
          className={`radio-option ${option.checked ? "checked" : ""}`}
          onClick={() => {
            if (disabled) return;
            handleRadioOptionClick(option);
          }}
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
