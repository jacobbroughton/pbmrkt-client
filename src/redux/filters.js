import { createSlice } from "@reduxjs/toolkit";

const initialFilters = {
  brand: "",
  model: "",
  minPrice: 0,
  maxPrice: null,
  city: "All",
  state: "All",
  priceOptions: [
    { id: 0, value: "$0 - $50", minValue: 0, maxValue: 50, checked: true },
    { id: 1, value: "$50 - $100", minValue: 50, maxValue: 100, checked: true },
    { id: 2, value: "$100 - $250", minValue: 100, maxValue: 250, checked: true },
    { id: 3, value: "$250 - $500", minValue: 250, maxValue: 500, checked: true },
    { id: 4, value: "$500 - $1000", minValue: 500, maxValue: 1000, checked: true },
    { id: 5, value: "$1000 - $1500", minValue: 1000, maxValue: 1500, checked: true },
    { id: 6, value: "$1500+", minValue: 1500, maxValue: null, checked: true },
  ],
  conditionOptions: [
    { id: 0, value: "Brand New", checked: true },
    { id: 1, value: "Like New", checked: true },
    { id: 2, value: "Used", checked: true },
    { id: 3, value: "Heavily Used", checked: true },
    { id: 4, value: "Not Functional", checked: true },
  ],
  shippingOptions: [
    { id: 0, value: "Willing to Ship", checked: true },
    { id: 1, value: "Local Only", checked: true },
  ],
  tradeOptions: [
    { id: 0, value: "Accepting Trades", checked: true },
    { id: 1, value: "No Trades", checked: true },
  ],
  negotiableOptions: [
    { id: 0, value: "Firm", checked: true },
    { id: 1, value: "OBO/Negotiable", checked: true },
  ],
};

const filtersSlice = createSlice({
  name: "filters",
  initialState: {
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
    resetFilters: (state) => {
      return {
        ...state,
        draft: initialFilters,
      };
    },
  },
});

export const { setFilters, setFiltersUpdated, resetFilters } = filtersSlice.actions;
export default filtersSlice.reducer;
