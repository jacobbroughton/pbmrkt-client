import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabase.js";
import useWindowSize from "../../../utils/useWindowSize";
import ListingGrid from "../../ui/ListingGrid/ListingGrid.jsx";
import FiltersSidebar from "../../ui/FiltersSidebar/FiltersSidebar.jsx";
import { useDispatch, useSelector } from "react-redux";
import { toggleModal } from "../../../redux/modals.js";
import ModalOverlay from "../../ui/ModalOverlay/ModalOverlay.jsx";
import Caret from "../../ui/Icons/Caret.jsx";
import { setFlag } from "../../../redux/flags.js";
import { resetFilter, setFiltersUpdated } from "../../../redux/filters.js";
import SkeletonsListingGrid from "../../ui/SkeletonsListingGrid/SkeletonsListingGrid.jsx";
import FilterTags from "../../ui/FilterTags/FilterTags.jsx";
import FilterIcon from "../../ui/Icons/FilterIcon.jsx";
import {
  nestItemCategories,
  setCategoryChecked,
  toggleCategoryFolder,
} from "../../../utils/usefulFunctions.js";
import { setDraftSearchValue, setSavedSearchValue } from "../../../redux/search.js";
import Footer from "../../ui/Footer/Footer.jsx";
import CategorySelectorModal from "../../ui/CategorySelectorModal/CategorySelectorModal.jsx";
import "./Home.css";

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
  const [listingsError, setListingsError] = useState(null);
  const [categories, setCategories] = useState(null);
  const [initialCategories, setInitialCategories] = useState(null);
  const [sort, setSort] = useState("Date Listed (New-Old)");
  const windowSize = useWindowSize();
  const [sidebarNeedsUpdate, setSidebarNeedsUpdate] = useState(windowSize.width > 625);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [view, setView] = useState(null);

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
      // if (!listingsInitiallyLoading && listingsLoading) {
      setListingsLoading(true);
      // }

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
        p_category_id: filters.saved.category?.id || null,
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

      if (isInitialLoad) setIsInitialLoad(false);
      // if (filters.filtersUpdated) dispatch(setFiltersUpdated(false));
      if (flags.searchedListingsNeedUpdate)
        dispatch(setFlag({ key: "searchedListingsNeedUpdate", value: false }));
      dispatch(setFiltersUpdated(false));
    } catch (error) {
      console.error(error);
      setListingsError(error.toString());
    }

    setListingsLoading(false);
    setListingsInitiallyLoading(false);
  }

  useEffect(() => {
    if (windowSize.width < 625)
      dispatch(toggleModal({ key: "filtersSidebar", value: false }));
  }, []);

  useEffect(() => {
    getItemCategories();
    getListings(search.savedSearchValue);
  }, [sort]);

  useEffect(() => {
    // if (filters.filtersUpdated) getListings(searchValue);
    if (filters.filtersUpdated) getListings(search.savedSearchValue);
  }, [filters.filtersUpdated]);

  useEffect(() => {
    if (flags.searchedListingsNeedUpdate) getListings(search.savedSearchValue);
  }, [flags.searchedListingsNeedUpdate]);

  // function handleSearchSubmit(e) {
  //   e.preventDefault();
  //   setSearchValue(draftSearchValue);

  //   getListings(draftSearchValue);
  // }

  async function getItemCategories() {
    try {
      const { data, error } = await supabase.rpc("get_item_categories");

      if (error) throw error.message;

      console.log("categories", data);

      const nestedItemCategories = nestItemCategories(data);

      setInitialCategories(nestedItemCategories);
      setCategories(nestedItemCategories);
    } catch (error) {
      console.error(error);
      setListingsError(error);
    }
  }
  const numChecked = {
    conditionOptions: filters.saved.conditionOptions.filter((op) => op.checked).length,
    shippingOptions: filters.saved.shippingOptions.filter((op) => op.checked).length,
    tradeOptions: filters.saved.tradeOptions.filter((op) => op.checked).length,
    negotiableOptions: filters.saved.negotiableOptions.filter((op) => op.checked).length,
  };

  let filterTags = [
    {
      label: `Search: ${search.savedSearchValue}`,
      onDeleteClick: () => {
        dispatch(setDraftSearchValue(""));
        dispatch(setSavedSearchValue(""));
        dispatch(setFlag({ key: "searchedListingsNeedUpdate", value: true }));
        // dispatch(setFiltersUpdated(true));
      },
      active: search.savedSearchValue != "",
    },
    {
      label: `Category: ${filters.saved?.category?.value}`,
      onDeleteClick: () => {
        // dispatch(setFlag({ key: "searchedListingsNeedUpdate", value: true }));
        // dispatch(resetFilter("category"));
        // dispatch(setFiltersUpdated(true));
        // setSelectedCategory(null)
        // dispatch(setSelectedCategory(null));
        dispatch(resetFilter("category"));
        dispatch(setFiltersUpdated(true));
        setCategories(initialCategories);
      },
      active: filters.saved.category,
    },
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
            <FiltersSidebar
              allFiltersDisabled={false}
              categories={categories}
              setCategories={setCategories}
            />
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
          {/* <div className="wtb-section">
            <button
              className={`${view == "for-sale" ? "toggled" : ""}`}
              onClick={() => setView("for-sale")}
            >
              For Sale
            </button>
            <button
              className={`${view == "wtb" ? "toggled" : ""}`}
              onClick={() => setView("wtb")}
            >
              ISO/WTB/Looking-For
            </button>
          </div> */}
          <div className="listings-controls">
            {location.pathname == "/" && (
              <button
                title={
                  modals.filtersSidebarToggled
                    ? "Hide Filters Sidebar"
                    : "Show Filters Sidebar"
                }
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
                {!modals.filtersSidebarToggled ? (
                  <Caret direction={"right"} />
                ) : (
                  <Caret direction={"left"} />
                )}{" "}
                <FilterIcon />
              </button>
            )}
            <div className="control-group sort">
              <p>Sorted By:</p>

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
            <p className="small-text error-text">{listingsError}</p>
          ) : listingsInitiallyLoading && listingsLoading ? (
            <p>
              <SkeletonsListingGrid
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
          ) : !isInitialLoad && listings.length === 0 ? (
            <>
              <SkeletonsListingGrid
                message={"No listings found, try adjusting your search or filters."}
                accountsForSidebar={
                  windowSize.width > 225 && modals.filtersSidebarToggled
                }
                hasOverlay={true}
                numSkeletons={20}
                blinking={false}
                heightPx={null}
                loading={!listingsInitiallyLoading && listingsLoading}
              />
              {/* <Footer /> */}
            </>
          ) : (
            <>
              <ListingGrid
                listings={listings}
                accountForSidebar={windowSize.width > 225 && modals.filtersSidebarToggled}
                loading={!listingsInitiallyLoading && listingsLoading}
              />
              {/* <Footer /> */}
            </>
          )}
        </div>
      </div>
      {modals.categorySelectorModalToggled && (
        <CategorySelectorModal
          categories={categories}
          setCategories={setCategories}
          setSelectedCategory={setSelectedCategory}
          selectedCategory={selectedCategory}
          handleCategoryClick={(category) => {
            if (category.is_folder) {
              setCategories(toggleCategoryFolder(category, categories));
            } else {
              setCategories(setCategoryChecked(category, categories));
            }
          }}
        />
      )}
    </div>
  );
}

export default Listings;
