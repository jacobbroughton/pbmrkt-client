import XIcon from "../Icons/XIcon";
import "./FilterTags.css";

const FilterTags = ({ filterTags }) => {
  return (
    <div className="filter-tags-parent">
      <p>Results are currently filtered by:</p>
      <div className="filter-tags">
        {filterTags
          .filter((filter) => filter.active)
          .map((filter) => {
            return (
              <div className="filter-tag">
                {filter.label}
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
export default FilterTags;
