import { useDispatch, useSelector } from "react-redux";
import ModalOverlay from "../ModalOverlay/ModalOverlay";
import XIcon from "../Icons/XIcon";
import { toggleModal } from "../../../redux/modals";
import "./SearchModal.css";
import SearchIcon from "../Icons/SearchIcon";
import { useEffect, useRef, useState } from "react";
import { setDraftSearchValue, setSavedSearchValue } from "../../../redux/search";
import { setFlag } from "../../../redux/flags";
import { setFiltersUpdated } from "../../../redux/filters";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../../utils/supabase";
import { getTimeAgo } from "../../../utils/usefulFunctions";

const SearchModal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
  const [error, setError] = useState();
  const [resultsLoading, setResultsLoading] = useState(false);
  const [searchIsInitial, setSearchIsInitial] = useState(true);

  function handleSearcOldh() {
    console.log("handleSearch", search);
    dispatch(setFlag({ key: "searchedListingsNeedUpdate", value: true }));
    dispatch(setFiltersUpdated(false));
    dispatch(toggleModal({ key: "searchModal", value: false }));
  }

  function handleSearch(e) {
    e.preventDefault();
    try {
      if (search.draftSearchValue === search.savedSearchValue) return;
      dispatch(setSavedSearchValue(search.draftSearchValue));
      dispatch(setFlag({ key: "searchedListingsNeedUpdate", value: true }));
      dispatch(toggleModal({ key: "searchModal", value: false }));
      setSearchIsInitial(false);
      searchRef.current?.blur();
    } catch (error) {
      console.error(error);
      setError(error.message.toString());
    }
  }

  async function handleOnInputSearch(searchValue) {
    try {
      setResultsLoading(true);

      let { data, error } = await supabase.rpc("get_search_result_listing_previews", {
        p_search_value: searchValue,
      });

      if (error) throw error.message;

      data = data.map((img) => {
        const { data, error } = supabase.storage
          .from("item_images")
          .getPublicUrl(img.path);

        if (error) throw error.message;

        return {
          ...img,
          image_url: data.publicUrl,
        };
      });

      setSearchResults({
        ...searchResults,
        listings: data,
      });
      setSearchIsInitial(false);
    } catch (error) {
      console.log(error);
      setError(error.toString());
    }

    setResultsLoading(false);
  }

  useEffect(() => {
    const debounceFn = setTimeout(() => {
      if (search.draftSearchValue == "" && searchIsInitial) return;
      dispatch(setSavedSearchValue(search.draftSearchValue));
      handleOnInputSearch(search.draftSearchValue);
    }, 500);

    return () => clearTimeout(debounceFn);
  }, [search.draftSearchValue]);

  const selectedSearchType = searchTypes.find((type) => type.toggled);
  const resultsForView = searchResults[selectedSearchType?.label?.toLowerCase()];

  return (
    <>
      <div className="modal search-modal">
        {/* <div className="header">
          <h2>Search</h2>
          <button className="button">
            <XIcon /> Close
          </button>
        </div> */}
        {error && <p className="small-text error-text">{error.toString()}</p>}
        <p>
          <i>This feature is under development</i>
        </p>
        <div className="search-input-container">
          <SearchIcon />
          <form onSubmit={handleSearch}>
            <input
              placeholder="Search for anything (ex. Planet Eclipse, LTR, Sandana)"
              value={search.draftSearchValue}
              onChange={(e) => dispatch(setDraftSearchValue(e.target.value))}
              ref={searchRef}
            />
            <button type="submit" className="search-apply-button">
              Search
            </button>
          </form>
        </div>
        <div className="search-results-container">
          <div className="search-types-list">
            {searchTypes.map((searchType) => (
              <button
                id={searchType.label}
                className={`${searchType.toggled ? "toggled" : ""}`}
                onClick={() => {

                  setSearchTypes(
                    searchTypes.map((innerSearchType) => ({
                      ...innerSearchType,
                      toggled: innerSearchType.id == searchType.id,
                    }))
                  );

                  if (
                    searchType.id !== selectedSearchType?.id &&
                    search.savedSearchValue !== ""
                  ) {
                    setResultsLoading(true);
                    setTimeout(() => {
                      setResultsLoading(false);
                      // * Api call would be here instead of the settimeout
                    }, 1000);
                  }
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
            ) : search.savedSearchValue == "" ? (
              <p className="type-something-prompt">Type something to get started</p>
            ) : resultsForView.length == 0 ? (
              <div className="no-search-results">
                <p>
                  No results found for "{search.savedSearchValue}" in{" "}
                  <strong>{selectedSearchType.label}</strong>
                </p>
                {console.log(selectedSearchType)}
              </div>
            ) : selectedSearchType.label == "Listings" ? (
              <ul className="listings">
                {searchResults.listings.map((listing) => (
                  <li>
                    <Link
                      onClick={() =>
                        dispatch(toggleModal({ key: "searchModal", value: false }))
                      }
                      to={`${listing.id}`}
                    >
                      <div className="image-container">
                        <img src={listing.image_url} />
                      </div>
                      {console.log(listing)}
                      <div className="listing-info">
                        <p className="what-is-this">{listing.what_is_this}</p>
                        <p className="username">
                          Listed by {listing.created_by_username}{" "}
                          {getTimeAgo(new Date(listing.created_dttm))}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : selectedSearchType.label == "Users" ? (
              <div className="user-results">Search users found</div>
            ) : (
              false
            )}
          </div>
        </div>
      </div>
      <ModalOverlay
        onClick={() => {
          dispatch(toggleModal({ key: "searchModal", value: false }));
          dispatch(setDraftSearchValue(""));
          dispatch(setSavedSearchValue(""));
        }}
      />
    </>
  );
};
export default SearchModal;
