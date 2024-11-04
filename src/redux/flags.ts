import { createSlice } from "@reduxjs/toolkit";

const flagsSlice = createSlice({
  name: "flags",
  initialState: {
    sellerProfileNeedsUpdate: true,
    searchedListingsNeedUpdate: true,
  },
  reducers: {
    setFlag: (state, { payload }) => {
      return {
        ...state,
        [payload.key]: payload.value,
      };
    },
  },
});

export const { setFlag } = flagsSlice.actions;
export default flagsSlice.reducer;
