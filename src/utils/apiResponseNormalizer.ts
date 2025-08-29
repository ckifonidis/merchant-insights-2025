/**
 * Standalone API Response Normalizer
 * Transforms raw Analytics API responses into normalized store format
 * No dependencies on existing normalizers - completely self-contained
 */

import {
  type AnalyticsApiResponse,
  type MetricResponse,
  type SeriesValue,
  type SeriesPoint,
  type MetricCategory,
  type EntityType,
  type MetricData,
  ApiSchema,
  METRICS
} from '../types/apiSchema';

// === INTERFACES ===

interface NormalizationResult {
  metrics: Record<string, MetricData>;
  errors: string[];
  stats: {
    totalProcessed: number;
    merchantMetrics: number;
    competitorMetrics: number;
    errorCount: number;
  };
}

interface ProcessingError {
  metricId: string;
  entityType: EntityType;
  errorType: 'parsing' | 'validation' | 'structure' | 'unknown';
  message: string;
}

interface GroupedMetrics {
  [metricId: string]: {
    merchant?: MetricResponse[];
    competitor?: MetricResponse[];
  };
}

// === ENTITY TYPE DETECTION ===

/**
 * Determine if metric data is for merchant or competitor
 */
function determineEntityType(merchantId: string): EntityType {
  // Competition data has special merchant ID values
  const competitorIds = ['competition', 'competitor', 'comp'];
  return competitorIds.includes(merchantId.toLowerCase()) ? 'competitor' : 'merchant';
}

// === METRIC TYPE CLASSIFICATION ===

/**
 * Get metric type using centralized schema
 */
function getMetricType(metricId: string): MetricCategory {
  return ApiSchema.getMetricCategory(metricId) || 'scalar';
}

// === VALUE PARSING UTILITIES ===

/**
 * Parse numeric value from string with comprehensive validation
 */
function parseNumericValue(value: string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  // Handle string values
  if (typeof value === 'string') {
    // Remove currency symbols, commas, percentage signs, and whitespace
    const cleaned = value.replace(/[€$£¥,\s%]/g, '');
    
    // Handle empty string after cleaning
    if (cleaned === '') return null;
    
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }

  // Handle numeric values directly
  if (typeof value === 'number') {
    return isNaN(value) ? null : value;
  }

  return null;
}

/**
 * Parse and standardize date string to YYYY-MM-DD format
 */
function parseDate(dateString: string): string | null {
  if (!dateString || typeof dateString !== 'string') {
    return null;
  }

  try {
    // Handle YYYY-MM-DD format (already standard)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const date = new Date(dateString);
      return !isNaN(date.getTime()) ? dateString : null;
    }

    // Handle MM/DD/YYYY format
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
      const [month, day, year] = dateString.split('/');
      const formatted = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      const date = new Date(formatted);
      return !isNaN(date.getTime()) ? formatted : null;
    }

    // Handle DD/MM/YYYY format
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
      const parts = dateString.split('/');
      // Assume MM/DD/YYYY for now - could be enhanced with format detection
      const formatted = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
      const date = new Date(formatted);
      return !isNaN(date.getTime()) ? formatted : null;
    }

    // Try parsing as ISO date
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch (error) {
    console.error(`Error parsing date: ${dateString}`, error);
  }

  return null;
}

/**
 * Validate and transform numeric value based on metric type
 */
function validateValue(value: number | null, metricId: string): number | null {
  if (value === null) return null;

  const category = getMetricType(metricId);

  switch (category) {
    case 'scalar': {
      // Revenue metrics should be non-negative
      const revenueMetrics = [
        METRICS.SCALAR.TOTAL_REVENUE,
        METRICS.SCALAR.AVG_DAILY_REVENUE,
        METRICS.SCALAR.AVG_TICKET_PER_USER,
        METRICS.SCALAR.GOFORMORE_AMOUNT,
        METRICS.SCALAR.REWARDED_AMOUNT,
        METRICS.SCALAR.REDEEMED_AMOUNT
      ];
      
      if (revenueMetrics.includes(metricId as any)) {
        return Math.max(0, value);
      }

      // Count metrics should be non-negative integers
      const countMetrics = [
        METRICS.SCALAR.TOTAL_TRANSACTIONS,
        METRICS.SCALAR.TOTAL_CUSTOMERS,
        METRICS.SCALAR.REWARDED_POINTS,
        METRICS.SCALAR.REDEEMED_POINTS
      ];
      
      if (countMetrics.includes(metricId as any)) {
        return Math.max(0, Math.round(value));
      }

      return value;
    }

    case 'timeSeries':
    case 'categorical':
      // Time series and categorical values should generally be non-negative
      return Math.max(0, value);

    default:
      return value;
  }
}

// === METRIC TRANSFORMERS ===

