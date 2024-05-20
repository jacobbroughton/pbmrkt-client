import { useDispatch, useSelector } from "react-redux";
import { setDraftSearchValue, setSavedSearchValue } from "../../../redux/search";
import SearchIcon from "../Icons/SearchIcon";
import "./SearchBar.css";
import { useState } from "react";
import { setFlag } from "../../../redux/flags";

const SearchBar = () => {
  const dispatch = useDispatch();
  const search = useSelector((state) => state.search);
  const [error, setError] = useState();

  function handleSearchSubmit(e) {
    e.preventDefault()
    try {
      if (search.draftSearchValue === search.savedSearchValue) return;
      dispatch(setSavedSearchValue(search.draftSearchValue));
      dispatch(setFlag({ key: "searchedListingsNeedsUpdate", value: true }));
    } catch (error) {
      console.log(error);
      setError(error.message.toString());
    }
  }

  return (
    <div className="search-bar">
      <form onSubmit={handleSearchSubmit}>
        <div className="search-input-container">
          <SearchIcon />
          <input
            placeholder="Search for anything (ex. Planet Eclipse, LTR, Sandana)"
            value={search.draftSearchValue}
            onChange={(e) => dispatch(setDraftSearchValue(e.target.value))}
          />
        </div>
        {error && <p className='error-text tiny text'>{error}</p>}
        {/* <button disabled={search.draftSearchValue === search.savedSearchValue}>
          Search
        </button> */}
      </form>
    </div>
  );
};
export default SearchBar;
