import "./Home.css";
import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabase.js";
import useWindowSize from "../../../utils/useWindowSize";
import ListingGrid from "../../ui/ListingGrid/ListingGrid.jsx";
import FiltersSidebar from "../../ui/FiltersSidebar/FiltersSidebar.jsx";
import { useDispatch, useSelector } from "react-redux";
import { toggleModal } from "../../../redux/modals.js";
import ModalOverlay from "../../ui/ModalOverlay/ModalOverlay.jsx";
import XIcon from "../../ui/Icons/XIcon.jsx";
import { setFlag } from "../../../redux/flags.js";
import { resetFilter, setFiltersUpdated } from "../../../redux/filters.js";
import SkeletonsListingGrid from "../../ui/SkeletonsListingGrid/SkeletonsListingGrid.jsx";
import FilterTags from "../../ui/FilterTags/FilterTags.jsx";
import FilterIcon from "../../ui/Icons/FilterIcon.jsx";

function Listings() {
  const dispatch = useDispatch();
  const modals = useSelector((state) => state.modals);
  const flags = useSelector((state) => state.flags);
  const filters = useSelector((state) => state.filters);
  const search = useSelector((state) => state.search);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [listingsInitiallyLoading, setListingsInitiallyLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
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
      if (!listingsInitiallyLoading && listingsLoading) {
        setListingsLoading(true);
      }

      let { data, error } = await supabase.rpc("get_items", {
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
        console.error(error);
        throw error.message;
      }

      if (!data) throw "No listings available";

      data = data.map((item) => {
        const { data, error } = supabase.storage
          .from("profile_pictures")
          .getPublicUrl(item.profile_picture_path || "placeholders/user-placeholder");

        if (error) throw error.message;

        return {
          ...item,
          profile_picture: data.publicUrl,
        };
      });

      setListings(data);
      setListingsLoading(false);

      if (isInitialLoad) setIsInitialLoad(false);
      // if (filters.filtersUpdated) dispatch(setFiltersUpdated(false));
      if (flags.searchedListingsNeedsUpdate)
        dispatch(setFlag({ key: "searchedListingsNeedsUpdate", value: false }));
      dispatch(setFiltersUpdated(false));
    } catch (error) {
      console.error(error);
      setListingsError(error.toString());
    }

    setListingsInitiallyLoading(false);
  }

  useEffect(() => {
    if (windowSize.width < 625)
      dispatch(toggleModal({ key: "filtersSidebar", value: false }));
  }, []);

  useEffect(() => {
    getListings(search.savedSearchValue);
  }, [sort]);

  useEffect(() => {
    // if (filters.filtersUpdated) getListings(searchValue);
    if (filters.filtersUpdated) getListings(search.savedSearchValue);
  }, [filters.filtersUpdated]);

  useEffect(() => {
    if (flags.searchedListingsNeedsUpdate) getListings(search.savedSearchValue);
  }, [flags.searchedListingsNeedsUpdate]);

  // function handleSearchSubmit(e) {
  //   e.preventDefault();
  //   setSearchValue(draftSearchValue);

  //   getListings(draftSearchValue);
  // }

  const numChecked = {
    conditionOptions: filters.saved.conditionOptions.filter((op) => op.checked).length,
    shippingOptions: filters.saved.shippingOptions.filter((op) => op.checked).length,
    tradeOptions: filters.saved.tradeOptions.filter((op) => op.checked).length,
    negotiableOptions: filters.saved.negotiableOptions.filter((op) => op.checked).length,
  };

  let filterTags = [
    {
      label: `State: ${filters.saved.state}`,
      onDeleteClick: () => {
        dispatch(resetFilter("state"));
        dispatch(setFiltersUpdated(true));
      },
      active: filters.saved.state != "All",
    },
    {
      label: `City: ${filters.saved.city}`,
      onDeleteClick: () => {
        dispatch(resetFilter("city"));
        dispatch(setFiltersUpdated(true));
      },
      active: filters.saved.city != "All",
    },
    {
      label: filters.saved.priceOptions.find((op) => op.checked).value,
      onDeleteClick: () => {
        dispatch(resetFilter("priceOptions"));
        dispatch(setFiltersUpdated(true));
      },
      active: !filters.saved.priceOptions.find((op) => op.id == 0).checked,
    },
    {
      label: `Condition (${numChecked.conditionOptions}/${filters.saved.conditionOptions.length})`,
      onDeleteClick: () => {
        dispatch(resetFilter("conditionOptions"));
        dispatch(setFiltersUpdated(true));
      },
      active: numChecked.conditionOptions !== filters.saved.conditionOptions.length,
    },
    {
      label: `Shipping (${numChecked.shippingOptions}/${filters.saved.shippingOptions.length})`,
      onDeleteClick: () => {
        dispatch(resetFilter("shippingOptions"));
        dispatch(setFiltersUpdated(true));
      },
      active: numChecked.shippingOptions !== filters.saved.shippingOptions.length,
    },
    {
      label: `Trades (${numChecked.tradeOptions}/${filters.saved.tradeOptions.length})`,
      onDeleteClick: () => {
        dispatch(resetFilter("tradeOptions"));
        dispatch(setFiltersUpdated(true));
      },
      active: numChecked.tradeOptions !== filters.saved.tradeOptions.length,
    },
    {
      label: `Negotiable (${numChecked.negotiableOptions}/${filters.saved.negotiableOptions.length})`,
      onDeleteClick: () => {
        dispatch(resetFilter("negotiableOptions"));
        dispatch(setFiltersUpdated(true));
      },
      active: numChecked.negotiableOptions !== filters.saved.negotiableOptions.length,
    },
  ];

  return (
    <div className="home">
      <div className="sidebar-and-grid">
        {modals.filtersSidebarToggled && (
          <>
            {/* <FiltersSidebar allFiltersDisabled={listings.length == 0} /> */}
            <FiltersSidebar allFiltersDisabled={false} />
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
          <div className="listings-controls">
            {location.pathname == "/" && (
              <button
                className="filters-button"
                onClick={() =>
                  dispatch(
                    toggleModal({
                      key: "filtersSidebar",
                      value:
                        windowSize.width > 625 ? !modals.filtersSidebarToggled : true,
                    })
                  )
                }
              >
                <FilterIcon />
              </button>
            )}
            <div className="control-group sort">
              <p>Sort By:</p>

              <select
                id="sort-select"
                onChange={(e) => setSort(e.target.value)}
                value={sort}
              >
                <option>Alphabetically (A-Z)</option>
                <option>Alphabetically (Z-A)</option>
                <option>Price (Low-High)</option>
                <option>Price (High-Low)</option>
                <option>Date Listed (New-Old)</option>
                <option>Date Listed (Old-New)</option>
              </select>
            </div>
          </div>
          {filterTags.filter((filter) => filter.active).length >= 1 && (
            <FilterTags filterTags={filterTags} />
          )}
          {listingsError ? (
            <p>{listingsError}</p>
          ) : listingsInitiallyLoading && listingsLoading ? (
            <p>
              <SkeletonsListingGrid
                // message={"Loading listings..."}
                // link={{ url: "/sell", label: "Sell something" }}
                accountsForSidebar={
                  windowSize.width > 225 && modals.filtersSidebarToggled
                }
                hasOverlay={false}
                numSkeletons={20}
                blinking={true}
                heightPx={null}
              />
            </p>
          ) : !listingsInitiallyLoading && listingsLoading ? (
            <p>Loading subsequently</p>
          ) : !isInitialLoad && listings.length === 0 ? (
            <SkeletonsListingGrid
              message={"No listings found, try adjusting your search or filters."}
              link={{ url: "/sell", label: "Sell something" }}
              accountsForSidebar={windowSize.width > 225 && modals.filtersSidebarToggled}
              hasOverlay={true}
              numSkeletons={20}
              blinking={false}
              heightPx={null}
            />
          ) : (
            <>
              <ListingGrid
                listings={listings}
                accountForSidebar={windowSize.width > 225 && modals.filtersSidebarToggled}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Listings;
