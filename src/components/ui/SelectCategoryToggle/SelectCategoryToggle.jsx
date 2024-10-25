import { SortIcon } from "../Icons/SortIcon";
import "./SelectCategoryToggle.css";

export const SelectCategoryToggle = ({
  label,
  handleOnClick,
  noCategorySelected,
  title,
  emptyLabel
}) => {
  return (
    <button
      onClick={handleOnClick}
      className={`${noCategorySelected ? "empty" : ""} select-category-modal-toggle`}
      type="button"
      title={title}
    >
      {label ?? emptyLabel} <SortIcon />{" "}
    </button>
  );
};
