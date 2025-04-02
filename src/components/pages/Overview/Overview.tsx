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
import {
  addCountsToOverviewCategories,
  setOverviewCategories,
} from "../../../redux/overviewCategories.js";
import { setDraftSearchValue, setSavedSearchValue } from "../../../redux/search.ts";
import { setViewLayout, setViewType } from "../../../redux/view.ts";
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
import PageTitle from "../../ui/PageTitle/PageTitle.jsx";
import { SortSelect } from "../../ui/SortSelect/SortSelect.tsx";
import { ViewSelector } from "../../ui/ViewSelector/ViewSelector.jsx";
import { WantedViews } from "../../ui/WantedViews/WantedViews.jsx";
import "./Overview.css";
import { Tabs } from "../../ui/Tabs/Tabs";
import { ErrorBanner } from "../../ui/ErrorBanner/ErrorBanner.tsx";
import { CompleteProfileBanner } from "../../ui/CompleteProfileBanner/CompleteProfileBanner.jsx";
import { OverviewOptionList } from "../../ui/OverviewOptionList/OverviewOptionList.tsx";

export function Overview() {
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.filters);
  const view = useSelector((state) => state.view);
  const overviewCategories = useSelector((state) => state.overviewCategories);
  const { savedSearchValue } = useSelector((state) => state.search);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [initiallyLoading, setInitiallyLoading] = useState(true); // initial load and between tabs currently
  const [subsequentlyLoading, setSubsequentlyLoading] = useState(false); // updating filters
  const [viewAllCount, setViewAllCount] = useState(0);

  async function getItemCategoryResultsCount() {
    try {
      setSubsequentlyLoading(true);

      const forSaleFilters = filters.saved["For Sale"];

      const urlSearchParams = new URLSearchParams({
        search_value: savedSearchValue,
        min_price: forSaleFilters.minPrice || 0,
        max_price: forSaleFilters.maxPrice,
        state: forSaleFilters.state == "All" ? null : forSaleFilters.state,
        condition: getCheckedOps(forSaleFilters.conditionOptions),
        shipping: getCheckedOps(forSaleFilters.shippingOptions),
        trades: getCheckedOps(forSaleFilters.tradeOptions),
        negotiable: getCheckedOps(forSaleFilters.negotiableOptions),
        seller_id: null,
        city: forSaleFilters.city == "All" ? null : forSaleFilters.city,
        category_id: forSaleFilters.category?.id || null,
      }).toString();

      const response = await fetch(
        `http://localhost:4000/get-item-category-result-counts?${urlSearchParams}`
      );

      if (!response.ok)
        throw new Error("Something happened at get-item-category-result-counts");

      const { data } = await response.json();

      const categoryResultCounts = {};

      for (let i = 0; i < data.length; i++) {
        categoryResultCounts[data[i].id] = data[i];
      }

      console.log(overviewCategories);
      dispatch(addCountsToOverviewCategories(categoryResultCounts));

      const urlSearchParams2 = new URLSearchParams({
        search_value: savedSearchValue,
        seller_id: null,
        city: forSaleFilters.city == "All" ? null : forSaleFilters.city,
        state: forSaleFilters.state == "All" ? null : forSaleFilters.state,
        category_id: forSaleFilters.category?.id || null,
        min_price: forSaleFilters.minPrice || 0,
        max_price: forSaleFilters.maxPrice,
        condition: forSaleFilters.conditionOptions
          .filter((option) => option.checked)
          .map((option) => option.value),
        shipping: forSaleFilters.shippingOptions
          .filter((option) => option.checked)
          .map((option) => option.value),
        trades: forSaleFilters.tradeOptions
          .filter((option) => option.checked)
          .map((option) => option.value),
        negotiable: forSaleFilters.negotiableOptions
          .filter((option) => option.checked)
          .map((option) => option.value),
      }).toString();

      const response2 = await fetch(
        `http://localhost:4000/get-view-all-count?${urlSearchParams2}`
      );

      if (!response.ok) throw new Error("Something happened at get-view-all-count");

      const { data: data2 } = await response2.json();

      console.log(data2);

      setViewAllCount(data2[0].num_results);
    } catch (error) {
      console.error(error);
      setError(error.toString());
    } finally {
      dispatch(setFiltersUpdated(false));
    }

    setSubsequentlyLoading(false);
    setInitiallyLoading(false);
  }

  const { addSearchParams } = useSearchParams();
  const categorySelectorModalToggled = useSelector(
    (state) => state.modals.categorySelectorModalToggled
  );
  const filtersSidebarToggled = useSelector(
    (state) => state.modals.filtersSidebarToggled
  );
  const user = useSelector((state) => state.auth.user);
  const search = useSelector((state) => state.search);

  // const { searchParams } = useSearchParams();
  const [sort, setSort] = useState("Date (New-Old)");
  const [windowSize] = useWindowSize();
  const [totalListings, setTotalListings] = useState(null);

  useEffect(() => {
    getItemCategoryResultsCount();
  }, []);

  useEffect(() => {
    if (filters.filtersUpdated) getItemCategoryResultsCount();
  }, [filters.filtersUpdated]);

  return (
    <div className="overview">
      <>
        <button className="view-all" onClick={() => dispatch(setViewLayout("Grid"))}>
          <p>View All</p>{" "}
          {subsequentlyLoading ? (
            <div className="loading-result-number"></div>
          ) : (
            <span>({viewAllCount})</span>
          )}
        </button>
        <ul className="overview-option-list main tier-0">
          {overviewCategories.nestedCategories?.map((category) => {
            return (
              <li key={category.id}>
                <p className="label">{category.plural_name}</p>
                <OverviewOptionList
                  options={category.children}
                  level={0}
                  loading={subsequentlyLoading}
                />
              </li>
            );
          })}
        </ul>
      </>
      {/* )} */}
    </div>
  );
}
