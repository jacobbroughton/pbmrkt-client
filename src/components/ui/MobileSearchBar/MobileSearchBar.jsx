import { useDispatch } from "react-redux";
import { toggleModal } from "../../../redux/modals.ts";
import { SearchIcon } from "../Icons/SearchIcon.tsx";
import "./MobileSearchBar.css";

export function MobileSearchBar() {
  const dispatch = useDispatch();

  return (
    <button
      className="search-button"
      onClick={() => dispatch(toggleModal({ key: "searchModal", value: true }))}
    >
      <SearchIcon />
    </button>
  );
}
