/**
 * Unified Metric Type Definitions
 * Single source of truth for all metric-related types
 * Eliminates conflicting definitions across the codebase
 */

// Discriminated union for different types of metric data
export interface ScalarEntityData {
  type: 'scalar';
  current: number | null;
  previous?: number | null;
}

export interface CategoricalEntityData {
  type: 'categorical';
  current: Record<string, number> | null;
  previous?: Record<string, number> | null;
}

export interface TimeSeriesEntityData {
  type: 'timeSeries';
  current: Array<{ date: string; value: number }> | null;
  previous?: Array<{ date: string; value: number }> | null;
}

// Union type for all entity data types
export type EntityData = ScalarEntityData | CategoricalEntityData | TimeSeriesEntityData;

// Metric data structure with proper discrimination
export interface MetricData {
  merchant?: EntityData;
  competitor?: EntityData;
}

// Type guards for runtime type checking
export const isScalarEntityData = (data: EntityData): data is ScalarEntityData => {
  return data.type === 'scalar';
};

export const isCategoricalEntityData = (data: EntityData): data is CategoricalEntityData => {
  return data.type === 'categorical';
};

export const isTimeSeriesEntityData = (data: EntityData): data is TimeSeriesEntityData => {
  return data.type === 'timeSeries';
};

// Helper type guards for metric data
export const hasScalarData = (metric: MetricData, entity: 'merchant' | 'competitor'): boolean => {
  const entityData = metric[entity];
  return entityData ? isScalarEntityData(entityData) : false;
};

export const hasCategoricalData = (metric: MetricData, entity: 'merchant' | 'competitor'): boolean => {
  const entityData = metric[entity];
  return entityData ? isCategoricalEntityData(entityData) : false;
};

export const hasTimeSeriesData = (metric: MetricData, entity: 'merchant' | 'competitor'): boolean => {
  const entityData = metric[entity];
  return entityData ? isTimeSeriesEntityData(entityData) : false;
};

// Utility functions for safe data access
export const getScalarValue = (entityData: EntityData): number | null => {
  return isScalarEntityData(entityData) ? entityData.current : null;
};

export const getCategoricalValue = (entityData: EntityData): Record<string, number> | null => {
  return isCategoricalEntityData(entityData) ? entityData.current : null;
};

export const getTimeSeriesValue = (entityData: EntityData): Array<{ date: string; value: number }> | null => {
  return isTimeSeriesEntityData(entityData) ? entityData.current : null;
};

// State interfaces
export interface MetricsState {
  [metricId: string]: MetricData;
}

export interface DataValidation {
  hasValidCurrentData: boolean;
  hasValidPreviousData: boolean;
  missingMetrics: string[];
  incompletePeriods: string[];
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface DataMeta {
  lastUpdated: Record<string, string>;
  freshness: Record<string, 'fresh' | 'stale' | 'error'>;
  sources: Record<string, string>;
  dateRanges: {
    current: DateRange | null;
    previous: DateRange | null;
  };
  validation: DataValidation;
  globalLastUpdated: string | null;
  lastYoYUpdate: string | null;
}