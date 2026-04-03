import { configureStore, type Action, type ThunkAction } from "@reduxjs/toolkit";
import { selectionSlice } from "./slices/selectionSlice";
import { documentSlice } from "./slices/documentSlice";
import { uiSlice } from "./slices/uiSlice";

export function createStore() {
  return configureStore({
    reducer: {
      [documentSlice.reducerPath]: documentSlice.reducer,
      [selectionSlice.reducerPath]: selectionSlice.reducer,
      [uiSlice.reducerPath]: uiSlice.reducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredPaths: [],
          ignoredActions: []
        },
      }),
  });
}

export const store = createStore();

export type RootState = ReturnType<ReturnType<typeof createStore>["getState"]>;
export type AppDispatch = ReturnType<typeof createStore>["dispatch"];
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;