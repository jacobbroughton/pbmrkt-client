import { useLocation } from "react-router-dom";
import { Listings } from "../../pages/Home/Home";
import { Overview } from "../../pages/Overview/Overview";
import { CompleteProfileBanner } from "../../ui/CompleteProfileBanner/CompleteProfileBanner";
import { SortSelect } from "../../ui/SortSelect/SortSelect";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useWindowSize } from "../../../utils/useWindowSize";
import { setDraftSearchValue, setSavedSearchValue } from "../../../redux/search";
import { setFlag } from "../../../redux/flags";
import {
  resetFilter,
  resetFilters,
  setFilters,
  setFiltersUpdated,
} from "../../../redux/filters";
import {
  getCheckedOps,
  isOnMobile,
  nestItemCategories,
} from "../../../utils/usefulFunctions";
import { toggleModal } from "../../../redux/modals";
import { setOverviewCategories } from "../../../redux/overviewCategories";
import { FilterTags } from "../../ui/FilterTags/FilterTags";
import { Tabs } from "../../ui/Tabs/Tabs";
import { setViewLayout, setViewType } from "../../../redux/view";
import { ErrorBanner } from "../../ui/ErrorBanner/ErrorBanner";
import PageTitle from "../../ui/PageTitle/PageTitle";
import { ModalOverlay } from "../../ui/ModalOverlay/ModalOverlay";
import { FiltersSidebar } from "../../ui/FiltersSidebar/FiltersSidebar";
import { MobileSearchBar } from "../../ui/MobileSearchBar/MobileSearchBar";
import { useSearchParams } from "../../../hooks/useSearchParams";
import "./ListingsLayout.css"

