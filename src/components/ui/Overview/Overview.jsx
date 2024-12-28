import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabase";
import {
  getCheckedOps,
  nestItemCategoriesExperimental,
} from "../../../utils/usefulFunctions";
import { Link } from "react-router-dom";
import "./Overview.css";
import { useDispatch, useSelector } from "react-redux";
import { setFilters, setFiltersUpdated } from "../../../redux/filters";
import { setViewLayout } from "../../../redux/view";
import { SkeletonsOverview } from "../SkeletonsOverview/SkeletonsOverview";
import { addCountsToOverviewCategories } from "../../../redux/overviewCategories";
import { StarIcon } from "../Icons/StarIcon";

const Overview = () => {
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.filters);
  const view = useSelector((state) => state.view);
  const overviewCategories = useSelector((state) => state.overviewCategories);
  const { savedSearchValue } = useSelector((state) => state.search);
  const [error, setError] = useState();
  const [nestedCategories, setNestedCategories] = useState(null);
  const [flatCategories, setFlatCategories] = useState(null);
  const [initiallyLoading, setInitiallyLoading] = useState(true); // initial load and between tabs currently
  const [subsequentlyLoading, setSubsequentlyLoading] = useState(false); // updating filters
  const [viewAllCount, setListingsViewAllCount] = useState(0);

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

      const hashedData = {};

      for (let i = 0; i < data.length; i++) {
        hashedData[data[i].id] = data[i];
      }

      dispatch(addCountsToOverviewCategories(hashedData));

      // setFlatCategories(data);

      // const { nestedCategories } = nestItemCategoriesExperimental(data, null);
      // setNestedCategories(nestedCategories);

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
        `http://localhost:4000/get-item-category-result-counts?${urlSearchParams2}`
      );

      if (!response.ok)
        throw new Error("Something happened at get-item-category-result-counts");

      const { data: data2 } = await response2.json();

      setListingsViewAllCount(data2[0].num_results);
    } catch (error) {
      console.error(error);
      setError(error.toString());
    }

    setSubsequentlyLoading(false);
    setInitiallyLoading(false);
  }

  useEffect(() => {
    getItemCategoryResultsCount();
  }, []);

  useEffect(() => {
    if (filters.filtersUpdated) getItemCategoryResultsCount();
  }, [filters.filtersUpdated]);

  // if (initiallyLoading) return <p>Yep initially loading</p>;

  return (
    <div className="overview">
      {/* {initiallyLoading ? (
        // {true ? (
        <SkeletonsOverview />
      ) : ( */}
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
