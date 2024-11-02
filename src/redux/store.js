import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth";
import modalsReducer from "./modals";
import filtersReducer from "./filters";
import flagsReducer from "./flags";
import searchReducer from "./search";
import loadingReducer from "./loading";
import viewReducer from "./view";
import overviewCategoriesReducer from "./overviewCategories";

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
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
