import { useDispatch } from "react-redux";
import { SearchIcon } from "../Icons/SearchIcon.tsx";
import "./DesktopSearchToggle.css";
import { closeAllModals, toggleModal } from "../../../redux/modals";

export const DesktopSearchToggle = () => {
  const dispatch = useDispatch();
  return (
    <button
      className="desktop-search-toggle"
      onClick={() => {
        dispatch(closeAllModals({ keepSidebarOpen: true }));
        dispatch(toggleModal({ key: "searchModal", value: true }));
      }}
    >
      <SearchIcon />
      <span className="search-span">Search for anything</span>
    </button>
  );
};
