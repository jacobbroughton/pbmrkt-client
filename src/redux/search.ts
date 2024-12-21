import { createSlice } from "@reduxjs/toolkit";

const search = createSlice({
  name: "search",
  initialState: {
    draftSearchValue: "",
    savedSearchValue: "",
    searchBarToggled: false,
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
    setSearchBarToggled: (state, { payload }) => {
      return {
        ...state,
        searchBarToggled: payload,
      };
    },
  },
});

export const { setDraftSearchValue, setSavedSearchValue, setSearchBarToggled } =
  search.actions;
export default search.reducer;
