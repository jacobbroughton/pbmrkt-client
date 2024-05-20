import { createSlice } from "@reduxjs/toolkit";

const search = createSlice({
  name: "search",
  initialState: {
    draftSearchValue: "",
    savedSearchValue: "",
  },
  reducers: {
    setDraftSearchValue: (state, { payload }) => {
      return {
        ...state,
        draftSearchValue: payload,
      };
    },
    setSavedSearchValue: (state, { payload }) => {
      return {
        ...state,
        savedSearchValue: payload,
      };
    },
  },
});

export const { setDraftSearchValue, setSavedSearchValue } = search.actions;
export default search.reducer;
