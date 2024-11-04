import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth.ts";
import modalsReducer from "./modals.ts";
import filtersReducer from "./filters.js";
import flagsReducer from "./flags.ts";
import searchReducer from "./search.ts";
import loadingReducer from "./loading.js";
import viewReducer from "./view.ts";
import overviewCategoriesReducer from "./overviewCategories.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    modals: modalsReducer,
    filters: filtersReducer,
    flags: flagsReducer,
    search: searchReducer,
    loading: loadingReducer,
    view: viewReducer,
    overviewCategories: overviewCategoriesReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
