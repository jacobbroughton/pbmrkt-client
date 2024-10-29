import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  resetFilter,
  resetFilters,
  setFilters,
  setFiltersUpdated,
} from "../../../redux/filters.js";
import { setFlag } from "../../../redux/flags.js";
import { toggleModal } from "../../../redux/modals.js";
import { setDraftSearchValue, setSavedSearchValue } from "../../../redux/search.js";
import { setViewLayout } from "../../../redux/view.js";
import { supabase } from "../../../utils/supabase.js";
import {
  collapseAllCategoryFolders,
  expandAllCategoryFolders,
  nestItemCategories,
  setCategoryChecked,
  toggleCategoryFolder,
} from "../../../utils/usefulFunctions.js";
import { useWindowSize } from "../../../utils/useWindowSize";
import { CategorySelectorModal } from "../../ui/CategorySelectorModal/CategorySelectorModal.jsx";
import { FiltersSidebar } from "../../ui/FiltersSidebar/FiltersSidebar.jsx";
import { FilterTags } from "../../ui/FilterTags/FilterTags.jsx";
import { ForSaleViews } from "../../ui/ForSaleViews/ForSaleViews.jsx";
import { SortIcon } from "../../ui/Icons/SortIcon.jsx";
import { ModalOverlay } from "../../ui/ModalOverlay/ModalOverlay.jsx";
import "./Home.css";
import { WantedViews } from "../../ui/WantedViews/WantedViews.jsx";

