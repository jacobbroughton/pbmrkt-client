import "./Home.css";
import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabase.js";
import useWindowSize from "../../../utils/useWindowSize";
import ListingGrid from "../../ui/ListingGrid/ListingGrid.jsx";
import FiltersSidebar from "../../ui/FiltersSidebar/FiltersSidebar.jsx";
import { useDispatch, useSelector } from "react-redux";
import { toggleModal } from "../../../redux/modals.js";
import ItemSkeleton from "../../ui/Skeletons/ItemSkeleton/ItemSkeleton.jsx";
import ModalOverlay from "../../ui/ModalOverlay/ModalOverlay.jsx";
import FilterIcon from "../../ui/Icons/FilterIcon.jsx";
import { setFlag } from "../../../redux/flags.js";
import { setFiltersUpdated } from "../../../redux/filters.js";

function Listings() {
  const dispatch = useDispatch();
  const modals = useSelector((state) => state.modals);
  const flags = useSelector((state) => state.flags);
  const filters = useSelector((state) => state.filters);
  const search = useSelector((state) => state.search);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [draftSearchValue, setDraftSearchValue] = useState("");
  const [listingsError, setListingsError] = useState(null);
  const [sort, setSort] = useState("Date Listed (New-Old)");
  const windowSize = useWindowSize();
  const [sidebarNeedsUpdate, setSidebarNeedsUpdate] = useState(windowSize.width > 625);
  // const [views, setViews] = useState([
  //   {
  //     id: 0,
  //     label: "For Sale",
  //     toggled: true,
  //   },
  //   {
  //     id: 1,
  //     label: "Looking To Buy",
  //     toggled: false,
  //   },
  // ]);

  useEffect(() => {
    if (windowSize.width > 625) {
      dispatch(toggleModal({ key: "filtersSidebar", value: true }));
      setSidebarNeedsUpdate(true);
    }
    if (windowSize.width <= 625 && sidebarNeedsUpdate) {
      dispatch(toggleModal({ key: "filtersSidebar", value: false }));
      setSidebarNeedsUpdate(false);
    }
  }, [windowSize.width]);

  async function getListings(searchValue = "") {
    try {
      if (!listingsLoading) {
        setListingsLoading(true);
      }

      console.log(filters);

      const { data, error } = await supabase.rpc("get_items", {
        p_search_value: searchValue,
        p_brand: filters.saved.brand,
        p_model: filters.saved.model,
        p_min_price: filters.saved.minPrice || 0,
        p_max_price: filters.saved.maxPrice,
        p_state: filters.saved.state == "All" ? null : filters.saved.state,
        p_condition: filters.saved.conditionOptions
          .filter((option) => option.checked)
          .map((option) => option.value),
        p_shipping: filters.saved.shippingOptions
          .filter((option) => option.checked)
          .map((option) => option.value),
        p_trades: filters.saved.tradeOptions
          .filter((option) => option.checked)
          .map((option) => option.value),
        p_negotiable: filters.saved.negotiableOptions
          .filter((option) => option.checked)
          .map((option) => option.value),
        p_sort: sort,
        p_seller_id: null,
        p_city: filters.saved.city == "All" ? null : filters.saved.city,
      });

      if (error) {
        console.log(error);
        throw error.message;
      }

      if (!data) throw "No listings available";

      setListings(data);
      setListingsLoading(false);

      if (isInitialLoad) setIsInitialLoad(false);
      // if (filters.filtersUpdated) dispatch(setFiltersUpdated(false));
      if (flags.searchedListingsNeedsUpdate)
        dispatch(setFlag({ key: "searchedListingsNeedsUpdate", value: false }));
      dispatch(setFiltersUpdated(false))
    } catch (error) {
      setListingsError(error.toString());
    }
  }

  useEffect(() => {
    if (windowSize.width < 625)
      dispatch(toggleModal({ key: "filtersSidebar", value: false }));
  }, []);

  useEffect(() => {
    getListings(search.savedSearchValue);
  }, [sort]);

  useEffect(() => {
    console.log("Hello from useeffect")
    if (filters.filtersUpdated) getListings(searchValue);
  }, [filters.filtersUpdated]);

  useEffect(() => {
    if (flags.searchedListingsNeedsUpdate) getListings(search.savedSearchValue);
  }, [flags.searchedListingsNeedsUpdate]);

  // function handleSearchSubmit(e) {
  //   e.preventDefault();
  //   setSearchValue(draftSearchValue);

  //   getListings(draftSearchValue);
  // }

  return (
    <div className="home">
      <div className="sidebar-and-grid">
        {modals.filtersSidebarToggled && (
          <>
            <FiltersSidebar />
            {windowSize.width <= 625 && (
              <ModalOverlay
                zIndex={4}
                onClick={() =>
                  dispatch(toggleModal({ key: "filtersSidebar", value: false }))
                }
              />
            )}
          </>
        )}
        <div
          className={`${
            windowSize.width > 625 && modals.filtersSidebarToggled
              ? "has-sidebar-margin"
              : ""
          } listings-section`}
        >
          {/* <div className="view-toggle">
            {views.map((view) => (
              <button
                onClick={() =>
                  setViews(
                    views.map((innerView) => ({
                      ...innerView,
                      ...(view.id == innerView.id && {
                        toggled: !innerView.toggled,
                      }),
                    }))
                  )
                }
                className={`${view.toggled ? "toggled" : ""}`}
              >
                {view.label}
              </button>
            ))}
          </div> */}
          {/* <div className="search-bar">
            <form onSubmit={handleSearchSubmit}>
              <div className="search-input-container">
                <SearchIcon />
                <input
                  placeholder="Search"
                  value={draftSearchValue}
                  onChange={(e) => setDraftSearchValue(e.target.value)}
                />
              </div>
              <button disabled={draftSearchValue === searchValue}>Search</button>
            </form>
          </div> */}
          {/* <SearchBar /> */}
          <div className="listings-controls">
            {/* {windowSize.width <= 625 ? ( */}
            <button
              onClick={() =>
                dispatch(
                  toggleModal({
                    key: "filtersSidebar",
                    value: windowSize.width > 625 ? !modals.filtersSidebarToggled : true,
                  })
                )
              }
              className="filters-button"
            >
              Filters <FilterIcon />
            </button>
            <div className="control-group sort">
              <select onChange={(e) => setSort(e.target.value)} value={sort}>
                <option>Alphabetically (A-Z)</option>
                <option>Alphabetically (Z-A)</option>
                <option>Price (Low-High)</option>
                <option>Price (High-Low)</option>
                <option>Date Listed (New-Old)</option>
                <option>Date Listed (Old-New)</option>
              </select>
            </div>
          </div>
          {listingsError ? (
            <p>{listingsError}</p>
          ) : listingsLoading ? (
            <div
              className={`${
                windowSize.width > 225 && modals.filtersSidebarToggled
                  ? "accounts-for-sidebar"
                  : ""
              } skeletons-grid`}
            >
              {[...new Array(listings.length || 5)].map((num, i) => (
                <ItemSkeleton key={i} />
              ))}
            </div>
          ) : !isInitialLoad && listings.length == 0 ? (
            <p>No listings available</p>
          ) : (
            <ListingGrid
              listings={listings}
              accountForSidebar={windowSize.width > 225 && modals.filtersSidebarToggled}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Listings;
