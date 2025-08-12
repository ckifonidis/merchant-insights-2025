import { configureStore } from '@reduxjs/toolkit';
import filtersReducer from './slices/filtersSlice';
import dataReducer from './slices/dataSlice';
import userConfigReducer from './slices/userConfigSlice';
import authReducer from './slices/authSlice';

// Configure the store with middleware
export const store = configureStore({
  reducer: {
    // Core slices - simplified structure
    filters: filtersReducer,
    data: dataReducer,
    userConfig: userConfigReducer,
    auth: authReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serializable check
        ignoredActions: ['persist/PERSIST'],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['data.meta.lastUpdated']
      }
    }),
  devTools: process.env.NODE_ENV !== 'production'
});

// TypeScript types for Redux
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;