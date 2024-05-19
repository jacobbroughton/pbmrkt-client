// import { Link } from "react-router-dom";
import "./Home.css";
import SearchIcon from "../../ui/Icons/SearchIcon.jsx";
import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabase.js";
// import DoubleArrow from "../../ui/Icons/DoubleArrow.jsx";
import useWindowSize from "../../../utils/useWindowSize";
// import { states, statesAndCities } from "../../../utils/statesAndCities.js";
// import { capitalizeWords } from "../../../utils/usefulFunctions.js";
import ListingGrid from "../../ui/ListingGrid/ListingGrid.jsx";
import Sidebar from "../../ui/FiltersSidebar/FiltersSidebar.jsx";
import { useDispatch, useSelector } from "react-redux";
import { toggleModal } from "../../../redux/modals.js";
import DoubleArrow from "../../ui/Icons/DoubleArrow.jsx";
import { setFiltersUpdated } from "../../../redux/filters.js";
import ItemSkeleton from "../../ui/Skeletons/ItemSkeleton/ItemSkeleton.jsx";
import FilterIcon from "../../ui/Icons/FilterIcon.jsx";

function Listings() {
  const dispatch = useDispatch();
  const modals = useSelector((state) => state.modals);
  const filters = useSelector((state) => state.filters);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [draftSearchValue, setDraftSearchValue] = useState("");
  const [listingsError, setListingsError] = useState(null);
  const [sort, setSort] = useState("Date Listed (New-Old)");
  // const [filtersUpdated, setFiltersUpdated] = useState(false);
  const windowSize = useWindowSize();
  const [sidebarToggled, setSidebarToggled] = useState(windowSize.width > 625);
  const [sidebarNeedsUpdate, setSidebarNeedsUpdate] = useState(windowSize.width > 625);

  const [views, setViews] = useState([
    {
      id: 0,
      label: "For Sale",
      toggled: true,
    },
    {
      id: 1,
      label: "Looking To Buy",
      toggled: false,
    },
  ]);

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
        p_state: filters.saved.state || "",
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
        p_city: filters.saved.city || "",
      });

      if (error) {
        console.log(error);
        throw error.message;
      }

      if (!data) throw "No listings available";

      setListings(data);
      setListingsLoading(false);

      if (isInitialLoad) setIsInitialLoad(false);
      if (filters.filtersUpdated) dispatch(setFiltersUpdated(false));
    } catch (error) {
      setListingsError(error.toString());
    }
  }

  useEffect(() => {
    if (windowSize.width < 625)
      dispatch(toggleModal({ key: "filtersSidebar", value: false }));
  }, []);

  useEffect(() => {
    getListings(searchValue);
  }, [sort]);

  useEffect(() => {
    if (filters.filtersUpdated) getListings(searchValue);
  }, [filters.filtersUpdated]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    setSearchValue(draftSearchValue);

    getListings(draftSearchValue);
  }

  return (
    <div className="home">
      <div className="sidebar-and-grid">
        {/* {!modals.filtersSidebarToggled && (
          <button
            onClick={() => dispatch(toggleModal({ key: "filtersSidebar", value: true }))}
            type="button"
            className="sidebar-toggle-button"
          >
            <DoubleArrow direction="right" />
          </button>
        )} */}
        {modals.filtersSidebarToggled && <Sidebar />}
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
          <div className="search-bar">
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
          </div>
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
            {/* ) : (
              <span>&nbsp;</span>
            )} */}
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
            <div className="skeletons-grid">
              <ItemSkeleton />
              <ItemSkeleton />
              <ItemSkeleton />
              <ItemSkeleton />
              <ItemSkeleton />
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