export function Listings() {
  const dispatch = useDispatch();

  const categorySelectorModalToggled = useSelector(
    (state) => state.modals.categorySelectorModalToggled
  );
  const filtersSidebarToggled = useSelector(
    (state) => state.modals.filtersSidebarToggled
  );
  const flags = useSelector((state) => state.flags);
  const view = useSelector((state) => state.view);
  const filters = useSelector((state) => state.filters);
  const search = useSelector((state) => state.search);

  const [categories, setCategories] = useState(null);
  const [initialCategories, setInitialCategories] = useState(null);
  const [sort, setSort] = useState("Date Listed (New-Old)");
  const windowSize = useWindowSize();
  const [sidebarNeedsUpdate, setSidebarNeedsUpdate] = useState(windowSize.width > 625);
  const [totalListings, setTotalListings] = useState(null);

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

  function handleCategorySelectorApply() {
    try {
      if (!filters.draft.category) throw "no category was selected";

      if (!filters.draft.category.is_folder) {
        dispatch(
          setFilters({
            ...filters,
            saved: {
              ...filters.saved,
              categories: filters.draft.categories,
              category: filters.draft.category,
            },
          })
        );
        dispatch(setFiltersUpdated(true));
        dispatch(toggleModal({ key: "categorySelectorModal", value: false }));
        if (view.layout == "Overview") dispatch(setViewLayout({ layout: "Grid" }));
      }
    } catch (error) {
      console.error(error);
      setError(error);
    }
  }

  useEffect(() => {
    if (windowSize.width < 625)
      dispatch(toggleModal({ key: "filtersSidebar", value: false }));
  }, []);

  useEffect(() => {
    getItemCategories();
  }, [sort]);

  useEffect(() => {
    if (view.layout == "Overview" && filters.filtersUpdated) getItemCategories();
  }, [filters.filtersUpdated]);

  async function getItemCategories() {
    try {
      const { data, error } = await supabase.rpc("get_item_categories", {
        p_search_value: "",
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
        p_seller_id: null,
        p_city: filters.saved.city == "All" ? null : filters.saved.city,
        p_category_id: filters.saved.category?.id || null,
      });

      if (error) throw error.message;

      const nestedItemCategories = nestItemCategories(data, null);

      if (true) setInitialCategories(nestedItemCategories);
      if (true) setCategories(nestedItemCategories);
      if (true)
        dispatch(
          setFilters({
            ...filters,
            filtersUpdated: false,
            saved: { ...filters.saved, categories: nestedItemCategories },
            draft: { ...filters.draft, categories: nestedItemCategories },
          })
        );
    } catch (error) {
      console.error(error);
      setError(error);
    }
  }

  const checkedConditionOptions = filters.saved.conditionOptions.filter(
    (option) => option.checked
  );
  const checkedShippingOptions = filters.saved.shippingOptions.filter(
    (option) => option.checked
  );
  const checkedTradeOptions = filters.saved.tradeOptions.filter(
    (option) => option.checked
  );
  const checkedNegotiableOptions = filters.saved.negotiableOptions.filter(
    (option) => option.checked
  );

  const numChecked = {
    conditionOptions: checkedConditionOptions.length,
    shippingOptions: checkedShippingOptions.length,
    tradeOptions: checkedTradeOptions.length,
    negotiableOptions: checkedNegotiableOptions.length,
  };

  let filterTags = [
    {
      label: `Search:`,
      value: `${search.savedSearchValue}`,
      onDeleteClick: () => {
        dispatch(setDraftSearchValue(""));
        dispatch(setSavedSearchValue(""));
        dispatch(setFlag({ key: "searchedListingsNeedUpdate", value: true }));
        // dispatch(setFiltersUpdated(true));
      },
      active: search.savedSearchValue != "",
    },
    {
      label: `Category`,
      value: filters.saved.category?.plural_name,
      onDeleteClick: () => {
        dispatch(resetFilter("category"));
        dispatch(setFiltersUpdated(true));
        setCategories(initialCategories);
      },
      active: filters.saved.category,
    },
    {
      label: "State",
      value: filters.saved.state,
      onDeleteClick: () => {
        dispatch(resetFilter("state"));
        dispatch(setFiltersUpdated(true));
      },
      active: filters.saved.state != "All",
    },
    {
      label: `City`,
      value: filters.saved.city,
      onDeleteClick: () => {
        dispatch(resetFilter("city"));
        dispatch(setFiltersUpdated(true));
      },
      active: filters.saved.city != "All",
    },
    {
      label: "Price Range",
      value: filters.saved.priceOptions.find((op) => op.checked).value,
      onDeleteClick: () => {
        dispatch(resetFilter("priceOptions"));
        dispatch(setFiltersUpdated(true));
      },
      active: !filters.saved.priceOptions.find((op) => op.id == 0).checked,
    },
    {
      label: `Condition`,
      value:
        checkedConditionOptions.length == 0
          ? "None"
          : `${filters.saved.conditionOptions
              .filter((option) => option.checked)
              .map((option) => option.value)
              .join(", ")}`,
      onDeleteClick: () => {
        dispatch(resetFilter("conditionOptions"));
        dispatch(setFiltersUpdated(true));
      },
      active:
        // checkedConditionOptions.length >= 1 &&
        checkedConditionOptions.length !== filters.saved.conditionOptions.length,
    },
    {
      label: `Shipping`,
      value:
        checkedShippingOptions.length == 0
          ? "None"
          : `${filters.saved.shippingOptions
              .filter((option) => option.checked)
              .map((option) => option.value)
              .join(", ")}`,
      onDeleteClick: () => {
        dispatch(resetFilter("shippingOptions"));
        dispatch(setFiltersUpdated(true));
      },
      active: checkedShippingOptions.length !== filters.saved.shippingOptions.length,
    },
    {
      label: `Trades`,
      value:
        checkedTradeOptions.length == 0
          ? "None"
          : `${filters.saved.tradeOptions
              .filter((option) => option.checked)
              .map((option) => option.value)
              .join(", ")}`,
      onDeleteClick: () => {
        dispatch(resetFilter("tradeOptions"));
        dispatch(setFiltersUpdated(true));
      },
      active: checkedTradeOptions.length !== filters.saved.tradeOptions.length,
    },
    {
      label: `Negotiability`,
      value:
        checkedNegotiableOptions.length == 0
          ? "None"
          : `${filters.saved.negotiableOptions
              .filter((option) => option.checked)
              .map((option) => option.value)
              .join(", ")}`,
      onDeleteClick: () => {
        dispatch(resetFilter("negotiableOptions"));
        dispatch(setFiltersUpdated(true));
      },
      active: checkedNegotiableOptions.length !== filters.saved.negotiableOptions.length,
    },
  ];

  useEffect(() => {
    return () => dispatch(resetFilters());
  }, []);

  return (
    <div className="home">
      <div className="sidebar-and-grid">
        {filtersSidebarToggled && (
          <>
            <FiltersSidebar allFiltersDisabled={false} totalListings={totalListings} />
            {windowSize.width <= 625 && (
              <ModalOverlay
                zIndex={5}
                onClick={() =>
                  dispatch(toggleModal({ key: "filtersSidebar", value: false }))
                }
              />
            )}
          </>
        )}
        <div
          className={`${
            windowSize.width > 625 && filtersSidebarToggled ? "has-sidebar-margin" : ""
          } listings-section`}
        >
          <div className="listings-controls">
            <div className="view-selector">
              {["Overview", "Grid", "List"].map((viewOption) => (
                <button
                  onClick={() => {
                    localStorage.setItem("pbmrkt_view_layout", viewOption);
                    dispatch(setViewLayout(viewOption));
                  }}
                  className={`view-option ${viewOption == view.layout ? "selected" : ""}`}
                  key={viewOption}
                >
                  {viewOption}
                </button>
              ))}
            </div>
            {view != "Overview" && (
              <div className="control-group sort">
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
                <SortIcon />
              </div>
            )}
          </div>
          {filterTags.filter((filter) => filter.active).length >= 1 && (
            <FilterTags filterTags={filterTags} />
          )}

          {view.type === "For Sale" ? (
            <ForSaleViews sort={sort} setTotalListings={setTotalListings} />
          ) : view.type === "Wanted" ? (
            <WantedViews sort={sort} setTotalListings={setTotalListings} />
          ) : (
            false
          )}
        </div>
      </div>
      {categorySelectorModalToggled && (
        <CategorySelectorModal
          categories={filters.draft.categories}
          setCategories={setCategories}
          handleCategoryClick={(category) => {
            if (category.is_folder) {
              dispatch(
                setFilters({
                  ...filters,
                  draft: {
                    ...filters.draft,
                    categories: toggleCategoryFolder(category, filters.draft.categories),
                  },
                })
              );
            } else {
              dispatch(
                setFilters({
                  ...filters,
                  draft: {
                    ...filters.draft,
                    category:
                      category.id == filters.draft.category?.id
                        ? null
                        : category.checked
                        ? null
                        : category,
                    categories: setCategoryChecked(category, filters.draft.categories),
                  },
                })
              );
            }
          }}
          handleModalClick={() =>
            dispatch(
              setFilters({
                ...filters,
                draft: {
                  ...filters.draft,
                  category: filters.saved.category,
                  categories: filters.saved.categories,
                },
              })
            )
          }
          handleApply={handleCategorySelectorApply}
          applyDisabled={
            !filters.draft.category ||
            filters.draft.category?.id == filters.saved.category?.id
          }
          handleExpandAll={() => {
            dispatch(
              setFilters({
                ...filters,
                draft: {
                  ...filters.draft,
                  categories: expandAllCategoryFolders(categories),
                },
              })
            );
          }}
          handleCollapseAll={() =>
            dispatch(
              setFilters({
                ...filters,
                draft: {
                  ...filters.draft,
                  categories: collapseAllCategoryFolders(categories),
                },
              })
            )
          }
          zIndex={9}
          showResultNumbers={true}
        />
      )}
    </div>
  );
}
