import { createSlice } from "@reduxjs/toolkit";

const viewSlice = createSlice({
  name: "view",
  initialState: localStorage.getItem('pbmrkt_view') || 'Grid',
  reducers: {
    setView: (state, { payload }) => {
      return payload;
    },
  },
});

export default viewSlice.reducer;
export const { setView } = viewSlice.actions;
