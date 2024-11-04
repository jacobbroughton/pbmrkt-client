import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "../../../hooks/useSearchParams.ts";
import {
  resetFilter,
  resetFilters,
  setFilters,
  setFiltersUpdated,
} from "../../../redux/filters.js";
import { setFlag } from "../../../redux/flags.ts";
import { toggleModal } from "../../../redux/modals.ts";
import { setOverviewCategories } from "../../../redux/overviewCategories.js";
import { setDraftSearchValue, setSavedSearchValue } from "../../../redux/search.ts";
import { RootState } from "../../../redux/store.ts";
import { setViewLayout, setViewType } from "../../../redux/view.ts";
import { supabase } from "../../../utils/supabase.ts";
import {
  collapseAllCategoryFolders,
  expandAllCategoryFolders,
  getCheckedOps,
  isOnMobile,
  nestItemCategories,
  setCategoryChecked,
  toggleCategoryFolder,
} from "../../../utils/usefulFunctions.js";
import { useWindowSize } from "../../../utils/useWindowSize.js";
import { CategorySelectorModal } from "../../ui/CategorySelectorModal/CategorySelectorModal.jsx";
import { FiltersSidebar } from "../../ui/FiltersSidebar/FiltersSidebar.jsx";
import { FilterTags } from "../../ui/FilterTags/FilterTags.jsx";
import { ForSaleViews } from "../../ui/ForSaleViews/ForSaleViews.jsx";
import { MobileSearchBar } from "../../ui/MobileSearchBar/MobileSearchBar.jsx";
import { ModalOverlay } from "../../ui/ModalOverlay/ModalOverlay.jsx";
import { SortSelect } from "../../ui/SortSelect/SortSelect.tsx";
import { WantedViews } from "../../ui/WantedViews/WantedViews.jsx";
import "./Home.css";

