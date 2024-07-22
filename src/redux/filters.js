import { createSlice } from "@reduxjs/toolkit";
import { resetCategories } from "../utils/usefulFunctions";

const initialFilters = {
  brand: "",
  model: "",
  minPrice: 0,
  maxPrice: null,
  city: "All",
  state: "All",
  category: null,
  priceOptions: [
    { id: 0, value: "$0+ (Any Price)", minValue: 0, maxValue: null, checked: true },
    { id: 1, value: "$0 - $50", minValue: 0, maxValue: 50, checked: false },
    { id: 2, value: "$50 - $100", minValue: 50, maxValue: 100, checked: false },
    { id: 3, value: "$100 - $250", minValue: 100, maxValue: 250, checked: false },
    { id: 4, value: "$250 - $500", minValue: 250, maxValue: 500, checked: false },
    { id: 5, value: "$500 - $1000", minValue: 500, maxValue: 1000, checked: false },
    { id: 6, value: "$1000 - $1500", minValue: 1000, maxValue: 1500, checked: false },
    { id: 7, value: "$1500+", minValue: 1500, maxValue: null, checked: false },
  ],
  conditionOptions: [
    // { id: 0, value: "All", checked: true },
    { id: 0, value: "Brand New", checked: true },
    { id: 1, value: "Like New", checked: true },
    { id: 2, value: "Used", checked: true },
    { id: 3, value: "Heavily Used", checked: true },
    { id: 4, value: "Not Functional", checked: true },
  ],
  shippingOptions: [
    // { id: 0, value: "All", checked: true },
    { id: 0, value: "Willing to Ship", checked: true },
    { id: 1, value: "Local Only", checked: true },
  ],
  tradeOptions: [
    // { id: 0, value: "All", checked: true },
    { id: 0, value: "Accepting Trades", checked: true },
    { id: 1, value: "No Trades", checked: true },
  ],
  negotiableOptions: [
    // { id: 0, value: "All", checked: true },
    { id: 0, value: "Firm", checked: true },
    { id: 1, value: "OBO/Negotiable", checked: true },
  ],
  categories: null,
};

const filtersSlice = createSlice({
  name: "filters",
  initialState: {
    initial: initialFilters,
    draft: initialFilters,
    saved: initialFilters,
    filtersUpdated: false,
  },
  reducers: {
    setFilters: (state, action) => {
      return action.payload;
    },
    setFiltersUpdated: (state, { payload }) => {
      return {
        ...state,
        filtersUpdated: payload,
      };
    },
    resetFilter: (state, { payload }) => {
      const filterKey = payload;


      if (filterKey == "category") {
        return {
          ...state,
          draft: {
            ...state.draft,
            category: initialFilters.category,
            categories: resetCategories(state.saved.categories),
          },
          saved: {
            ...state.saved,
            category: initialFilters.category,
            categories: resetCategories(state.saved.categories),
          },
        };
      }

      if (filterKey == "priceOptions") {
        return {
          ...state,
          draft: {
            ...state.draft,
            priceOptions: initialFilters.priceOptions,
            minPrice: initialFilters.minPrice,
            maxPrice: initialFilters.maxPrice,
          },
          saved: {
            ...state.saved,
            priceOptions: initialFilters.priceOptions,
            minPrice: initialFilters.minPrice,
            maxPrice: initialFilters.maxPrice,
          },
        };
      }

      return {
        ...state,
        draft: {
          ...state.draft,
          [filterKey]: initialFilters[filterKey],
        },
        saved: {
          ...state.saved,
          [filterKey]: initialFilters[filterKey],
        },
      };
    },
    resetFilters: (state) => {
      return {
        ...state,
        draft: initialFilters,
        saved: initialFilters,
        filtersUpdated: false,
      };
    },
    uncheckFilter: (state, { payload }) => {
      const filterKey = payload;


      // if (filterKey == "category") {
      //   return {
      //     ...state,
      //     draft: {
      //       ...state.draft,
      //       category: initialFilters.category,
      //       categories: resetCategories(state.saved.categories),
      //     },
      //     saved: {
      //       ...state.saved,
      //       category: initialFilters.category,
      //       categories: resetCategories(state.saved.categories),
      //     },
      //   };
      // }

      // if (filterKey == "priceOptions") {
      //   return {
      //     ...state,
      //     draft: {
      //       ...state.draft,
      //       priceOptions: initialFilters.priceOptions,
      //       minPrice: initialFilters.minPrice,
      //       maxPrice: initialFilters.maxPrice,
      //     },
      //     saved: {
      //       ...state.saved,
      //       priceOptions: initialFilters.priceOptions,
      //       minPrice: initialFilters.minPrice,
      //       maxPrice: initialFilters.maxPrice,
      //     },
      //   };
      // }

      return {
        ...state,
        draft: {
          ...state.draft,
          [filterKey]: state.draft[filterKey].map(option => ({
            ...option,
            checked: false
          })),
        },
        saved: {
          ...state.saved,
          [filterKey]: state.saved[filterKey].map(option => ({
            ...option,
            checked: false
          })),
        },
      };
    },
  },
});

export const { setFilters, setFiltersUpdated, resetFilters, resetFilter, uncheckFilter } =
  filtersSlice.actions;
export default filtersSlice.reducer;