/**
 * Transform scalar metric to normalized format
 */
function transformScalarMetric(metric: MetricResponse, errors: ProcessingError[]): number | null {
  try {
    if (metric.scalarValue === null || metric.scalarValue === undefined) {
      return null;
    }

    const parsed = parseNumericValue(metric.scalarValue);
    if (parsed === null) {
      errors.push({
        metricId: metric.metricID,
        entityType: determineEntityType(metric.merchantId),
        errorType: 'parsing',
        message: `Failed to parse scalar value: "${metric.scalarValue}"`
      });
      return null;
    }

    return validateValue(parsed, metric.metricID);
  } catch (error) {
    errors.push({
      metricId: metric.metricID,
      entityType: determineEntityType(metric.merchantId),
      errorType: 'unknown',
      message: `Scalar transformation error: ${error instanceof Error ? error.message : String(error)}`
    });
    return null;
  }
}

/**
 * Transform time series metric to normalized format
 */
function transformTimeSeriesMetric(metric: MetricResponse, errors: ProcessingError[]): Record<string, number> | null {
  try {
    if (!metric.seriesValues || !Array.isArray(metric.seriesValues)) {
      errors.push({
        metricId: metric.metricID,
        entityType: determineEntityType(metric.merchantId),
        errorType: 'structure',
        message: 'Missing or invalid seriesValues for time series metric'
      });
      return null;
    }

    const result: Record<string, number> = {};
    const entityType = determineEntityType(metric.merchantId);

    metric.seriesValues.forEach((series: SeriesValue) => {
      if (!series.seriesPoints || !Array.isArray(series.seriesPoints)) {
        return;
      }

      series.seriesPoints.forEach((point: SeriesPoint) => {
        // value2 is the date, value1 is the numeric value
        const date = parseDate(String(point.value2));
        const value = parseNumericValue(point.value1);

        if (date === null) {
          errors.push({
            metricId: metric.metricID,
            entityType,
            errorType: 'parsing',
            message: `Invalid date format: "${point.value2}"`
          });
          return;
        }

        if (value === null) {
          errors.push({
            metricId: metric.metricID,
            entityType,
            errorType: 'parsing',
            message: `Invalid numeric value: "${point.value1}" for date ${date}`
          });
          return;
        }

        const validatedValue = validateValue(value, metric.metricID);
        if (validatedValue !== null) {
          result[date] = validatedValue;
        }
      });
    });

    return Object.keys(result).length > 0 ? result : null;
  } catch (error) {
    errors.push({
      metricId: metric.metricID,
      entityType: determineEntityType(metric.merchantId),
      errorType: 'unknown',
      message: `Time series transformation error: ${error instanceof Error ? error.message : String(error)}`
    });
    return null;
  }
}

/**
 * Transform categorical metric to normalized format
 */
function transformCategoricalMetric(metric: MetricResponse, errors: ProcessingError[]): Record<string, number> | null {
  try {
    if (!metric.seriesValues || !Array.isArray(metric.seriesValues)) {
      errors.push({
        metricId: metric.metricID,
        entityType: determineEntityType(metric.merchantId),
        errorType: 'structure',
        message: 'Missing or invalid seriesValues for categorical metric'
      });
      return null;
    }

    const result: Record<string, number> = {};
    const entityType = determineEntityType(metric.merchantId);

    metric.seriesValues.forEach((series: SeriesValue) => {
      if (!series.seriesPoints || !Array.isArray(series.seriesPoints)) {
        return;
      }

      series.seriesPoints.forEach((point: SeriesPoint) => {
        // value2 is the category, value1 is the numeric value
        let category = point.value2;
        const value = parseNumericValue(point.value1);

        // Handle empty category names (for string categories only)
        if (typeof category === 'string' && (!category || category.trim() === '')) {
          category = 'other_category';
        }

        // Apply category mapping based on metric type
        category = mapCategoryValue(metric.metricID, category);

        if (value === null) {
          errors.push({
            metricId: metric.metricID,
            entityType,
            errorType: 'parsing',
            message: `Invalid numeric value: "${point.value1}" for category ${category}`
          });
          return;
        }

        const validatedValue = validateValue(value, metric.metricID);
        if (validatedValue !== null) {
          result[category] = validatedValue;
        }
      });
    });

    return Object.keys(result).length > 0 ? result : null;
  } catch (error) {
    errors.push({
      metricId: metric.metricID,
      entityType: determineEntityType(metric.merchantId),
      errorType: 'unknown',
      message: `Categorical transformation error: ${error instanceof Error ? error.message : String(error)}`
    });
    return null;
  }
}

/**
 * Map category values to standardized format
 */
