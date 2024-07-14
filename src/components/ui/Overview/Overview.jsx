import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabase";
import { nestItemCategoriesExperimental } from "../../../utils/usefulFunctions";
import { Link } from "react-router-dom";
import "./Overview.css";

const Overview = () => {
  const [error, setError] = useState();
  const [nestedCategories, setNestedCategories] = useState(null);
  const [flatCategories, setFlatCategories] = useState(null);

  async function getCategories() {
    try {
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
  }

  useEffect(() => {
    getCategories();
  }, []);

  return (
    <div className="overview">
      <ul className="overview-option-list main">
        {nestedCategories?.map((category) => (
          <li>
            <p className="label">{category.plural_name}</p>
            <OverviewOptionList options={category.children} />
          </li>
        ))}
      </ul>
    </div>
  );
};
export default Overview;

const OverviewOptionList = ({ options }) => {
  function handleCategoryClick(category) {}

  return (
    <ul className="overview-option-list">
      {options?.map((category, id) => (
        <li key={id}> 
          {category.is_folder ? (
            <p className="label">
              {category.plural_name} ({category.num_results})
            </p>
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
          {category.children.length >= 1 && <OverviewOptionList options={category.children} />}
        </li>
      ))}
    </ul>
  );
};
