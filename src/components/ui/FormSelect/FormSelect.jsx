import { SortIcon } from "../Icons/SortIcon";
import "./FormSelect.css";

export function FormSelect({
  options = [],
  selectedOption = null,
  handleChange = () => null,
  disabled = false,
}) {
  return (
    <div className="form-select">
      <select
        disabled={disabled}
        className="form-sort-select"
        onChange={handleChange}
        value={selectedOption}
      >
        {options.map((option) => (
          <option value={option} key={option}>
            {option}
          </option>
        ))}
      </select>
      <SortIcon />
    </div>
  );
}
