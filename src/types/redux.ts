/**
 * Redux Store Type Definitions
 */

import { store } from '../store';
import { AuthState, UserConfigState } from './auth';
import { AnalyticsDataState } from './analytics';
import { FiltersState } from './filters';

// Root state type inferred from store
export type RootState = ReturnType<typeof store.getState>;

// App dispatch type
export type AppDispatch = typeof store.dispatch;

// Individual slice states (re-exported for convenience)
export interface AppState {
  auth: AuthState;
  userConfig: UserConfigState;
  data: AnalyticsDataState;
  filters: FiltersState;
}

// Redux action payload types
export interface ActionPayload<T = any> {
  payload: T;
  requestId?: string;
  meta?: Record<string, any>;
}

// Async thunk state
export interface AsyncThunkState {
  loading: boolean;
  error: string | null;
  lastFetched: string | null;
}

// Fetch options for data requests
export interface FetchOptions {
  metricIDs: string[];
  filters?: Record<string, any>;
  yearOverYear?: boolean;
  options?: Record<string, any>;
}