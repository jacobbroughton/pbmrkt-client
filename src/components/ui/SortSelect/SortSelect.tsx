import { SortIcon } from "../Icons/SortIcon.tsx";
import "./SortSelect.css";
export function SortSelect({
  sort,
  setSort,
}: {
  sort: string;
  setSort: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <div className="control-group sort">
      <SortIcon />
      <select
        className="sort-select"
        id="sort-select"
        onChange={(e) => {
          setSort(e.target.value);
        }}
        value={sort}
      >
        <option value={"Name (A-Z)"}>Name (A-Z)</option>
        <option value={"Name (Z-A)"}>Name (Z-A)</option>
        <option value={"Price (Low-High)"}>Price (Low-High)</option>
        <option value={"Price (High-Low)"}>Price (High-Low)</option>
        <option value={"Date (New-Old)"}>Date (New-Old)</option>
        <option value={"Date (Old-New)"}>Date (Old-New)</option>
      </select>
    </div>
  );
}
