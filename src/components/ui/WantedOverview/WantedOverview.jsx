import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFilters, setFiltersUpdated } from "../../../redux/filters";
import { setViewLayout } from "../../../redux/view";
import { nestItemCategoriesExperimental } from "../../../utils/usefulFunctions";
import { SkeletonsOverview } from "../SkeletonsOverview/SkeletonsOverview";
import { addCountsToOverviewCategories } from "../../../redux/overviewCategories";
import "./WantedOverview.css";

export const WantedOverview = () => {
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.filters);
  const { savedSearchValue } = useSelector((state) => state.search);
  const overviewCategories = useSelector((state) => state.overviewCategories);
  const [error, setError] = useState();
  const [initiallyLoading, setInitiallyLoading] = useState(true); // initial load and between tabs currently
  const [subsequentlyLoading, setSubsequentlyLoading] = useState(false); // updating filters
  const [viewAllCount, setViewAllCount] = useState(0);

  async function getItemCategoryResultsCount() {
    try {
      setSubsequentlyLoading(true);

      const wantedFilters = filters.saved["Wanted"];
      const urlSearchParams = new URLSearchParams({
        search_value: savedSearchValue,
        min_budget: wantedFilters.minPrice || 0,
        max_budget: wantedFilters.maxPrice,
        shipping_ok: true,
        seller_id: null,
        state: wantedFilters.state == "All" ? null : wantedFilters.state,
        city: wantedFilters.city == "All" ? null : wantedFilters.city,
        category_id: wantedFilters.category?.id || null,
      }).toString();

      const response = await fetch(
        `http://localhost:4000/get-wanted-item-category-result-counts?${urlSearchParams}`
      );

      if (!response.ok)
        throw new Error("Something happened at get-wanted-item-category-result-counts");

      const { data } = await response.json();

      console.log("get-wanted-item-category-result-counts", data);

      const hashedData = {};

      for (let i = 0; i < data.length; i++) {
        hashedData[data[i].id] = data[i];
      }

      console.log("hashedData:", hashedData);

      if (hashedData === {}) {
        throw new Error("Empty hashedData");
      }

      dispatch(addCountsToOverviewCategories(hashedData));

      console.log("wantedFilters: ", wantedFilters)

      const urlSearchParams2 = new URLSearchParams({
        search_value: savedSearchValue,
        seller_id: null,
        city: wantedFilters.city == "All" ? null : wantedFilters.city,
        state: wantedFilters.state == "All" ? null : wantedFilters.state,
        category_id: wantedFilters.category?.id || null,
        min_budget: wantedFilters.minBudget || 0,
        max_budget: wantedFilters.maxBudget,
        shipping_ok: true,
      }).toString();

      const response2 = await fetch(
        `http://localhost:4000/get-view-all-wanted-count?${urlSearchParams2}`
      );

      if (!response.ok)
        throw new Error("Something happened at get-view-all-wanted-count");

      const { data: data2 } = await response2.json();

      console.log(data2);

      setViewAllCount(data2[0].num_results);
    } catch (error) {
      console.error(error);
      setError(error.toString());
    }

    setSubsequentlyLoading(false);
    setInitiallyLoading(false);
    // dispatch(setFiltersUpdated(false));
  }

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
    </div>
  );
};

const OverviewOptionList = ({ options, level, loading }) => {
  const dispatch = useDispatch();

  const filters = useSelector((state) => state.filters);

  function handleCategoryClick(category) {
    try {
      dispatch(
        setFilters({
          ...filters,
          saved: {
            ...filters.saved,
            ["Wanted"]: {
              ...filters.saved["Wanted"],
              categories: options,
              category: category,
            },
          },
        })
      );
      dispatch(setFiltersUpdated(true));
      dispatch(setViewLayout("Grid"));
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <ul className={`overview-option-list tier-${level + 1}`}>
      {options?.map((category, id) => {
        let newLevel = level + 2;
        return (
          <li
            key={id}
            className={`${category.children.length >= 1 ? "has-children" : ""}`}
          >
            {category.is_folder ? (
              <p className="label">{category.plural_name}</p>
            ) : (
              <button
                className="link-button"
                onClick={() => handleCategoryClick(category)}
                id={id}
              >
                {category.plural_name}{" "}
                <span>
                  {loading ? (
                    <div className="loading-result-number"></div>
                  ) : (
                    `(${category.num_results || 0})`
                  )}
                </span>
              </button>
            )}
            {category.children.length >= 1 && (
              <OverviewOptionList
                options={category.children}
                level={newLevel}
                loading={loading}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
};
