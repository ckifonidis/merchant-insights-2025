import { configureStore } from '@reduxjs/toolkit';
import analyticsReducer from './slices/analyticsSlice.js';
import filtersReducer from './slices/filtersSlice.js';

// Configure the store with middleware
export const store = configureStore({
  reducer: {
    analytics: analyticsReducer,
    filters: filtersReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serializable check
        ignoredActions: ['persist/PERSIST'],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['analytics.lastUpdated']
      }
    }),
  devTools: process.env.NODE_ENV !== 'production'
});

// Types for TypeScript (if needed later, convert this file to .ts)
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

export default store;