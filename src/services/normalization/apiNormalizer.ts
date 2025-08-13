/**
 * API Response Normalizer
 * Transforms raw API responses into the normalized metrics structure
 */

import { METRIC_IDS } from '../../data/apiSchema.js';
import { timeSeriesNormalizer } from './timeSeriesNormalizer.js';
import { scalarNormalizer } from './scalarNormalizer.js';
import { categoricalNormalizer } from './categoricalNormalizer.js';

interface ApiMetric {
  metricID: string;
  percentageValue: boolean;
  scalarValue: string | null;
  seriesValues: any[] | null;
  merchantId: string;
}

interface ApiResponse {
  payload?: {
    metrics: ApiMetric[];
  };
  exception?: any;
  messages?: any[];
  executionTime?: number;
}

interface NormalizedMetrics {
  [metricId: string]: any;
}

interface NormalizationResult {
  normalizedMetrics: NormalizedMetrics;
  errors: string[];
}

type MetricType = 'timeSeries' | 'scalar' | 'categorical';

interface NormalizationStats {
  totalMetrics: number;
  merchantOnlyMetrics: number;
  competitorMetrics: number;
  timeSeriesMetrics: number;
  scalarMetrics: number;
  categoricalMetrics: number;
}

class ApiNormalizer {
  constructor() {
    this.timeSeriesNormalizer = timeSeriesNormalizer;
    this.scalarNormalizer = scalarNormalizer;
    this.categoricalNormalizer = categoricalNormalizer;
  }

  /**
   * Main normalization method - routes API response to appropriate normalizers
   */
  /**
   * Create context-aware metric key for metrics with filters
   */
  createMetricKey(metricID: string, context: string | null = null): string {
    // For converted_customers_by_interest, create different keys based on context
    if (metricID === 'converted_customers_by_interest' && context) {
      return `${metricID}_${context}`;
    }
    
    // For other metrics, use the original metricID
    return metricID;
  }

  normalizeApiResponse(apiResponse: ApiResponse, requestMetricIds: string[] = []): NormalizationResult {
    console.log('🔄 Normalizing API response:', apiResponse);
    
    if (!apiResponse?.payload?.metrics) {
      console.warn('⚠️ No metrics data in API response');
      return { normalizedMetrics: {}, errors: ['No metrics data in response'] };
    }

    const metrics = apiResponse.payload.metrics;
    const normalizedMetrics = {};
    const errors = [];

    // Group metrics by metricID and merchantId
    const groupedMetrics = this.groupMetricsByType(metrics);

    // Process each metric type
    Object.keys(groupedMetrics).forEach(metricID => {
      try {
        const metricData = groupedMetrics[metricID];
        const normalizedMetric = this.normalizeMetric(metricID, metricData);
        
        if (normalizedMetric) {
          normalizedMetrics[metricID] = normalizedMetric;
        } else {
          errors.push(`Failed to normalize metric: ${metricID}`);
        }
      } catch (error) {
        console.error(`❌ Error normalizing metric ${metricID}:`, error);
        errors.push(`Error normalizing ${metricID}: ${error.message}`);
      }
    });

    console.log('✅ API response normalized:', {
      originalMetrics: metrics.length,
      normalizedMetrics: Object.keys(normalizedMetrics).length,
      errors: errors.length
    });

    return { normalizedMetrics, errors };
  }

  /**
   * Normalize a single metric based on its type
   */
  normalizeMetric(metricID: string, metricData: any): any {
    const metricType = this.getMetricType(metricID);
    
    switch (metricType) {
      case 'timeSeries':
        return this.timeSeriesNormalizer.normalize(metricID, metricData);
      
      case 'scalar':
        return this.scalarNormalizer.normalize(metricID, metricData);
      
      case 'categorical':
        return this.categoricalNormalizer.normalize(metricID, metricData);
      
      default:
        console.warn(`⚠️ Unknown metric type for ${metricID}, attempting scalar normalization`);
        return this.scalarNormalizer.normalize(metricID, metricData);
    }
  }

