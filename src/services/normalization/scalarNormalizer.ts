/**
 * Scalar Normalizer
 * Handles normalization of single-value metrics (totals, averages, etc.)
 */

interface ScalarMetric {
  metricID: string;
  scalarValue: string | number | null;
  seriesValues?: SeriesValue[];
  merchantId: string;
}

interface SeriesValue {
  seriesID: string;
  seriesPoints: SeriesPoint[];
}

interface SeriesPoint {
  value1: string;
  value2: string;
}

interface NormalizedScalarData {
  current: number | null;
  previous?: number | null;
}

interface NormalizedMetricData {
  merchant?: NormalizedScalarData;
  competitor?: NormalizedScalarData;
}

type AggregationMethod = 'sum' | 'average' | 'max' | 'min' | 'median';
type FormatType = 'currency' | 'percentage' | 'number' | 'integer';

interface SummaryStats {
  count: number;
  sum: number | null;
  average: number | null;
  min: number | null;
  max: number | null;
  median: number | null;
}

export class ScalarNormalizer {
  /**
   * Normalize scalar metric data
   */
  normalize(metricID: string, metricData: { merchant?: ScalarMetric[]; competitor?: ScalarMetric[] }): NormalizedMetricData {
    console.log(`🔄 Normalizing scalar metric: ${metricID}`);
    
    const normalized = {};

    // Process merchant data
    if (metricData.merchant) {
      normalized.merchant = this.normalizeEntityData(metricData.merchant, 'merchant');
    }

    // Process competitor data
    if (metricData.competitor) {
      normalized.competitor = this.normalizeEntityData(metricData.competitor, 'competitor');
    }

    console.log(`✅ Scalar metric ${metricID} normalized:`, {
      merchant: normalized.merchant?.current || null,
      competitor: normalized.competitor?.current || null
    });

    return normalized;
  }

  /**
   * Normalize data for a specific entity (merchant or competitor)
   */
  normalizeEntityData(entityMetrics: ScalarMetric[], entityType: string): NormalizedScalarData {
    let scalarValue = null;

    // Process each metric entry for this entity
    entityMetrics.forEach(metric => {
      if (metric.scalarValue !== null && metric.scalarValue !== undefined) {
        // Parse the scalar value
        const parsedValue = this.parseValue(metric.scalarValue);
        
        if (parsedValue !== null) {
          // For scalar metrics, we expect only one value per entity
          // If multiple values exist, use the last one (or implement aggregation logic)
          scalarValue = parsedValue;
        }
      } else if (metric.seriesValues && metric.seriesValues.length > 0) {
        // Sometimes scalar data comes as series with one point
        console.warn(`⚠️ Scalar metric has series values, extracting scalar from series`);
        
        const extractedValue = this.extractScalarFromSeries(metric.seriesValues);
        if (extractedValue !== null) {
          scalarValue = extractedValue;
        }
      }
    });

    // Return in the expected format for scalar metrics
    return {
      current: scalarValue
      // previous will be added during year-over-year normalization
    };
  }

  /**
   * Parse numeric value from API response
   */
  parseValue(valueString: string | number | boolean | null | undefined): number | null {
    if (valueString === null || valueString === undefined) return null;
    
    // Handle string numbers
    if (typeof valueString === 'string') {
      // Remove any currency symbols, commas, and whitespace
      const cleaned = valueString.replace(/[€$,\s%]/g, '');
      
      // Handle empty strings
      if (cleaned === '') return null;
      
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? null : parsed;
    }
    
    // Handle numeric values
    if (typeof valueString === 'number') {
      return isNaN(valueString) ? null : valueString;
    }
    
    // Handle boolean values (for binary metrics)
    if (typeof valueString === 'boolean') {
      return valueString ? 1 : 0;
    }
    
    return null;
  }

  /**
   * Extract scalar value from series data
   */
  extractScalarFromSeries(seriesValues: SeriesValue[]): number | null {
    if (!seriesValues || seriesValues.length === 0) return null;
    
    // Try to find a total or aggregated value
    let totalValue = 0;
    let pointCount = 0;
    
    seriesValues.forEach(series => {
      if (series.seriesPoints && series.seriesPoints.length > 0) {
        series.seriesPoints.forEach(point => {
          const value = this.parseValue(point.value1);
          if (value !== null) {
            totalValue += value;
            pointCount++;
          }
        });
      }
    });
    
    // Return total if we found valid points
    return pointCount > 0 ? totalValue : null;
  }

  /**
   * Apply metric-specific transformations
   */
  applyMetricTransformations(metricID: string, value: number | null): number | null {
    if (value === null) return null;
    
    switch (metricID) {
      case 'avg_ticket_per_user':
      case 'avg_daily_revenue':
        // Ensure averages are positive
        return Math.max(0, value);
      
      case 'total_revenue':
      case 'total_transactions':
      case 'goformore_amount':
      case 'rewarded_amount':
      case 'redeemed_amount':
        // Ensure totals are non-negative
        return Math.max(0, value);
      
      case 'rewarded_points':
      case 'redeemed_points':
        // Points should be integers
        return Math.max(0, Math.round(value));
      
      default:
        return value;
    }
  }

