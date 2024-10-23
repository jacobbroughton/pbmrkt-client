import { XIcon } from "../Icons/XIcon";
import "./FilterTags.css";

export const FilterTags = ({ filterTags }) => {
  return (
    <div className="filter-tags-parent">
      <div className="filter-tags">
        {filterTags
          .filter((filter) => filter.active)
          .map((filter) => {
            return (
              <div className="filter-tag">
                <span className="label">{filter.label}</span>
                <p className="value">{filter.value}</p>
                <button onClick={filter.onDeleteClick}>
                  <XIcon />
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
};