export const ListingsLayout = () => {
  const [totalListings, setTotalListings] = useState(null);
  const [sort, setSort] = useState("Date (New-Old)");
  const filters = useSelector((state) => state.filters);
  const view = useSelector((state) => state.view);
  const filtersSidebarToggled = useSelector(
    (state) => state.modals.filtersSidebarToggled
  );
  const { user } = useSelector((state) => state.auth);
  const { savedSearchValue } = useSelector((state) => state.search);
  const location = useLocation();
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const [windowSize] = useWindowSize();
  const [sidebarNeedsUpdate, setSidebarNeedsUpdate] = useState(windowSize.width > 625);
  const { addSearchParams } = useSearchParams();

  const filterTags = [
    {
      label: `Search:`,
      value: `${savedSearchValue}`,
      onDeleteClick: () => {
        dispatch(setDraftSearchValue(""));
        dispatch(setSavedSearchValue(""));
        dispatch(setFlag({ key: "searchedListingsNeedUpdate", value: true }));
        // dispatch(setFiltersUpdated(true));
      },
      active: savedSearchValue != "",
    },
    {
      label: `Category`,
      value: filters.saved[view.type].category?.plural_name,
      onDeleteClick: () => {
        dispatch(resetFilter({ filterKey: "category", viewType: view.type }));
        dispatch(setFiltersUpdated(true));
        // setCategories(initialCategories);
      },
      active: filters.saved[view.type].category,
    },
    {
      label: "State",
      value: filters.saved[view.type].state,
      onDeleteClick: () => {
        dispatch(resetFilter({ filterKey: "state", viewType: view.type }));
        dispatch(setFiltersUpdated(true));
      },
      active: filters.saved[view.type].state != "All",
    },
    {
      label: `City`,
      value: filters.saved[view.type].city,
      onDeleteClick: () => {
        dispatch(resetFilter({ filterKey: "city", viewType: view.type }));
        dispatch(setFiltersUpdated(true));
      },
      active: filters.saved[view.type].city != "All",
    },
  ];

  if (view.type === "Wanted") {
    filterTags.push({
      label: "Budget Range",
      value: filters.saved[view.type].budgetOptions.find((op) => op.checked).value,
      onDeleteClick: () => {
        dispatch(resetFilter({ filterKey: "budgetOptions", viewType: view.type }));
        dispatch(setFiltersUpdated(true));
      },
      active: !filters.saved[view.type].budgetOptions.find((op) => op.id == 0).checked,
    });
  } else if (view.type === "For Sale") {
    const checkedConditionOptions =
      filters.saved["For Sale"].conditionOptions?.filter((option) => option.checked) ||
      [];

    const checkedShippingOptions =
      filters.saved["For Sale"].shippingOptions?.filter((option) => option.checked) || [];

    const checkedTradeOptions =
      filters.saved["For Sale"].tradeOptions?.filter((option) => option.checked) || [];

    const checkedNegotiableOptions =
      filters.saved["For Sale"].negotiableOptions?.filter((option) => option.checked) ||
      [];

    filterTags.push(
      {
        label: "Budget Range",
        value: filters.saved["For Sale"].priceOptions.find((op) => op.checked).value,
        onDeleteClick: () => {
          dispatch(resetFilter({ filterKey: "priceOptions", viewType: "For Sale" }));
          dispatch(setFiltersUpdated(true));
        },
        active: !filters.saved["For Sale"].priceOptions.find((op) => op.id == 0).checked,
      },
      {
        label: `Condition`,
        value:
          checkedConditionOptions.length == 0
            ? "Conditions: N/A"
            : `${getCheckedOps(filters.saved["For Sale"].conditionOptions).join(", ")}`,
        onDeleteClick: () => {
          dispatch(resetFilter({ filterKey: "conditionOptions", viewType: "For Sale" }));
          dispatch(setFiltersUpdated(true));
        },
        active:
          // checkedConditionOptions.length >= 1 &&
          checkedConditionOptions.length !==
          filters.saved["For Sale"].conditionOptions.length,
      },
      {
        label: `Shipping`,
        value:
          checkedShippingOptions.length == 0
            ? "Shipping: N/A"
            : `${getCheckedOps(filters.saved["For Sale"].shippingOptions).join(", ")}`,
        onDeleteClick: () => {
          dispatch(resetFilter({ filterKey: "shippingOptions", viewType: "For Sale" }));
          dispatch(setFiltersUpdated(true));
        },
        active:
          checkedShippingOptions.length !==
          filters.saved["For Sale"].shippingOptions.length,
      },
      {
        label: `Trades`,
        value:
          checkedTradeOptions.length == 0
            ? "Trades: N/A"
            : `${getCheckedOps(filters.saved["For Sale"].tradeOptions).join(", ")}`,
        onDeleteClick: () => {
          dispatch(resetFilter({ filterKey: "tradeOptions", viewType: "For Sale" }));
          dispatch(setFiltersUpdated(true));
        },
        active:
          checkedTradeOptions.length !== filters.saved["For Sale"].tradeOptions.length,
      },
      {
        label: `Negotiability`,
        value:
          checkedNegotiableOptions.length == 0
            ? "Negotiable: N/A"
            : `${getCheckedOps(filters.saved["For Sale"].negotiableOptions).join(", ")}`,
        onDeleteClick: () => {
          dispatch(resetFilter({ filterKey: "negotiableOptions", viewType: "For Sale" }));
          dispatch(setFiltersUpdated(true));
        },
        active:
          checkedNegotiableOptions.length !==
          filters.saved["For Sale"].negotiableOptions.length,
      }
    );
  }

  async function getItemCategories() {
    try {
      const response = await fetch("http://localhost:4000/get-item-categories");

      if (!response.ok) throw new Error("Something happened get-item-categories");

      const { data: itemCategories } = await response.json();

      if (!itemCategories || !itemCategories.length === 0)
        throw new Error("No item categories were fetched");

      const nestedItemCategories = nestItemCategories(itemCategories, null);

      dispatch(
        setOverviewCategories({ flat: itemCategories, nested: nestedItemCategories })
      );

      dispatch(
        setFilters({
          ...filters,
          saved: {
            ...filters.saved,
            ["Wanted"]: {
              ...filters.saved["Wanted"],
              categories: nestedItemCategories,
            },
            ["For Sale"]: {
              ...filters.saved["For Sale"],
              categories: nestedItemCategories,
            },
          },
          draft: {
            ...filters.draft,
            ["Wanted"]: {
              ...filters.draft["Wanted"],
              categories: nestedItemCategories,
            },
            ["For Sale"]: {
              ...filters.draft["For Sale"],
              categories: nestedItemCategories,
            },
          },
          filtersUpdated: false,
        })
      );
    } catch (error) {
      console.error(error);
      setError(error);
    }
  }

  useEffect(() => {
    getItemCategories();
  }, [sort]);

  useEffect(() => {
    addSearchParams([
      ["view-type", view.type.toLowerCase().split(" ").join("-")],
      // ["view-layout", view.layout.toLowerCase().split(" ").join("-")],
    ]);
    return () => dispatch(resetFilters());
  }, []);

  useEffect(() => {
    addSearchParams([
      ["view-type", view.type.toLowerCase().split(" ").join("-")],
      // ["view-layout", view.layout.toLowerCase().split(" ").join("-")],
    ]);

    if (windowSize.width < 625)
      dispatch(toggleModal({ key: "filtersSidebar", value: false }));

    if (view.layout == "Overview" && filters.filtersUpdated) {
      getItemCategories();
    }

    return () => dispatch(resetFilters());
  }, []);

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

  return (
    <main className="listings-layout">
      <PageTitle title={`Overview - ${view.type} - ${view.layout}`} />
      {error && (
        <ErrorBanner
          error={error.toString()}
          handleCloseBanner={() => setError(null)}
          hasMargin={true}
        />
      )}
      {isOnMobile() ? (
        <div className="mobile-page-header">
          <h1>PBMRKT</h1>
          {isOnMobile() ? <MobileSearchBar /> : false}
        </div>
      ) : (
        false
      )}
      <div className="sidebar-and-grid">
        {filtersSidebarToggled && (
          <>
            <FiltersSidebar
              categorySelectorVisible={false}
              allFiltersDisabled={false}
              totalListings={totalListings}
            />
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
          <div className="listing-controls">
            <div className="view-settings">
              {isOnMobile() ? (
                <Tabs
                  tabs={[
                    { label: "Overview", url: "/overview" },
                    { label: "Grid", url: "listings?layout=grid" },
                    { label: "List", url: "listings?layout=grid" },
                  ]}
                  isSelected={(selectedLabel) => selectedLabel == view.type}
                  onClick={(option) => {
                    localStorage.setItem("pbmrkt_view_type", option.label);
                    dispatch(setViewType(option.label));

                    addSearchParams([["view-type", option.class]]);
                  }}
                />
              ) : (
                false
              )}
              <Tabs
                tabs={[
                  { label: "Overview", url: "/overview" },
                  { label: "Grid", url: "/listings?layout=grid" },
                  { label: "List", url: "/listings?layout=list" },
                ]}
                isSelected={(selectedLabel) => selectedLabel === "Overview"}
                onClick={(option) => {
                  const optionValue = option.label;
                  if (optionValue === "Overview" && filters.saved[view.type].category)
                    dispatch(
                      setFilters({
                        ...filters,
                        saved: {
                          ...filters.saved,
                          [view.type]: {
                            ...filters.saved[view.type],
                            category: null,
                          },
                        },
                      })
                    );
                  localStorage.setItem("pbmrkt_view_layout", optionValue);
                  dispatch(setViewLayout(optionValue));
                  // addSearchParams([["view-layout", optionValue.toLowerCase()]]);
                }}
              />
            </div>
            {view.layout != "Overview" && <SortSelect sort={sort} setSort={setSort} />}
          </div>
          {filterTags.filter((filter) => filter.active).length >= 1 && (
            <FilterTags filterTags={filterTags} />
          )}
          {user && !user.eligible_to_sell && <CompleteProfileBanner />}
          {location.pathname === "/listings" ? (
            <Listings />
          ) : location.pathname === "/overview" ? (
            <Overview />
          ) : (
            <p>404 page not found</p>
          )}
        </div>
      </div>
    </main>
  );
};