function mapCategoryValue(metricId: string, category: string | boolean): string {
  // Gender mapping
  if (metricId.includes('gender')) {
    if (typeof category === 'string') {
      const genderMap: Record<string, string> = {
        'm': 'male',
        'f': 'female',
        'M': 'male',
        'F': 'female',
        'male': 'male',
        'female': 'female',
        'other': 'other'
      };
      return genderMap[category] || category;
    }
    return String(category);
  }

  // Age groups - keep as-is
  if (metricId.includes('age')) {
    return String(category);
  }

  // Shopping interests - ensure SHOPINT format
  if (metricId.includes('interest')) {
    const categoryStr = String(category);
    if (categoryStr.toUpperCase().startsWith('SHOPINT')) {
      return categoryStr.toUpperCase();
    }
    // Handle numeric interest IDs
    if (/^\d+$/.test(categoryStr)) {
      const num = parseInt(categoryStr);
      if (num >= 1 && num <= 15) {
        return `SHOPINT${num}`;
      }
    }
    return categoryStr;
  }

  // Geographic regions - keep as-is
  if (metricId.includes('geo')) {
    return String(category);
  }

  // Channel mapping
  if (metricId.includes('channel')) {
    // Handle boolean values from real API (false = physical, true = ecommerce)
    if (typeof category === 'boolean') {
      return category ? 'ecommerce' : 'physical';
    }
    
    // Handle string values for backward compatibility
    if (typeof category === 'string') {
      const channelMap: Record<string, string> = {
        'physical': 'physical',
        'ecommerce': 'ecommerce',
        'e-commerce': 'ecommerce',
        'online': 'ecommerce',
        'store': 'physical',
        'retail': 'physical'
      };
      return channelMap[category.toLowerCase()] || category;
    }
  }

  return String(category);
}

// === METRIC GROUPING ===

/**
 * Group API metrics by metricID and entity type
 */
function groupMetricsByIdAndEntity(metrics: MetricResponse[]): GroupedMetrics {
  const grouped: GroupedMetrics = {};

  metrics.forEach(metric => {
    const { metricID, merchantId } = metric;
    
    if (!grouped[metricID]) {
      grouped[metricID] = {};
    }
    
    const entityType = determineEntityType(merchantId);
    
    if (!grouped[metricID][entityType]) {
      grouped[metricID][entityType] = [];
    }
    
    grouped[metricID][entityType].push(metric);
  });

  return grouped;
}

/**
 * Process a group of metrics for a specific metricID
 */
function processMetricGroup(
  metricId: string, 
  group: { merchant?: MetricResponse[]; competitor?: MetricResponse[] },
  errors: ProcessingError[]
): MetricData {
  const result: MetricData = {};
  const metricType = getMetricType(metricId);

  // Process merchant data
  if (group.merchant && group.merchant.length > 0) {
    const merchantMetric = group.merchant[0]; // Take first metric if multiple
    
    let transformedData: number | Record<string, number> | null = null;
    
    switch (metricType) {
      case 'scalar':
        transformedData = transformScalarMetric(merchantMetric, errors);
        break;
      case 'timeSeries':
        transformedData = transformTimeSeriesMetric(merchantMetric, errors);
        break;
      case 'categorical':
        transformedData = transformCategoricalMetric(merchantMetric, errors);
        break;
    }

    if (transformedData !== null) {
      result.merchant = { current: transformedData };
    }
  }

  // Process competitor data
  if (group.competitor && group.competitor.length > 0) {
    const competitorMetric = group.competitor[0]; // Take first metric if multiple
    
    let transformedData: number | Record<string, number> | null = null;
    
    switch (metricType) {
      case 'scalar':
        transformedData = transformScalarMetric(competitorMetric, errors);
        break;
      case 'timeSeries':
        transformedData = transformTimeSeriesMetric(competitorMetric, errors);
        break;
      case 'categorical':
        transformedData = transformCategoricalMetric(competitorMetric, errors);
        break;
    }

    if (transformedData !== null) {
      result.competitor = { current: transformedData };
    }
  }

  return result;
}

// === YEAR-OVER-YEAR MERGER ===

/**
 * Merge current and previous data into year-over-year structure
 */
function mergeCurrentAndPrevious(
  currentMetrics: Record<string, MetricData>,
  previousMetrics: Record<string, MetricData>
): Record<string, MetricData> {
  const merged: Record<string, MetricData> = {};

  // Process all metrics from current data
  Object.keys(currentMetrics).forEach(metricId => {
    const current = currentMetrics[metricId];
    const previous = previousMetrics[metricId];

    const mergedMetric: MetricData = {};
    
    if (current.merchant) {
      mergedMetric.merchant = {
        current: current.merchant.current,
        previous: previous?.merchant?.current || null
      };
    }
    
    if (current.competitor) {
      mergedMetric.competitor = {
        current: current.competitor.current,
        previous: previous?.competitor?.current || null
      };
    }
    
    merged[metricId] = mergedMetric;
  });

  return merged;
}

