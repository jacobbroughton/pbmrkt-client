import { createSlice } from "@reduxjs/toolkit";
import { resetCategories } from "../utils/usefulFunctions";

const initialFilters = {
  "For Sale": {
    minPrice: 0,
    maxPrice: null,
    city: "All",
    state: "All",
    category: null,
    priceOptions: [
      {
        id: 0,
        title: "$0+ (Any Price)",
        value: "$0+ (Any Price)",
        minValue: 0,
        maxValue: null,
        checked: true,
      },
      {
        id: 1,
        title: "$0 - $50",
        value: "$0 - $50",
        minValue: 0,
        maxValue: 50,
        checked: false,
      },
      {
        id: 2,
        title: "$50 - $100",
        value: "$50 - $100",
        minValue: 50,
        maxValue: 100,
        checked: false,
      },
      {
        id: 3,
        title: "$100 - $250",
        value: "$100 - $250",
        minValue: 100,
        maxValue: 250,
        checked: false,
      },
      {
        id: 4,
        title: "$250 - $500",
        value: "$250 - $500",
        minValue: 250,
        maxValue: 500,
        checked: false,
      },
      {
        id: 5,
        title: "$500 - $1000",
        value: "$500 - $1000",
        minValue: 500,
        maxValue: 1000,
        checked: false,
      },
      {
        id: 6,
        title: "$1000 - $1500",
        value: "$1000 - $1500",
        minValue: 1000,
        maxValue: 1500,
        checked: false,
      },
      {
        id: 7,
        title: "$1500+",
        value: "$1500+",
        minValue: 1500,
        maxValue: null,
        checked: false,
      },
    ],
    conditionOptions: [
      // { id: 0, title: '', value: "All", checked: true },
      { id: 0, title: "", value: "Brand New", checked: true },
      { id: 1, title: "", value: "Like New", checked: true },
      { id: 2, title: "", value: "Used", checked: true },
      { id: 3, title: "", value: "Heavily Used", checked: true },
      { id: 4, title: "", value: "Not Functional", checked: true },
    ],
    shippingOptions: [
      // { id: 0, title: '', value: "All", checked: true },
      { id: 0, title: "", value: "Willing to Ship", checked: true },
      { id: 1, title: "", value: "Local Only", checked: true },
    ],
    tradeOptions: [
      // { id: 0, title: '', value: "All", checked: true },
      { id: 0, title: "", value: "Accepting Trades", checked: true },
      { id: 1, title: "", value: "No Trades", checked: true },
    ],
    negotiableOptions: [
      // { id: 0, title: '', value: "All", checked: true },
      { id: 0, title: "", value: "Firm", checked: true },
      { id: 1, title: "", value: "OBO/Negotiable", checked: true },
    ],
    categories: null,
  },
  Wanted: {
    minBudget: 0,
    maxBudget: null,
    city: "All",
    state: "All",
    category: null,
    budgetOptions: [
      {
        id: 0,
        title: "$0+ (Any Budget)",
        value: "$0+ (Any Budget)",
        minValue: 0,
        maxValue: null,
        checked: true,
      },
      {
        id: 1,
        title: "$0 - $50",
        value: "$0 - $50",
        minValue: 0,
        maxValue: 50,
        checked: false,
      },
      {
        id: 2,
        title: "$50 - $100",
        value: "$50 - $100",
        minValue: 50,
        maxValue: 100,
        checked: false,
      },
      {
        id: 3,
        title: "$100 - $250",
        value: "$100 - $250",
        minValue: 100,
        maxValue: 250,
        checked: false,
      },
      {
        id: 4,
        title: "$250 - $500",
        value: "$250 - $500",
        minValue: 250,
        maxValue: 500,
        checked: false,
      },
      {
        id: 5,
        title: "$500 - $1000",
        value: "$500 - $1000",
        minValue: 500,
        maxValue: 1000,
        checked: false,
      },
      {
        id: 6,
        title: "$1000 - $1500",
        value: "$1000 - $1500",
        minValue: 1000,
        maxValue: 1500,
        checked: false,
      },
      {
        id: 7,
        title: "$1500+",
        value: "$1500+",
        minValue: 1500,
        maxValue: null,
        checked: false,
      },
    ],

    shippingOk: true,
    categories: null,
  },
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
      const { filterKey, viewType } = payload;

      if (filterKey == "category") {
        return {
          ...state,
          draft: {
            ...state.draft,
            [viewType]: {
              ...state.draft[viewType],
              category: initialFilters[viewType].category,
              categories: resetCategories(state.saved[viewType].categories),
            },
          },
          saved: {
            ...state.saved,
            [viewType]: {
              ...state.saved[viewType],
              category: initialFilters[viewType].category,
              categories: resetCategories(state.saved[viewType].categories),
            },
          },
        };
      }

      if (filterKey == "priceOptions" || filterKey === "budgetOptions") {
        const optionsKey = viewType === "Wanted" ? "budgetOptions" : "priceOptions";
        const minKey = viewType === "Wanted" ? "minBudget" : "minPrice";
        const maxKey = viewType === "Wanted" ? "maxBudget" : "maxPrice";

        return {
          ...state,
          draft: {
            ...state.draft,
            [viewType]: {
              ...state.draft[viewType],
              [optionsKey]: initialFilters[viewType][optionsKey],
              [minKey]: initialFilters[viewType][minKey],
              [maxKey]: initialFilters[viewType][maxKey],
            },
          },
          saved: {
            ...state.saved,
            [viewType]: {
              ...state.saved[viewType],
              [optionsKey]: initialFilters[viewType][optionsKey],
              [minKey]: initialFilters[viewType][minKey],
              [maxKey]: initialFilters[viewType][maxKey],
            },
          },
        };
      }

      return {
        ...state,
        draft: {
          ...state.draft,
          [viewType]: {
            ...state.draft[viewType],
            [filterKey]: initialFilters[viewType][filterKey],
          },
        },
        saved: {
          ...state.saved,
          [viewType]: {
            ...state.saved[viewType],
            [filterKey]: initialFilters[viewType][filterKey],
          },
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

      return {
        ...state,
        draft: {
          ...state.draft,
          [filterKey]: state.draft[filterKey].map((option) => ({
            ...option,
            checked: false,
          })),
        },
        saved: {
          ...state.saved,
          [filterKey]: state.saved[filterKey].map((option) => ({
            ...option,
            checked: false,
          })),
        },
      };
    },
  },
});

export const { setFilters, setFiltersUpdated, resetFilters, resetFilter, uncheckFilter } =
  filtersSlice.actions;
export default filtersSlice.reducer;
