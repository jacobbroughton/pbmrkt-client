import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { setFlag } from "../../../redux/flags";
import { toggleModal } from "../../../redux/modals";
import { setDraftSearchValue, setSavedSearchValue } from "../../../redux/search";
import { getTimeAgo, isOnMobile } from "../../../utils/usefulFunctions";
import { ErrorBanner } from "../ErrorBanner/ErrorBanner";
import { Arrow } from "../Icons/Arrow";
import { SearchIcon } from "../Icons/SearchIcon.tsx";
import { XIcon } from "../Icons/XIcon";
import { ModalOverlay } from "../ModalOverlay/ModalOverlay";
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
      const urlSearchParams = new URLSearchParams({
        user_id: user.id,
      }).toString();

      const response = await fetch(
        `http://localhost:4000/get-search-history?${urlSearchParams}`
      );

      if (!response.ok) throw new Error("Something happened at get-search-history");

      const { data } = await response.json();

      const urlSearchParams2 = new URLSearchParams({ user_id: user.id }).toString();

      const response2 = await fetch(
        `http://localhost:4000/get-default-seller-inputs?${urlSearchParams2}`
      );

      if (!response2.ok) throw new Error("Something happened get-default-seller-inputs");

      const { data: defaultSellerInputs } = await response2.json();

      if (!defaultSellerInputs || !defaultSellerInputs.length === 0)
        throw new Error("No default seller inputs were fetched");

      if (error) throw error.message;

      setSearchHistory(data);
    } catch (error) {
      console.error(error);
      setError(error.toString());
    }
  }

  async function handleSearch(e, origin) {
    if (e) e.preventDefault();

    try {
      if (searchValue.draft == "") throw "Cannot search without a query";

      if (location.pathname !== "/") navigate("/");

      if (!user)
        throw new Error("No user, no search history. this block isn't doing anything");

      // const response = await fetch("http") // split the queries up

      const response2 = await fetch("http://localhost:4000/add-search", {
        method: "post",
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          created_by_id: user.id,
          search_value: searchValue.draft.trim(),
          origin: origin,
        }),
      });

      if (!response2.ok) throw new Error("Something happened at add-search");

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

      const urlSearchParams = new URLSearchParams({
        search_value: searchValue,
      }).toString();

      const response = await fetch(
        `http://localhost:4000/get-search-result-listing-previews?${urlSearchParams}`
      );

      if (!response.ok)
        throw new Error("Something happened get-search-result-listing-previews");

      let { data } = await response.json();

      data = data.map((img) => {
        return {
          ...img,
          image_url: "",
        };
      });

      setSearchResults({
        ...searchResults,
        listings: data,
      });
      setSearchIsInitial(false);
    } catch (error) {
      console.error(error);
      setError(error.toString());
    }

    setResultsLoading(false);
  }

  async function deleteRecentSearch(e, recentSearch) {
    e.stopPropagation();
    try {
      const response = await fetch("http://localhost:4000/delete-search", {
        method: "post",
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          search_id: recentSearch.id,
        }),
      });

      if (!response.ok) throw new Error("Something happened at delete-search");

      setSearchHistory(
        searchHistory.filter(
          (searchHistoryItem) => searchHistoryItem.id !== recentSearch.id
        )
      );
    } catch (error) {
      console.error(error);
      setError(error.toString());
    }
  }

  useEffect(() => {
    const debounceFn = setTimeout(() => {
      if (searchValue.draft == "" && searchIsInitial) return;
      setSearchValue({ ...searchValue, saved: searchValue.draft });
      handleOnInputSearch(searchValue.draft);
    }, 500);

    return () => clearTimeout(debounceFn);
  }, [searchValue.draft]);

  useEffect(() => {
    if (recentSearchClicked_handleSearchAgain)
      handleSearch(null, "Recently Searched Click");
  }, [recentSearchClicked_handleSearchAgain]);

  useEffect(() => {
    if (user) getRecentSearches();
    searchRef.current.focus();
  }, []);

  const selectedSearchType = searchTypes.find((type) => type.toggled);
  const resultsForView = searchResults[selectedSearchType?.label?.toLowerCase()];

  return (
    <>
      <div className={`modal search-modal ${searchValue.draft !== "" ? "active" : ""}`}>
        {error && (
          <ErrorBanner
            error={error.toString()}
            handleCloseBanner={() => setError(null)}
          />
        )}
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
          {searchValue.saved == "" && searchHistory?.length >= 1 ? (
            <div className="recent-searches">
              <p className="label">Recent Searches</p>
              <ul className="search-list">
                {searchHistory.length >= 1 ? (
                  searchHistory?.map((searchHistoryItem, i) => (
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
                      <div className="right-side">
                        <Arrow direction={"right"} />
                        <button
                          className="delete-search-history-button"
                          onClick={(e) => deleteRecentSearch(e, searchHistoryItem)}
                        >
                          <XIcon />
                        </button>
                      </div>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="skeleton">&nbsp;</li>
                  </>
                )}
              </ul>
            </div>
          ) : resultsLoading ? (
            <div className="results-loading">
              <p>Results loading...</p>
            </div>
          ) : (
            <div className="search-results">
              {searchValue.saved == "" && searchHistory.length == 0 ? (
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
        zIndex={8}
        onClick={() => {
          dispatch(toggleModal({ key: "searchModal", value: false }));
          dispatch(setDraftSearchValue(""));
          // dispatch(setSavedSearchValue(""));
        }}
      />
    </>
  );
};
