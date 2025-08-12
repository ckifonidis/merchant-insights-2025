/**
 * Analytics Data Type Definitions
 */

// Metric IDs used throughout the application
export type MetricId = 
  | 'total_revenue'
  | 'total_transactions'
  | 'avg_ticket_per_user'
  | 'avg_daily_revenue'
  | 'goformore_amount'
  | 'rewarded_amount'
  | 'redeemed_amount'
  | 'revenue_per_day'
  | 'transactions_per_day'
  | 'customers_per_day'
  | 'revenue_by_channel'
  | 'converted_customers_by_interest'
  | 'converted_customers_by_gender'
  | 'converted_customers_by_age'
  | 'total_customers'
  | 'new_customers'
  | 'returning_customers';

// Raw metric data structure from API
export interface RawMetricData {
  merchant: {
    current: Record<string, number | Record<string, number>>;
    previous: Record<string, number | Record<string, number>>;
  };
  competitor?: {
    current: Record<string, number | Record<string, number>>;
    previous: Record<string, number | Record<string, number>>;
  };
}

// Processed metric data for components
export interface ProcessedMetricData {
  merchant: {
    value: number;
    change: number;
    changeType: 'increase' | 'decrease' | 'neutral';
  };
  competitor?: {
    value: number;
    change: number;
    changeType: 'increase' | 'decrease' | 'neutral';
  };
  comparison?: {
    difference: number;
    performanceBetter: boolean;
  };
}

// Time series chart data point
export interface TimeSeriesPoint {
  date: string;
  merchant: number;
  competitor?: number;
  merchantChange?: number;
  competitorChange?: number;
}

// Categorical chart data point
export interface CategoricalDataPoint {
  category: string;
  merchant: number;
  competitor?: number;
  merchantAbsolute: number;
  competitorAbsolute?: number;
  percentage: number;
}

// Breakdown chart data (for pie/bar charts)
export interface BreakdownDataPoint {
  category: string;
  value: number;
  percentage: number;
  color?: string;
}

// Analytics data state
export interface AnalyticsDataState {
  // Raw metrics data keyed by MetricId
  metrics: Record<string, RawMetricData>;
  
  // Loading and error states
  loading: boolean;
  error: string | null;
  
  // Cache metadata
  lastFetched: string | null;
  cacheExpiry: string | null;
}

// Year-over-year calculation result
export interface YearOverYearResult {
  current: number;
  previous: number;
  change: number;
  changePercentage: number;
  changeType: 'increase' | 'decrease' | 'neutral';
}