import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./auth"
import modalsReducer from "./modals"
import filtersReducer from "./filters"
// import commentsReducer from "./comments"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    modals: modalsReducer,
    filters: filtersReducer
    // comments: commentsReducer,
  }
})

// Infer the `RootState` and `AppDispatch` types from the store itself
// export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
// export type AppDispatch = typeof store.dispatch;

