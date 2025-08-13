/**
 * API Response and Request Type Definitions
 * Enhanced with TypeScript literal types for type safety
 */

import type { 
  API_ENDPOINTS, 
  ANALYTICS_PROVIDER_IDS, 
  METRIC_IDS, 
  FILTER_IDS,
  SHOPPING_INTERESTS,
  AGE_GROUPS,
  GREEK_REGIONS,
  METRIC_CATEGORIES
} from '../data/apiSchema';

// Literal types from constants
export type MetricId = typeof METRIC_IDS[keyof typeof METRIC_IDS];
export type FilterId = typeof FILTER_IDS[keyof typeof FILTER_IDS];
export type EndpointPath = typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS];
export type ProviderId = typeof ANALYTICS_PROVIDER_IDS[keyof typeof ANALYTICS_PROVIDER_IDS];
export type ShoppingInterest = keyof typeof SHOPPING_INTERESTS;
export type AgeGroup = typeof AGE_GROUPS[number];
export type GreekRegion = typeof GREEK_REGIONS[number];

// Metric categorization
export type MetricCategory = 'scalar' | 'timeSeries' | 'categorical';
export type MetricType = 'currency' | 'count' | 'percentage';
export type EntityType = 'merchant' | 'competitor';

// Channel and gender types
export type Channel = 'physical' | 'ecommerce' | 'all';
export type Gender = 'm' | 'f' | 'a';
export type DataOrigin = 'own_data' | 'competition_comparison';

// Base API response structure
export interface BaseAPIResponse<T = any> {
  payload: T;
  requestId: string;
  status?: string;
  message?: string;
}

// API error response
export interface APIError {
  error: string;
  message: string;
  status: number;
  requestId?: string;
}

// Enhanced Analytics Request with type safety
export interface AnalyticsRequest {
  userID: string;
  startDate: string;
  endDate: string;
  providerId: ProviderId;
  metricIDs: MetricId[];
  filterValues: FilterValue[];
  metricParameters: Record<string, any>;
  merchantId: string;
}

// Type-safe filter value
export interface FilterValue {
  providerId: ProviderId;
  filterId: FilterId;
  value: string;
}

// Series data structures
export interface SeriesPoint {
  value1: string;  // Primary value (numeric as string)
  value2: string;  // Secondary value (date, category, etc.)
}

export interface SeriesValue {
  seriesID: string;
  seriesPoints: SeriesPoint[];
}

// Enhanced metric response
export interface MetricResponse {
  metricID: MetricId;
  percentageValue: boolean;
  scalarValue: string | null;
  seriesValues: SeriesValue[] | null;
  merchantId: string;
}

// Complete Analytics API response
export interface AnalyticsAPIResponse extends BaseAPIResponse {
  payload: {
    metrics: MetricResponse[];
  };
  exception?: any;
  messages?: any[];
  executionTime?: number;
}

// Import unified metric types - single source of truth
import type { EntityData, MetricData } from './metrics';

// Normalized metric data structure (post-processing)
export interface NormalizedMetricData {
  merchant?: EntityData;
  competitor?: EntityData;
}

// Re-export for backwards compatibility
export type { EntityData, MetricData } from './metrics';

// Common API request parameters
export interface APIRequestParams {
  userID: string;
  merchantId?: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  filters?: Record<string, any>;
}

// Time series data point
export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  yearOverYearChange?: number;
}

// Chart data structures
export interface ChartDataPoint {
  date: string;
  merchant: number;
  competitor?: number;
  merchantChange?: number;
  competitorChange?: number;
}

// Categorical data for charts
export interface CategoryDataPoint {
  category: string;
  merchant: number;
  competitor?: number;
  merchantAbsolute?: number;
  competitorAbsolute?: number;
}

// Enhanced metric configuration
export interface MetricConfig {
  id: MetricId;
  name: string;
  category: MetricCategory;
  dataType: MetricType;
  hasCompetition: boolean;
  yearOverYear: boolean;
  unit?: string;
  formatType?: 'currency' | 'number' | 'percentage';
}

// Date range interface
export interface DateRange {
  startDate: string;
  endDate: string;
}

// Year-over-year data structure
export interface YearOverYearData {
  current: any;
  previous: any;
  dateRanges?: {
    current: DateRange;
    previous: DateRange;
  };
  error?: string;
}

// Type guards for runtime validation
export const isMetricId = (value: string): value is MetricId => {
  return Object.values(METRIC_IDS).includes(value as MetricId);
};

export const isFilterId = (value: string): value is FilterId => {
  return Object.values(FILTER_IDS).includes(value as FilterId);
};

export const isValidEntityType = (value: string): value is EntityType => {
  return value === 'merchant' || value === 'competitor';
};

export const isValidMetricCategory = (value: string): value is MetricCategory => {
  return ['scalar', 'timeSeries', 'categorical'].includes(value);
};

// Enhanced type guards using the new categorized constants
export const isScalarMetric = (metricId: string): boolean => {
  return Object.values(METRIC_CATEGORIES.SCALAR).includes(metricId as any);
};

export const isTimeSeriesMetric = (metricId: string): boolean => {
  return Object.values(METRIC_CATEGORIES.TIME_SERIES).includes(metricId as any);
};

export const isCategoricalMetric = (metricId: string): boolean => {
  return Object.values(METRIC_CATEGORIES.CATEGORICAL).includes(metricId as any);
};

export const getMetricCategory = (metricId: string): MetricCategory | null => {
  if (isScalarMetric(metricId)) return 'scalar';
  if (isTimeSeriesMetric(metricId)) return 'timeSeries';
  if (isCategoricalMetric(metricId)) return 'categorical';
  return null;
};