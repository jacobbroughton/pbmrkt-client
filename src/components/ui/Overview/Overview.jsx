import { useEffect, useState } from "react";
import "./Overview.css";
import { supabase } from "../../../utils/supabase";
import { nestItemCategoriesExperimental } from "../../../utils/usefulFunctions";

const Overview = () => {
  const [error, setError] = useState();
  const [categories, setCategories] = useState(null)

  async function getCategories() {
    try {
      const { data, error } = await supabase.rpc("get_item_categories");

      if (error) throw error.message;

      console.log("categories", data);

      const { nestedCategories, preSelectedCategory } = nestItemCategoriesExperimental(
        data,
        null
      );

      console.log({ nestedCategories, preSelectedCategory });
      setCategories(nestedCategories)
    } catch (error) {
      console.log(error);
      setError(error.toString());
    }
  }

  useEffect(() => {
    getCategories()
  }, [])

  return <div>
   {categories?.map(category => <p>{category.value}</p>)}
  </div>;
};
export default Overview;
