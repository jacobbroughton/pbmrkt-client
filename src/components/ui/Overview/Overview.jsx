import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabase";
import { nestItemCategoriesExperimental } from "../../../utils/usefulFunctions";
import { Link } from "react-router-dom";
import "./Overview.css";
import { useDispatch, useSelector } from "react-redux";
import { setFilters, setFiltersUpdated } from "../../../redux/filters";
import { setViewLayout } from "../../../redux/view";
import { SkeletonsOverview } from "../SkeletonsOverview/SkeletonsOverview";

const Overview = () => {
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.filters);
  const view = useSelector((state) => state.view);
  const { savedSearchValue } = useSelector((state) => state.search);
  const [error, setError] = useState();
  const [nestedCategories, setNestedCategories] = useState(null);
  const [flatCategories, setFlatCategories] = useState(null);
  const [initiallyLoading, setInitiallyLoading] = useState(true); // initial load and between tabs currently
  const [subsequentlyLoading, setSubsequentlyLoading] = useState(false); // updating filters
  const [viewAllCount, setListingsViewAllCount] = useState(0);

  async function getCategories() {
    try {
      setSubsequentlyLoading(true);
      const { data, error } = await supabase.rpc("get_item_categories", {
        p_search_value: savedSearchValue,
        p_min_price: filters.saved["For Sale"].minPrice || 0,
        p_max_price: filters.saved["For Sale"].maxPrice,
        p_state:
          filters.saved["For Sale"].state == "All"
            ? null
            : filters.saved["For Sale"].state,
        p_condition: filters.saved["For Sale"].conditionOptions
          .filter((option) => option.checked)
          .map((option) => option.value),
        p_shipping: filters.saved["For Sale"].shippingOptions
          .filter((option) => option.checked)
          .map((option) => option.value),
        p_trades: filters.saved["For Sale"].tradeOptions
          .filter((option) => option.checked)
          .map((option) => option.value),
        p_negotiable: filters.saved["For Sale"].negotiableOptions
          .filter((option) => option.checked)
          .map((option) => option.value),
        p_seller_id: null,
        p_city:
          filters.saved["For Sale"].city == "All" ? null : filters.saved["For Sale"].city,
        p_category_id: filters.saved["For Sale"].category?.id || null,
      });

      if (error) throw error.message;

      setFlatCategories(data);

      const { nestedCategories } = nestItemCategoriesExperimental(data, null);
      setNestedCategories(nestedCategories);

      let params = {
        p_search_value: savedSearchValue,
        p_seller_id: null,
        p_city:
          filters.saved["For Sale"].city == "All" ? null : filters.saved["For Sale"].city,
        p_state:
          filters.saved["For Sale"].state == "All"
            ? null
            : filters.saved["For Sale"].state,
        p_category_id: filters.saved["For Sale"].category?.id || null,
        p_min_price: filters.saved["For Sale"].minPrice || 0,
        p_max_price: filters.saved["For Sale"].maxPrice,
        p_condition: filters.saved["For Sale"].conditionOptions
          .filter((option) => option.checked)
          .map((option) => option.value),
        p_shipping: filters.saved["For Sale"].shippingOptions
          .filter((option) => option.checked)
          .map((option) => option.value),
        p_trades: filters.saved["For Sale"].tradeOptions
          .filter((option) => option.checked)
          .map((option) => option.value),
        p_negotiable: filters.saved["For Sale"].negotiableOptions
          .filter((option) => option.checked)
          .map((option) => option.value),
      };

      const { data: data2, error: error2 } = await supabase.rpc(
        "get_view_all_count",
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
    getCategories();
  }, []);

  useEffect(() => {
    if (filters.filtersUpdated) getCategories();
  }, [filters.filtersUpdated]);

  return (
    <div className="overview">
      {initiallyLoading ? (
        // {true ? (
        <SkeletonsOverview />
      ) : (
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
            {nestedCategories?.map((category) => {
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
      )}
    </div>
  );
};
export default Overview;

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
            ["For Sale"]: {
              ...filters.saved["For Sale"],
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
    <>
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
    </>
  );
};
