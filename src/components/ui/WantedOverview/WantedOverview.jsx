import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFilters, setFiltersUpdated } from "../../../redux/filters";
import { setViewLayout } from "../../../redux/view";
import { supabase } from "../../../utils/supabase";
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
  const [viewAllCount, setListingsViewAllCount] = useState(0);

  async function getItemCategoryResultsCount() {
    try {
      setSubsequentlyLoading(true);

      const wantedFilters = filters.saved["Wanted"];

      const { data, error } = await supabase.rpc(
        "get_wanted_item_category_result_counts",
        {
          p_search_value: savedSearchValue,
          p_min_budget: wantedFilters.minPrice || 0,
          p_max_budget: wantedFilters.maxPrice,
          p_shipping_ok: true,
          p_seller_id: null,
          p_state: wantedFilters.state == "All" ? null : wantedFilters.state,
          p_city: wantedFilters.city == "All" ? null : wantedFilters.city,
          p_category_id: wantedFilters.category?.id || null,
        }
      );

      if (error) throw error.message;

      const hashedData = {};

      for (let i = 0; i < data.length; i++) {
        hashedData[data[i].id] = data[i];
      }

      dispatch(addCountsToOverviewCategories(hashedData));

      const params = {
        p_search_value: savedSearchValue,
        p_seller_id: null,
        p_city: wantedFilters.city == "All" ? null : wantedFilters.city,
        p_state: wantedFilters.state == "All" ? null : wantedFilters.state,
        p_category_id: wantedFilters.category?.id || null,
        p_min_budget: wantedFilters.minPrice || 0,
        p_max_budget: wantedFilters.maxPrice,
        p_shipping_ok: true,
      };

      const { data: data2, error: error2 } = await supabase.rpc(
        "get_view_all_wanted_count",
        params
      );

      if (error2) throw error2.message;

      setListingsViewAllCount(data2[0].num_results);
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
