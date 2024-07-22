import { JumpToIcon } from "../Icons/JumpToIcon";
import "./FieldErrorButtons.css"

export const FieldErrorButtons = ({ fieldErrors, setMarkedFieldKey}) => {
  return (
    <div className="field-error-buttons">
      <div className="header">
        <p className="small-text bold">Complete these to submit</p>
        <p className="small-text">(Click one to mark and jump to it)</p>
      </div>
      {fieldErrors
        .filter((fieldError) => fieldError.active)
        .map((fieldError) => (
          <button
            type="button"
            onClick={(e) => {
              fieldError.onClick(e);
              console.log(fieldError)
              setMarkedFieldKey(fieldError.fieldKey);
            }}
          >
            <JumpToIcon />
            {fieldError.warningText}
          </button>
        ))}
    </div>
  );
};