  /**
   * Determine metric type based on metric ID
   */
  getMetricType(metricID: string): MetricType {
    // Time series metrics (daily/date-based data)
    const timeSeriesMetrics = [
      METRIC_IDS.REVENUE_PER_DAY,
      METRIC_IDS.TRANSACTIONS_PER_DAY,
      METRIC_IDS.CUSTOMERS_PER_DAY
    ];

    // Scalar metrics (single values)
    const scalarMetrics = [
      METRIC_IDS.TOTAL_REVENUE,
      METRIC_IDS.TOTAL_TRANSACTIONS,
      METRIC_IDS.AVG_TICKET_PER_USER,
      METRIC_IDS.AVG_DAILY_REVENUE,
      METRIC_IDS.GOFORMORE_AMOUNT,
      METRIC_IDS.REWARDED_AMOUNT,
      METRIC_IDS.REWARDED_POINTS,
      METRIC_IDS.REDEEMED_AMOUNT,
      METRIC_IDS.REDEEMED_POINTS
    ];

    // Categorical metrics (category breakdowns)
    const categoricalMetrics = [
      METRIC_IDS.CONVERTED_CUSTOMERS_BY_GENDER,
      METRIC_IDS.CONVERTED_CUSTOMERS_BY_AGE,
      METRIC_IDS.CONVERTED_CUSTOMERS_BY_INTEREST,
      METRIC_IDS.REVENUE_BY_CHANNEL,
      METRIC_IDS.TRANSACTIONS_BY_GEO
    ];

    if (timeSeriesMetrics.includes(metricID)) {
      return 'timeSeries';
    } else if (scalarMetrics.includes(metricID)) {
      return 'scalar';
    } else if (categoricalMetrics.includes(metricID)) {
      return 'categorical';
    } else {
      // Default to scalar for unknown metrics
      return 'scalar';
    }
  }

  /**
   * Group API metrics by metricID and merchantId
   */
  groupMetricsByType(metrics: ApiMetric[]): { [metricId: string]: { [entityType: string]: ApiMetric[] } } {
    const grouped = {};

    metrics.forEach(metric => {
      const { metricID, merchantId } = metric;
      
      if (!grouped[metricID]) {
        grouped[metricID] = {};
      }
      
      // Determine if this is merchant or competitor data
      const entityType = this.determineEntityType(merchantId);
      
      if (!grouped[metricID][entityType]) {
        grouped[metricID][entityType] = [];
      }
      
      grouped[metricID][entityType].push(metric);
    });

    return grouped;
  }

  /**
   * Determine if metric data is for merchant or competitor
   */
  determineEntityType(merchantId: string): 'merchant' | 'competitor' {
    // Competition data has special merchant ID
    if (merchantId === 'competition' || merchantId === 'competitor') {
      return 'competitor';
    }
    
    // Everything else is merchant data
    return 'merchant';
  }

  /**
   * Normalize year-over-year API response
   */
  normalizeYearOverYearResponse(currentResponse: ApiResponse, previousResponse: ApiResponse | null, requestMetricIds: string[] = []): NormalizationResult {
    console.log('🔄 Normalizing year-over-year API responses');
    
    const currentResult = this.normalizeApiResponse(currentResponse, requestMetricIds);
    const previousResult = this.normalizeApiResponse(previousResponse, requestMetricIds);
    
    // Structure the data for year-over-year comparison
    const normalizedData = {
      current: currentResult.normalizedMetrics,
      previous: previousResult.normalizedMetrics,
      errors: [...currentResult.errors, ...previousResult.errors]
    };

    // Add the previous year data to each metric in the proper structure
    const finalMetrics = {};
    
    Object.keys(currentResult.normalizedMetrics).forEach(metricID => {
      const currentMetric = currentResult.normalizedMetrics[metricID];
      const previousMetric = previousResult.normalizedMetrics[metricID];
      
      finalMetrics[metricID] = {
        merchant: {
          current: currentMetric.merchant?.current || currentMetric.merchant,
          previous: previousMetric?.merchant?.current || previousMetric?.merchant
        },
        competitor: currentMetric.competitor ? {
          current: currentMetric.competitor?.current || currentMetric.competitor,
          previous: previousMetric?.competitor?.current || previousMetric?.competitor
        } : undefined
      };
      
      // Remove undefined competitor data
      if (!finalMetrics[metricID].competitor) {
        delete finalMetrics[metricID].competitor;
      }
    });

    console.log('✅ Year-over-year data normalized:', {
      currentMetrics: Object.keys(currentResult.normalizedMetrics).length,
      previousMetrics: Object.keys(previousResult.normalizedMetrics).length,
      finalMetrics: Object.keys(finalMetrics).length,
      totalErrors: normalizedData.errors.length
    });

    return {
      normalizedMetrics: finalMetrics,
      errors: normalizedData.errors
    };
  }

