import { useDispatch, useSelector } from "react-redux";
import { setDraftSearchValue, setSavedSearchValue } from "../../../redux/search";
import SearchIcon from "../Icons/SearchIcon";
import "./SearchBar.css";
import { useEffect, useRef, useState } from "react";
import { setFlag } from "../../../redux/flags";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const search = useSelector((state) => state.search);
  const [error, setError] = useState();
  const [searchInputToggled, setSearchInputToggled] = useState(false);

  function handleSearchSubmit(e) {
    e.preventDefault();
    try {
      if (search.draftSearchValue === search.savedSearchValue) return;
      dispatch(setSavedSearchValue(search.draftSearchValue));
      dispatch(setFlag({ key: "searchedListingsNeedUpdate", value: true }));
      navigate("/");
      searchRef.current?.blur();
    } catch (error) {
      console.error(error);
      setError(error.message.toString());
    }
  }

  useEffect(() => {
    if (searchInputToggled) searchRef.current?.focus();
  }, [searchInputToggled]);

  return (
    <div className="search-bar">
      <form onSubmit={handleSearchSubmit}>
        <div className="search-input-container">
          <button
            className="search-input-toggle"
            onClick={(e) => {
              e.stopPropagation();
              setSearchInputToggled(!searchInputToggled);
            }}
          >
            <SearchIcon />
          </button>
          {searchInputToggled && (
            <input
              placeholder="Search for anything (ex. Planet Eclipse, LTR, Sandana)"
              value={search.draftSearchValue}
              onChange={(e) => dispatch(setDraftSearchValue(e.target.value))}
              ref={searchRef}
            />
          )}
        </div>
        {error && <p className="error-text tiny text">{error}</p>}
        {/* <button disabled={search.draftSearchValue === search.savedSearchValue}>
          Search
        </button> */}
      </form>
    </div>
  );
};
export default SearchBar;
