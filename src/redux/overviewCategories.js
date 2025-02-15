import { createSlice, current } from "@reduxjs/toolkit";
import { nestItemCategoriesExperimental } from "../utils/usefulFunctions";

const overviewCategoriesSlice = createSlice({
  name: "overviewCategories",
  initialState: {
    initialCategories: [],
    nestedCategories: [],
    flatCategories: [],
  },
  reducers: {
    setOverviewCategories: (state, { payload }) => {
      const { flat, nested } = payload;
      return {
        initialNestedCategories: nested,
        nestedCategories: nested,
        flatCategories: flat,
      };
    },
    addCountsToOverviewCategories: (state, { payload }) => {


      const categoriesWithNumResults = state.flatCategories.map((flatCat) => ({
        ...flatCat,
        num_results: payload[flatCat.id].num_results,
      }));

      const { nestedCategories } = nestItemCategoriesExperimental(
        categoriesWithNumResults,
        null
      );

      return {
        ...state,
        nestedCategories,
        flatCategories: categoriesWithNumResults,
      };
    },
  },
});

export const { setOverviewCategories, addCountsToOverviewCategories } =
  overviewCategoriesSlice.actions;
export default overviewCategoriesSlice.reducer;
