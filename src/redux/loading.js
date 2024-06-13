import { createSlice } from "@reduxjs/toolkit";

const loadingSlice = createSlice({
  name: "loading",
  initialState: {
    logoutLoading: false,
  },
  reducers: {
    setLogoutLoading: (state, { payload }) => {
      return {
        logoutLoading: payload,
      };
    },
  },
});

export const { setLogoutLoading } = loadingSlice.actions;
export default loadingSlice.reducer;