  /**
   * Calculate percentage change between current and previous values
   */
  calculatePercentageChange(current: number | null, previous: number | null): number | null {
    if (current === null || previous === null || previous === 0) {
      return null;
    }
    
    return ((current - previous) / previous) * 100;
  }

  /**
   * Aggregate multiple scalar values
   */
  aggregateScalarValues(values: (number | null)[], method: AggregationMethod = 'sum'): number | null {
    const validValues = values.filter(v => v !== null && !isNaN(v));
    
    if (validValues.length === 0) return null;
    
    switch (method) {
      case 'sum':
        return validValues.reduce((sum, val) => sum + val, 0);
      
      case 'average':
        return validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
      
      case 'max':
        return Math.max(...validValues);
      
      case 'min':
        return Math.min(...validValues);
      
      case 'median':
        const sorted = [...validValues].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 
          ? (sorted[mid - 1] + sorted[mid]) / 2 
          : sorted[mid];
      
      default:
        return validValues[0]; // Return first value
    }
  }

  /**
   * Format scalar value for display
   */
  formatValue(value: number | null | undefined, metricID: string, formatType: FormatType = 'number'): string {
    if (value === null || value === undefined) return '-';
    
    switch (formatType) {
      case 'currency':
        return new Intl.NumberFormat('el-GR', {
          style: 'currency',
          currency: 'EUR',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(value);
      
      case 'percentage':
        return new Intl.NumberFormat('el-GR', {
          style: 'percent',
          minimumFractionDigits: 1,
          maximumFractionDigits: 1
        }).format(value / 100);
      
      case 'number':
        return new Intl.NumberFormat('el-GR', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        }).format(value);
      
      case 'integer':
        return new Intl.NumberFormat('el-GR', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(Math.round(value));
      
      default:
        return String(value);
    }
  }

  /**
   * Determine appropriate format type for metric
   */
  getFormatType(metricID: string): FormatType {
    const currencyMetrics = [
      'total_revenue',
      'avg_daily_revenue', 
      'avg_ticket_per_user',
      'goformore_amount',
      'rewarded_amount',
      'redeemed_amount'
    ];
    
    const integerMetrics = [
      'total_transactions',
      'rewarded_points',
      'redeemed_points',
      'total_customers',
      'new_customers',
      'returning_customers'
    ];
    
    if (currencyMetrics.includes(metricID)) {
      return 'currency';
    } else if (integerMetrics.includes(metricID)) {
      return 'integer';
    } else {
      return 'number';
    }
  }

  /**
   * Validate scalar data
   */
  validate(normalizedData: NormalizedMetricData, metricID: string): string[] {
    const errors = [];
    
    if (!normalizedData.merchant?.current && normalizedData.merchant?.current !== 0) {
      errors.push('Missing merchant current data');
    }
    
    // Validate value ranges for specific metrics
    if (normalizedData.merchant?.current !== null) {
      const value = normalizedData.merchant.current;
      
      // Revenue metrics should be positive
      const revenueMetrics = ['total_revenue', 'avg_daily_revenue', 'avg_ticket_per_user'];
      if (revenueMetrics.includes(metricID) && value < 0) {
        errors.push(`Revenue metric ${metricID} has negative value: ${value}`);
      }
      
      // Count metrics should be non-negative integers
      const countMetrics = ['total_transactions', 'total_customers'];
      if (countMetrics.includes(metricID)) {
        if (value < 0) {
          errors.push(`Count metric ${metricID} has negative value: ${value}`);
        }
        if (!Number.isInteger(value)) {
          errors.push(`Count metric ${metricID} should be integer: ${value}`);
        }
      }
      
      // Check for unreasonably large values that might indicate data errors
      const maxReasonableValues = {
        'total_revenue': 1000000000, // 1 billion EUR
        'total_transactions': 10000000, // 10 million transactions
        'avg_ticket_per_user': 100000 // 100k EUR per transaction
      };
      
      if (maxReasonableValues[metricID] && value > maxReasonableValues[metricID]) {
        errors.push(`Metric ${metricID} has unreasonably large value: ${value}`);
      }
    }
    
    return errors;
  }

  /**
   * Create summary statistics for scalar metrics
   */
  createSummaryStats(values: (number | null)[]): SummaryStats {
    const validValues = values.filter(v => v !== null && !isNaN(v));
    
    if (validValues.length === 0) {
      return {
        count: 0,
        sum: null,
        average: null,
        min: null,
        max: null,
        median: null
      };
    }
    
    const sorted = [...validValues].sort((a, b) => a - b);
    const sum = validValues.reduce((s, v) => s + v, 0);
    const average = sum / validValues.length;
    const median = sorted.length % 2 === 0 
      ? (sorted[Math.floor(sorted.length / 2) - 1] + sorted[Math.floor(sorted.length / 2)]) / 2
      : sorted[Math.floor(sorted.length / 2)];
    
    return {
      count: validValues.length,
      sum,
      average,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      median
    };
  }
}

// Export singleton instance
export const scalarNormalizer = new ScalarNormalizer();
export default scalarNormalizer;