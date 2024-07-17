import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabase";
import { nestItemCategoriesExperimental } from "../../../utils/usefulFunctions";
import { Link } from "react-router-dom";
import "./Overview.css";
import { useDispatch, useSelector } from "react-redux";
import { setFilters, setFiltersUpdated } from "../../../redux/filters";
import { setView } from "../../../redux/view";
import { SkeletonsOverview } from "../SkeletonsOverview/SkeletonsOverview";

const Overview = ({ setLoading }) => {
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.filters);
  const { savedSearchValue } = useSelector((state) => state.search);
  const [error, setError] = useState();
  const [nestedCategories, setNestedCategories] = useState(null);
  const [flatCategories, setFlatCategories] = useState(null);
  const [initiallyLoading, setInitiallyLoading] = useState(true); // initial load and between tabs currently
  const [subsequentlyLoading, setSubsequentlyLoading] = useState(false); // updating filters
  const [viewAllCount, setViewAllCount] = useState(0)

  async function getCategories() {
    try {
      setSubsequentlyLoading(true);
      const { data, error } = await supabase.rpc("get_item_categories", {
        p_search_value: savedSearchValue,
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
        p_seller_id: null,
        p_city: filters.saved.city == "All" ? null : filters.saved.city,
        p_category_id: filters.saved.category?.id || null,
      });

      if (error) throw error.message;

      setFlatCategories(data);

      const { nestedCategories } = nestItemCategoriesExperimental(data, null);
      setNestedCategories(nestedCategories);

      const { data: data2, error: error2 } = await supabase.rpc("get_view_all_count", {
        p_search_value: savedSearchValue,
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
        p_seller_id: null,
        p_city: filters.saved.city == "All" ? null : filters.saved.city,
        p_category_id: filters.saved.category?.id || null,
      });

      if (error2) throw error2.message

      setViewAllCount(data2[0].num_results)

    } catch (error) {
      console.log(error);
      setError(error.toString());
    }

    setSubsequentlyLoading(false);
    setInitiallyLoading(false);
    // dispatch(setFiltersUpdated(false));
  }

  useEffect(() => {
    console.log("initial render");
    getCategories();
  }, []);

  useEffect(() => {
    if (filters.filtersUpdated) getCategories();
  }, [filters.filtersUpdated]);

  return (
    <div className="overview">
      {/* {initiallyLoading ? ( */}
      {initiallyLoading ? (
        <SkeletonsOverview />
      ) : (
        <>
          <button className="view-all" onClick={() => dispatch(setView('Grid'))}>
            View All <span>({viewAllCount})</span>
          </button>
          <ul className="overview-option-list main tier-0">
            {nestedCategories?.map((category) => {
              return (
                <li>
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
      {/* )} */}
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
            categories: options,
            category: category,
          },
        })
      );
      dispatch(setFiltersUpdated(true));
      dispatch(setView("Grid"));
    } catch (error) {
      console.log(error);
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
