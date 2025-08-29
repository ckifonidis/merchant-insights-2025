/**
 * Base API Response Structure
 */
export interface ApiResponse<T = unknown> {
  payload: T;
  requestId: string;
  status?: string;
  message?: string;
  exception?: unknown;
  messages?: unknown[];
  executionTime?: number;
}

export type EntityType = 'merchant' | 'competitor';

/**
 * Entity data structure for normalized metrics
 */
export interface EntityData {
  current: number | Record<string, number> | Array<{ date: string; value: number }> | null;
  previous?: number | Record<string, number> | Array<{ date: string; value: number }> | null;
}

export interface MetricData {
  merchant?: EntityData;
  competitor?: EntityData;
}

export const METRICS = {
  // Scalar Metrics - Single Values
  SCALAR: {
    TOTAL_REVENUE: 'total_revenue',
    TOTAL_TRANSACTIONS: 'total_transactions',
    AVG_TICKET_PER_USER: 'avg_ticket_per_user',
    AVG_DAILY_REVENUE: 'avg_daily_revenue',
    TOTAL_CUSTOMERS: 'total_customers',
    GOFORMORE_AMOUNT: 'goformore_amount',
    REWARDED_AMOUNT: 'rewarded_amount',
    REDEEMED_AMOUNT: 'redeemed_amount',
    REWARDED_POINTS: 'rewarded_points',
    REDEEMED_POINTS: 'redeemed_points'
  },
  
  // Time Series Metrics - Data over time
  TIME_SERIES: {
    REVENUE_PER_DAY: 'revenue_per_day',
    TRANSACTIONS_PER_DAY: 'transactions_per_day',
    CUSTOMERS_PER_DAY: 'customers_per_day'
  },
  
  // Categorical Metrics - Breakdown by categories
  CATEGORICAL: {
    CONVERTED_CUSTOMERS_BY_GENDER: 'converted_customers_by_gender',
    CONVERTED_CUSTOMERS_BY_AGE: 'converted_customers_by_age',
    CONVERTED_CUSTOMERS_BY_INTEREST: 'converted_customers_by_interest',
    CONVERTED_CUSTOMERS_BY_ACTIVITY: 'converted_customers_by_activity',
    REVENUE_BY_CHANNEL: 'revenue_by_channel',
    TRANSACTIONS_BY_GEO: 'transactions_by_geo'
  }
} as const;

// Flattened metric IDs for backwards compatibility
export const METRIC_IDS = {
  ...METRICS.SCALAR,
  ...METRICS.TIME_SERIES,
  ...METRICS.CATEGORICAL
} as const;

export type ScalarMetric = typeof METRICS.SCALAR[keyof typeof METRICS.SCALAR];
export type TimeSeriesMetric = typeof METRICS.TIME_SERIES[keyof typeof METRICS.TIME_SERIES];
export type CategoricalMetric = typeof METRICS.CATEGORICAL[keyof typeof METRICS.CATEGORICAL];
export type MetricId = ScalarMetric | TimeSeriesMetric | CategoricalMetric;

export type MetricCategory = 'scalar' | 'timeSeries' | 'categorical';

export interface MetricResponse {
  metricID: MetricId;
  percentageValue: boolean;
  scalarValue: string | null;
  seriesValues: SeriesValue[] | null;
  merchantId: string;
}

/**
 * Series Data Structure
 */
export interface SeriesValue {
  seriesID: string;
  seriesPoints: SeriesPoint[];
}

/**
 * Series Data Point
 */
export interface SeriesPoint {
  value1: string; // Primary value (numeric as string)
  value2: string | boolean; // Secondary value (date, category, boolean for channels, etc.)
}

/**
 * Complete Analytics API Response
 */
export interface AnalyticsApiResponse extends ApiResponse {
  payload: {
    metrics: MetricResponse[];
  };
}

/**
 * API Schema Utilities
 */
export const SHOPPING_INTERESTS = {
  SHOPINT1: 'Αυτοκίνητα & Καύσιμα',
  SHOPINT2: 'Εκπαίδευση',
  SHOPINT3: 'Μόδα, Καλλυντικά & Κοσμήματα',
  SHOPINT4: 'Ηλεκτρονικά & Οικιακές Συσκευές',
  SHOPINT5: 'Κατοικίδια',
  SHOPINT6: 'Παιχνίδια',
  SHOPINT7: 'Ευεξία & Προσωπική Φροντίδα',
  SHOPINT8: 'Σπίτι & Κήπος',
  SHOPINT9: 'Ταξίδια & Μεταφορές',
  SHOPINT10: 'Τηλεπικοινωνίες',
  SHOPINT11: 'Τουρισμός',
  SHOPINT12: 'Φαγητό & Ποτά',
  SHOPINT13: 'Εστιατόρια, Μπαρ, Fast Food & Καφετέριες',
  SHOPINT14: 'Υγεία & Ιατρική Περίθαλψη',
  SHOPINT15: 'Ψυχαγωγία & Χόμπι'
} as const;

export const ANALYTICS_PROVIDERS = {
  POST_PROMOTION_ANALYTICS: '56f9cf99-3727-4f2f-bf1c-58dc532ebaf5',
  AUDIENCE_FILTERING: '79706006-ed8a-426d-88a8-c574acb92f26'
} as const;

export const ApiSchema = {
  isScalarMetric: (metricId: string): metricId is ScalarMetric => {
    return Object.values(METRICS.SCALAR).includes(metricId as ScalarMetric);
  },
  
  isTimeSeriesMetric: (metricId: string): metricId is TimeSeriesMetric => {
    return Object.values(METRICS.TIME_SERIES).includes(metricId as TimeSeriesMetric);
  },
  
  isCategoricalMetric: (metricId: string): metricId is CategoricalMetric => {
    return Object.values(METRICS.CATEGORICAL).includes(metricId as CategoricalMetric);
  },
  
  getMetricCategory: (metricId: string): MetricCategory | null => {
    if (ApiSchema.isScalarMetric(metricId)) return 'scalar';
    if (ApiSchema.isTimeSeriesMetric(metricId)) return 'timeSeries';
    if (ApiSchema.isCategoricalMetric(metricId)) return 'categorical';
    return null;
  }
} as const;
