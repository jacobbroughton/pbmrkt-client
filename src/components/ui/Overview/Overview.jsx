import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabase";
import { nestItemCategoriesExperimental } from "../../../utils/usefulFunctions";
import { Link } from "react-router-dom";
import "./Overview.css";
import { useDispatch, useSelector } from "react-redux";
import { setFilters, setFiltersUpdated } from "../../../redux/filters";
import { setView } from "../../../redux/view";
import { SkeletonsOverview } from "../SkeletonsOverview/SkeletonsOverview";

const Overview = ({ loading, setLoading }) => {
  const [error, setError] = useState();
  const [nestedCategories, setNestedCategories] = useState(null);
  const [flatCategories, setFlatCategories] = useState(null);

  async function getCategories() {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_item_categories");

      if (error) throw error.message;

      console.log("categories", data);
      setFlatCategories(data);

      const { nestedCategories, preSelectedCategory } = nestItemCategoriesExperimental(
        data,
        null
      );

      console.log({ nestedCategories, preSelectedCategory });
      setNestedCategories(nestedCategories);
    } catch (error) {
      console.log(error);
      setError(error.toString());
    }

    setLoading(false);
  }

  useEffect(() => {
    getCategories();
  }, []);

  return (
    <div className="overview">
      {loading ? (
        <SkeletonsOverview />
      ) : (
        <ul className="overview-option-list main tier-0">
          {nestedCategories?.map((category) => {
            return (
              <li>
                <p className="label">{category.plural_name}</p>
                <OverviewOptionList options={category.children} level={0} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
export default Overview;

const OverviewOptionList = ({ options, level }) => {
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
                  {category.num_results ? <span>({category.num_results})</span> : false}
                </button>
              )}
              {category.children.length >= 1 && (
                <OverviewOptionList options={category.children} level={newLevel} />
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
};
