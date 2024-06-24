import { useDispatch } from "react-redux";
import SearchIcon from "../Icons/SearchIcon";
import "./DesktopSearchToggle.css";
import { toggleModal } from "../../../redux/modals";

const DesktopSearchToggle = () => {
  const dispatch = useDispatch();
  return (
    <button
      className="desktop-search-toggle"
      onClick={() => dispatch(toggleModal({ key: "searchModal", value: true }))}
    >
      <SearchIcon />
      Type <span className="slash-with-border">/</span> to search
    </button>
  );
};
export default DesktopSearchToggle;
