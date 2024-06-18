import { useDispatch, useSelector } from "react-redux";
import ModalOverlay from "../ModalOverlay/ModalOverlay";
import XIcon from "../Icons/XIcon";
import { toggleModal } from "../../../redux/modals";
import "./SearchModal.css";
import SearchIcon from "../Icons/SearchIcon";
import { useRef, useState } from "react";
import { setDraftSearchValue } from "../../../redux/search";

const SearchModal = () => {
  const dispatch = useDispatch();
  const searchRef = useRef();
  const search = useSelector((state) => state.search);
  const [searchResults, setSearchResults] = useState({
    listings: [],
    users: [],
  });
  const [searchTypes, setSearchTypes] = useState([
    { id: 0, label: "Listings", resultsCount: 10, toggled: true },
    { id: 1, label: "Users", resultsCount: 2, toggled: false },
  ]);
  const [resultsLoading, setResultsLoading] = useState(false);

  return (
    <>
      <div className="modal search-modal">
        {/* <div className="header">
          <h2>Search</h2>
          <button className="button">
            <XIcon /> Close
          </button>
        </div> */}
        <p><i>This feature does not work yet</i></p>
        <div className="search-input-container">
          <SearchIcon />
          <input
            placeholder="Search for anything (ex. Planet Eclipse, LTR, Sandana)"
            value={search.draftSearchValue}
            onChange={(e) => dispatch(setDraftSearchValue(e.target.value))}
            ref={searchRef}
          />
          <button onClick={() => null} className="search-apply-button">
            Search
          </button>
        </div>
        <div className="search-results-container">
          <div className="search-types-list">
            {searchTypes.map((searchType) => (
              <button
                id={searchType.label}
                className={`${searchType.toggled ? "toggled" : ""}`}
                onClick={() => {
                  if (
                    searchType.id !==
                    searchTypes.find((innerSearchType) => innerSearchType.toggled)?.id
                  ) {
                    setResultsLoading(true);
                  }

                  setSearchTypes(
                    searchTypes.map((innerSearchType) => ({
                      ...innerSearchType,
                      toggled: innerSearchType.id == searchType.id,
                    }))
                  );

                  setTimeout(() => {
                    setResultsLoading(false);
                    // * Api call would be here instead of the settimeout
                  }, 1000);
                }}
              >
                {searchType.label}
              </button>
            ))}
          </div>
          <div className="search-results">
            {resultsLoading ? (
              <div className="results-loading">
                <p>Results loading...</p>
              </div>
            ) : [].length == 0 ? (
              <div className="no-search-results">
                <p>No results found for "asdfdsfs"</p>
              </div>
            ) : (
              <div>Search results found</div>
            )}
          </div>
        </div>
      </div>
      <ModalOverlay
        onClick={() => dispatch(toggleModal({ key: "searchModal", value: false }))}
      />
    </>
  );
};
export default SearchModal;