export function Listings() {
  const dispatch = useDispatch();

  const categorySelectorModalToggled = useSelector(
    (state) => state.modals.categorySelectorModalToggled
  );
  const filtersSidebarToggled = useSelector(
    (state) => state.modals.filtersSidebarToggled
  );
  const view = useSelector((state) => state.view);
  const filters = useSelector((state) => state.filters);
  const search = useSelector((state) => state.search);

  const { searchParams, addSearchParam } = useSearchParams();
  const [sort, setSort] = useState("Date (New-Old)");
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

  useEffect(() => {
    const viewTypeFromSearchRaw = searchParams.get("view-type");
    const viewLayoutFromSearchRaw = searchParams.get("view-layout");

    const viewTypeFromSearch = viewTypeFromSearchRaw === "wanted" ? "Wanted" : "For Sale";
    const viewLayoutFromSearch =
      viewLayoutFromSearchRaw === "overview"
        ? "Overview"
        : viewLayoutFromSearchRaw === "grid"
        ? "Grid"
        : viewLayoutFromSearchRaw === "list"
        ? "List"
        : "Overview";

    if (viewTypeFromSearch !== view.type) dispatch(setViewType(viewTypeFromSearch));

    if (viewLayoutFromSearch !== view.layout)
      dispatch(setViewLayout(viewLayoutFromSearch));
  }, [searchParams.get("view-type"), searchParams.get("view-layout")]);

  // useEffect(() => {
  //   dispatch(
  //     setViewLayout(searchParams.get("view-type") === "wanted" ? "Wanted" : "For Sale")
  //   );
  // }, [searchParams.get("view-type")]);

  function handleCategorySelectorApply() {
    try {
      if (!filters.draft[view.type].category) throw "no category was selected";

      if (!filters.draft[view.type].category.is_folder) {
        dispatch(
          setFilters({
            ...filters,
            saved: {
              ...filters.saved,
              [view.type]: {
                ...filters.saved[view.type],
                categories: filters.draft[view.type].categories,
                category: filters.draft[view.type].category,
              },
            },
          })
        );
        dispatch(setFiltersUpdated(true));
        dispatch(toggleModal({ key: "categorySelectorModal", value: false }));
        if (view.layout == "Overview") dispatch(setViewLayout("Grid"));
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
    getItemCategories(view.type);
  }, [sort]);

  useEffect(() => {
    if (view.layout == "Overview" && filters.filtersUpdated) {
      getItemCategories(view.type);
    }
  }, []);

  async function getItemCategories(viewType) {
    try {
      const { data, error } = await supabase.rpc("get_item_categories");

      if (error) throw error.message;

      const nestedItemCategories = nestItemCategories(data, null);

      dispatch(setOverviewCategories({ flat: data, nested: nestedItemCategories }));

      dispatch(
        setFilters({
          ...filters,
          saved: {
            ...filters.saved,
            [viewType]: {
              ...filters.saved[viewType],
              categories: nestedItemCategories,
            },
          },
          draft: {
            ...filters.draft,
            [viewType]: {
              ...filters.draft[viewType],
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

  const filterTags = [
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
      filters.saved[view.type].conditionOptions?.filter((option) => option.checked) || [];

    const checkedShippingOptions =
      filters.saved[view.type].shippingOptions?.filter((option) => option.checked) || [];

    const checkedTradeOptions =
      filters.saved[view.type].tradeOptions?.filter((option) => option.checked) || [];

    const checkedNegotiableOptions =
      filters.saved[view.type].negotiableOptions?.filter((option) => option.checked) ||
      [];

    filterTags.push(
      {
        label: "Budget Range",
        value: filters.saved[view.type].priceOptions.find((op) => op.checked).value,
        onDeleteClick: () => {
          dispatch(resetFilter({ filterKey: "priceOptions", viewType: view.type }));
          dispatch(setFiltersUpdated(true));
        },
        active: !filters.saved[view.type].priceOptions.find((op) => op.id == 0).checked,
      },
      {
        label: `Condition`,
        value:
          checkedConditionOptions.length == 0
            ? "None"
            : `${getCheckedOps(filters.saved[view.type].conditionOptions).join(", ")}`,
        onDeleteClick: () => {
          dispatch(resetFilter({ filterKey: "conditionOptions", viewType: view.type }));
          dispatch(setFiltersUpdated(true));
        },
        active:
          // checkedConditionOptions.length >= 1 &&
          checkedConditionOptions.length !==
          filters.saved[view.type].conditionOptions.length,
      },
      {
        label: `Shipping`,
        value:
          checkedShippingOptions.length == 0
            ? "None"
            : `${getCheckedOps(filters.saved[view.type].shippingOptions).join(", ")}`,
        onDeleteClick: () => {
          dispatch(resetFilter({ filterKey: "shippingOptions", viewType: view.type }));
          dispatch(setFiltersUpdated(true));
        },
        active:
          checkedShippingOptions.length !==
          filters.saved[view.type].shippingOptions.length,
      },
      {
        label: `Trades`,
        value:
          checkedTradeOptions.length == 0
            ? "None"
            : `${getCheckedOps(filters.saved[view.type].tradeOptions).join(", ")}`,
        onDeleteClick: () => {
          dispatch(resetFilter({ filterKey: "tradeOptions", viewType: view.type }));
          dispatch(setFiltersUpdated(true));
        },
        active:
          checkedTradeOptions.length !== filters.saved[view.type].tradeOptions.length,
      },
      {
        label: `Negotiability`,
        value:
          checkedNegotiableOptions.length == 0
            ? "None"
            : `${getCheckedOps(filters.saved[view.type].negotiableOptions).join(", ")}`,
        onDeleteClick: () => {
          dispatch(resetFilter({ filterKey: "negotiableOptions", viewType: view.type }));
          dispatch(setFiltersUpdated(true));
        },
        active:
          checkedNegotiableOptions.length !==
          filters.saved[view.type].negotiableOptions.length,
      }
    );
  }

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
          {isOnMobile() ? <MobileSearchBar /> : false}
          <div className="listings-controls">
            <div className="view-selector">
              {["Overview", "Grid", "List"].map((viewOption) => (
                <button
                  onClick={() => {
                    localStorage.setItem("pbmrkt_view_layout", viewOption);
                    dispatch(setViewLayout(viewOption));
                    addSearchParam("view-layout", viewOption.toLowerCase());
                  }}
                  className={`view-option ${viewOption == view.layout ? "selected" : ""}`}
                  key={viewOption}
                >
                  {viewOption}
                </button>
              ))}
            </div>
            {view.layout != "Overview" && <SortSelect sort={sort} setSort={setSort} />}
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
          categories={filters.draft[view.type].categories}
          handleCategoryClick={(category) => {
            if (category.is_folder) {
              dispatch(
                setFilters({
                  ...filters,
                  draft: {
                    ...filters.draft,
                    [view.type]: {
                      ...filters.draft[view.type],
                      categories: toggleCategoryFolder(
                        category,
                        filters.draft[view.type].categories
                      ),
                    },
                  },
                })
              );
            } else {
              dispatch(
                setFilters({
                  ...filters,
                  draft: {
                    ...filters.draft,
                    [view.type]: {
                      ...filters.draft[view.type],
                      category:
                        category.id == filters.draft[view.type].category?.id
                          ? null
                          : category.checked
                          ? null
                          : category,
                      categories: setCategoryChecked(
                        category,
                        filters.draft[view.type].categories
                      ),
                    },
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
                  [view.type]: {
                    ...filters.draft[view.type],
                    category: filters.saved[view.type].category,
                    categories: filters.saved[view.type].categories,
                  },
                },
              })
            )
          }
          handleApply={handleCategorySelectorApply}
          applyDisabled={
            !filters.draft[view.type].category ||
            filters.draft[view.type].category?.id == filters.saved[view.type].category?.id
          }
          handleExpandAll={() => {
            dispatch(
              setFilters({
                ...filters,
                draft: {
                  ...filters.draft,
                  [view.type]: {
                    ...filters.draft[view.type],
                    categories: expandAllCategoryFolders(
                      filters.saved[view.type].categories
                    ),
                  },
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
                  [view.type]: {
                    ...filters.draft[view.type],
                    categories: collapseAllCategoryFolders(
                      filters.saved[view.type].categories
                    ),
                  },
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
