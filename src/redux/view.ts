import { createSlice } from "@reduxjs/toolkit";

const viewSlice = createSlice({
  name: "view",
  initialState: {
    type: localStorage.getItem("pbmrkt_view_type") || "For Sale",
    layout: localStorage.getItem("pbmrkt_view_layout") || "Grid",
  },
  reducers: {
    setViewType: (state, { payload }) => {
      return {
        ...state,
        type: payload,
      };
    },
    setViewLayout: (state, { payload }) => {
      return {
        ...state,
        layout: payload,
      };
    },
  },
});

export default viewSlice.reducer;
export const { setViewType, setViewLayout } = viewSlice.actions;
