import { createSlice } from "@reduxjs/toolkit";

const initialFilters = {
  brand: "",
  model: "",
  minPrice: 0,
  maxPrice: null,
  city: "All",
  state: "All",
  priceOptions: [
    {id: 0, value: "$0 - $50"},
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
  },
});

export const { setFilters, setFiltersUpdated } = filtersSlice.actions;
export default filtersSlice.reducer;
