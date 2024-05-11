import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    session: null,
    loading: true,
  },
  reducers: {
    setSession: (state, { payload }) => {
      return {
        ...state,
        session: payload,
        loading: false,
      };
    },
  },
});

export default authSlice.reducer;
export const { setSession } = authSlice.actions;
