/**
 * Type Guard Utilities
 * Re-export validation functions from apiSchema
 */

import { ApiSchema } from './apiSchema';
import type { MetricId, FilterId, EntityType, MetricCategory } from './apiSchema';

// Re-export validation functions for backwards compatibility
export const isMetricId = ApiSchema.isValidMetricId;
export const isFilterId = ApiSchema.isValidFilterId;
export const isScalarMetric = ApiSchema.isScalarMetric;
export const isTimeSeriesMetric = ApiSchema.isTimeSeriesMetric;
export const isCategoricalMetric = ApiSchema.isCategoricalMetric;
export const getMetricCategory = ApiSchema.getMetricCategory;

// Additional utility functions
export const isValidEntityType = (value: string): value is EntityType => {
  return value === 'merchant' || value === 'competitor';
};

export const isValidMetricCategory = (value: string): value is MetricCategory => {
  return ['scalar', 'timeSeries', 'categorical'].includes(value);
};