// === STATISTICS GENERATION ===

/**
 * Generate processing statistics
 */
function generateStats(
  metrics: Record<string, MetricData>, 
  errors: ProcessingError[]
): NormalizationResult['stats'] {
  let merchantCount = 0;
  let competitorCount = 0;

  Object.values(metrics).forEach(metric => {
    if (metric.merchant) merchantCount++;
    if (metric.competitor) competitorCount++;
  });

  return {
    totalProcessed: Object.keys(metrics).length,
    merchantMetrics: merchantCount,
    competitorMetrics: competitorCount,
    errorCount: errors.length
  };
}

// === MAIN NORMALIZER FUNCTION ===

/**
 * Normalize Analytics API response to store format
 * Transforms raw API response into the standardized metrics structure
 * 
 * @param currentResponse - Current period API response
 * @param previousResponse - Previous period API response (optional, for YoY)
 * @returns Normalized metrics with error information
 */
export function normalizeApiResponseToStore(
  currentResponse: AnalyticsApiResponse,
  previousResponse?: AnalyticsApiResponse
): NormalizationResult {
  console.log('🔄 Starting API response normalization');
  
  const errors: ProcessingError[] = [];

  // Validate input
  if (!currentResponse?.payload?.metrics) {
    console.warn('⚠️ No metrics data in current API response');
    return {
      metrics: {},
      errors: ['No metrics data in current response'],
      stats: { totalProcessed: 0, merchantMetrics: 0, competitorMetrics: 0, errorCount: 1 }
    };
  }

  try {
    // Extract metrics from current response
    const currentMetrics = currentResponse.payload.metrics;
    console.log(`📊 Processing ${currentMetrics.length} current metrics`);

    // Group current metrics by ID and entity
    const groupedCurrent = groupMetricsByIdAndEntity(currentMetrics);
    console.log(`🔗 Grouped into ${Object.keys(groupedCurrent).length} metric types`);

    // Process each metric group
    const processedCurrent: Record<string, MetricData> = {};
    Object.keys(groupedCurrent).forEach(metricId => {
      try {
        const processed = processMetricGroup(metricId, groupedCurrent[metricId], errors);
        if (processed.merchant || processed.competitor) {
          processedCurrent[metricId] = processed;
        }
      } catch (error) {
        console.error(`❌ Error processing metric ${metricId}:`, error);
        errors.push({
          metricId,
          entityType: 'merchant',
          errorType: 'unknown',
          message: `Processing error: ${error instanceof Error ? error.message : String(error)}`
        });
      }
    });

    // Handle previous data if provided
    let finalMetrics = processedCurrent;
    
    if (previousResponse?.payload?.metrics) {
      console.log(`📈 Processing ${previousResponse.payload.metrics.length} previous metrics for YoY`);
      
      const groupedPrevious = groupMetricsByIdAndEntity(previousResponse.payload.metrics);
      const processedPrevious: Record<string, MetricData> = {};
      
      Object.keys(groupedPrevious).forEach(metricId => {
        try {
          const processed = processMetricGroup(metricId, groupedPrevious[metricId], errors);
          if (processed.merchant || processed.competitor) {
            processedPrevious[metricId] = processed;
          }
        } catch (error) {
          console.error(`❌ Error processing previous metric ${metricId}:`, error);
          errors.push({
            metricId,
            entityType: 'merchant',
            errorType: 'unknown',
            message: `Previous data processing error: ${error instanceof Error ? error.message : String(error)}`
          });
        }
      });

      // Merge current and previous data
      finalMetrics = mergeCurrentAndPrevious(processedCurrent, processedPrevious);
      console.log('🔄 Merged current and previous data for YoY analysis');
    }

    // Generate statistics
    const stats = generateStats(finalMetrics, errors);
    
    // Convert ProcessingError[] to string[] for the return format
    const errorStrings = errors.map(error => 
      `${error.metricId} (${error.entityType}): ${error.message}`
    );

    console.log('✅ API response normalization completed', {
      metricsProcessed: stats.totalProcessed,
      merchantMetrics: stats.merchantMetrics,
      competitorMetrics: stats.competitorMetrics,
      errors: stats.errorCount
    });

    return {
      metrics: finalMetrics,
      errors: errorStrings,
      stats
    };

  } catch (error) {
    console.error('💥 Fatal error during normalization:', error);
    return {
      metrics: {},
      errors: [`Fatal normalization error: ${error instanceof Error ? error.message : String(error)}`],
      stats: { totalProcessed: 0, merchantMetrics: 0, competitorMetrics: 0, errorCount: 1 }
    };
  }
}

// Export default for convenience
export default normalizeApiResponseToStore;