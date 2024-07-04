import { useDispatch, useSelector } from "react-redux";
import { ModalOverlay } from "../ModalOverlay/ModalOverlay";
import { Arrow } from "../Icons/Arrow";
import { toggleModal } from "../../../redux/modals";
import { SearchIcon } from "../Icons/SearchIcon";
import { useEffect, useRef, useState } from "react";
import { setDraftSearchValue, setSavedSearchValue } from "../../../redux/search";
import { setFlag } from "../../../redux/flags";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../../utils/supabase";
import { getTimeAgo, isOnMobile } from "../../../utils/usefulFunctions";
import "./SearchModal.css";

export const SearchModal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const searchRef = useRef();
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
  const [searchValue, setSearchValue] = useState({
    draft: "",
    saved: "",
  });
  const [searchHistory, setSearchHistory] = useState([]);
  const { user } = useSelector((state) => state.auth);
  const [
    recentSearchClicked_handleSearchAgain,
    setRecentSearchClicked_handleSearchAgain,
  ] = useState(false);



  async function getRecentSearches() {
    try {
      const { data, error } = await supabase.rpc("get_search_history", {
        p_user_id: user.auth_id,
      });

      if (error) throw error.message;

      setSearchHistory(data);
    } catch (error) {
      setError(error.toString());
    }
  }

  async function handleSearch(e, origin) {
    if (e) e.preventDefault();

    try {
      console.log({ searchValue });
      if (searchValue.draft == "") throw "Cannot search without a query";

      if (location.pathname !== "/") navigate("/");

      if (user) {
        const { data, error } = await supabase.rpc("add_search", {
          p_created_by_id: user.auth_id,
          p_search_value: searchValue.draft.trim(),
          p_origin: origin
        });

        if (error) throw error.message;

        console.log(data);
      } else {
        alert("No user, no search history"); // TODO - fix and delete
      }

      dispatch(setSavedSearchValue(searchValue.draft));
      dispatch(setFlag({ key: "searchedListingsNeedUpdate", value: true }));
      dispatch(toggleModal({ key: "searchModal", value: false }));
      setSearchIsInitial(false);
      searchRef.current?.blur();
    } catch (error) {
      console.error(error);
      setError(error.toString());
    }

    if (recentSearchClicked_handleSearchAgain)
      setRecentSearchClicked_handleSearchAgain(false);
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
      if (searchValue.draft == "" && searchIsInitial) return;
      // dispatch(setSavedSearchValue(searchValue.draft));
      setSearchValue({ ...searchValue, saved: searchValue.draft });
      handleOnInputSearch(searchValue.draft);
    }, 500);

    return () => clearTimeout(debounceFn);
  }, [searchValue.draft]);

  useEffect(() => {
    if (recentSearchClicked_handleSearchAgain) handleSearch(null, 'Recently Searched Click');
  }, [recentSearchClicked_handleSearchAgain]);

  useEffect(() => {
    getRecentSearches();
    searchRef.current.focus();
  }, []);

  const selectedSearchType = searchTypes.find((type) => type.toggled);
  const resultsForView = searchResults[selectedSearchType?.label?.toLowerCase()];

  return (
    <>
      <div className="modal search-modal">
        {error && <p className="small-text error-text">{error.toString()}</p>}
        <div className="search-input-container">
          <SearchIcon />
          <form onSubmit={(e) => handleSearch(e, "Search Input")}>
            <input
              placeholder="Search for anything (ex. Planet Eclipse, LTR, Sandana)"
              value={searchValue.draft}
              onChange={(e) => setSearchValue({ ...searchValue, draft: e.target.value })}
              ref={searchRef}
            />
            <button type="submit" className="search-apply-button">
              {isOnMobile() ? <Arrow direction={"right"} /> : "Search"}
            </button>
          </form>
        </div>
        <div className="search-results-container">
          {/* <div className="search-types-list">
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
          </div> */}

          {searchValue.saved == "" && searchHistory?.length >= 1 ? (
            <div className="recent-searches">
              <p className="label">Recent Searches</p>
              <ul className="search-list">
                {searchHistory.map((searchHistoryItem, i) => (
                  <li
                    key={i}
                    onClick={(e) => {
                      setSearchValue({
                        draft: searchHistoryItem.search_value,
                        saved: searchHistoryItem.search_value,
                      });

                      setRecentSearchClicked_handleSearchAgain(true);
                    }}
                  >
                    <p>{searchHistoryItem.search_value}</p>
                    <Arrow direction={"right"} />
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="search-results">
              {resultsLoading ? (
                <div className="results-loading">
                  <p>Results loading...</p>
                </div>
              ) : searchValue.saved == "" && searchHistory.length == 0 ? (
                <p className="type-something-prompt">Type something to get started</p>
              ) : resultsForView.length == 0 ? (
                <div className="no-search-results">
                  <p>
                    No results found for "{searchValue.saved}" in{" "}
                    <strong>{selectedSearchType.label}</strong>
                  </p>
                </div>
              ) : selectedSearchType.label == "Listings" ? (
                <ul className="listings">
                  {searchResults.listings.map((listing) => (
                    <li>
                      <Link
                        onClick={() =>
                          dispatch(toggleModal({ key: "searchModal", value: false }))
                        }
                        to={`/listing/${listing.id}`}
                      >
                        <div className="image-container">
                          <img src={listing.image_url} />
                        </div>
                        {console.log(listing)}
                        <div className="listing-info">
                          <p className="what-is-this">{listing.what_is_this}</p>

                          <p className="location">
                            {listing.city}, {listing.state} {"-  "}
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
          )}
        </div>
      </div>
      <ModalOverlay
        zIndex={5}
        onClick={() => {
          dispatch(toggleModal({ key: "searchModal", value: false }));
          dispatch(setDraftSearchValue(""));
          dispatch(setSavedSearchValue(""));
        }}
      />
    </>
  );
};