  /**
   * Validate normalized metric structure
   */
  validateNormalizedMetric(metricID: string, normalizedMetric: any): string[] {
    const errors = [];

    if (!normalizedMetric) {
      errors.push(`Metric ${metricID} is null or undefined`);
      return errors;
    }

    // Check merchant data
    if (!normalizedMetric.merchant) {
      errors.push(`Metric ${metricID} missing merchant data`);
    }

    // For metrics that should have competitor data, validate it exists
    const competitorRequiredMetrics = [
      METRIC_IDS.TOTAL_REVENUE,
      METRIC_IDS.TOTAL_TRANSACTIONS,
      METRIC_IDS.AVG_TICKET_PER_USER,
      METRIC_IDS.REVENUE_PER_DAY,
      METRIC_IDS.TRANSACTIONS_PER_DAY,
      METRIC_IDS.CONVERTED_CUSTOMERS_BY_GENDER,
      METRIC_IDS.CONVERTED_CUSTOMERS_BY_AGE,
      METRIC_IDS.CONVERTED_CUSTOMERS_BY_INTEREST,
      METRIC_IDS.REVENUE_BY_CHANNEL
    ];

    if (competitorRequiredMetrics.includes(metricID) && !normalizedMetric.competitor) {
      // This is a warning, not an error, as competitor data might not be available
      console.warn(`⚠️ Metric ${metricID} missing competitor data (this may be expected)`);
    }

    return errors;
  }

  /**
   * Get normalization statistics
   */
  getNormalizationStats(normalizedMetrics: NormalizedMetrics): NormalizationStats {
    const stats = {
      totalMetrics: Object.keys(normalizedMetrics).length,
      merchantOnlyMetrics: 0,
      competitorMetrics: 0,
      timeSeriesMetrics: 0,
      scalarMetrics: 0,
      categoricalMetrics: 0
    };

    Object.keys(normalizedMetrics).forEach(metricID => {
      const metric = normalizedMetrics[metricID];
      const metricType = this.getMetricType(metricID);
      
      // Count by entity type
      if (metric.merchant && !metric.competitor) {
        stats.merchantOnlyMetrics++;
      } else if (metric.competitor) {
        stats.competitorMetrics++;
      }
      
      // Count by metric type
      switch (metricType) {
        case 'timeSeries':
          stats.timeSeriesMetrics++;
          break;
        case 'scalar':
          stats.scalarMetrics++;
          break;
        case 'categorical':
          stats.categoricalMetrics++;
          break;
      }
    });

    return stats;
  }

  /**
   * Apply business rules to normalized data
   */
  applyBusinessRules(normalizedMetrics: NormalizedMetrics): NormalizedMetrics {
    const processedMetrics = { ...normalizedMetrics };

    // Business Rule: Go For More metrics are merchant-only
    const goForMoreMetrics = [
      METRIC_IDS.GOFORMORE_AMOUNT,
      METRIC_IDS.REWARDED_AMOUNT,
      METRIC_IDS.REWARDED_POINTS,
      METRIC_IDS.REDEEMED_AMOUNT,
      METRIC_IDS.REDEEMED_POINTS
    ];

    goForMoreMetrics.forEach(metricID => {
      if (processedMetrics[metricID]?.competitor) {
        console.log(`🚫 Removing competitor data for Go For More metric: ${metricID}`);
        delete processedMetrics[metricID].competitor;
      }
    });

    // Business Rule: Customer metrics are merchant-only (compliance)
    const customerMetrics = [
      METRIC_IDS.CUSTOMERS_PER_DAY,
      'total_customers',
      'new_customers', 
      'returning_customers',
      'top_spenders',
      'loyal_customers',
      'at_risk_customers'
    ];

    customerMetrics.forEach(metricID => {
      if (processedMetrics[metricID]?.competitor) {
        console.log(`🚫 Removing competitor data for customer metric: ${metricID} (compliance)`);
        delete processedMetrics[metricID].competitor;
      }
    });

    return processedMetrics;
  }
}

// Export singleton instance
export const apiNormalizer = new ApiNormalizer();
export default apiNormalizer;