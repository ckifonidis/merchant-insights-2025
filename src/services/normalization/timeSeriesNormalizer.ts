/**
 * Time Series Normalizer
 * Handles normalization of time-based metrics (daily, weekly, etc.)
 */

interface TimeSeriesMetric {
  metricID: string;
  scalarValue?: string | number | null;
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

interface TimeSeriesData {
  [date: string]: number;
}

interface NormalizedTimeSeriesData {
  current: TimeSeriesData;
  previous?: TimeSeriesData;
}

interface NormalizedMetricData {
  merchant?: NormalizedTimeSeriesData;
  competitor?: NormalizedTimeSeriesData;
}

type Period = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export class TimeSeriesNormalizer {
  /**
   * Normalize time series metric data
   */
  normalize(metricID: string, metricData: { merchant?: TimeSeriesMetric[]; competitor?: TimeSeriesMetric[] }): NormalizedMetricData {
    console.log(`🔄 Normalizing time series metric: ${metricID}`);
    
    const normalized = {};

    // Process merchant data
    if (metricData.merchant) {
      normalized.merchant = this.normalizeEntityData(metricData.merchant, 'merchant');
    }

    // Process competitor data
    if (metricData.competitor) {
      normalized.competitor = this.normalizeEntityData(metricData.competitor, 'competitor');
    }

    console.log(`✅ Time series metric ${metricID} normalized:`, {
      merchant: normalized.merchant ? Object.keys(normalized.merchant.current || {}).length : 0,
      competitor: normalized.competitor ? Object.keys(normalized.competitor.current || {}).length : 0
    });

    return normalized;
  }

  /**
   * Normalize data for a specific entity (merchant or competitor)
   */
  normalizeEntityData(entityMetrics: TimeSeriesMetric[], entityType: string): NormalizedTimeSeriesData {
    // Assume current year data for now
    // In year-over-year scenarios, this will be called separately for each year
    const seriesData = {};

    entityMetrics.forEach(metric => {
      if (metric.seriesValues && metric.seriesValues.length > 0) {
        // Process series values
        metric.seriesValues.forEach(series => {
          if (series.seriesPoints && series.seriesPoints.length > 0) {
            series.seriesPoints.forEach(point => {
              // value1 is the metric value, value2 is typically the date
              const date = this.parseDate(point.value2);
              const value = this.parseValue(point.value1);
              
              if (date && value !== null) {
                seriesData[date] = value;
              }
            });
          }
        });
      } else if (metric.scalarValue) {
        // Some time series might come as scalar for aggregated periods
        // This would need additional context about the date
        console.warn(`⚠️ Time series metric has scalar value: ${metricID}, may need date context`);
      }
    });

    // Return in the expected format
    return {
      current: seriesData
      // previous will be added during year-over-year normalization
    };
  }

  /**
   * Parse date from API response
   */
  parseDate(dateString: string): string | null {
    if (!dateString) return null;
    
    try {
      // Handle different date formats
      if (dateString.includes('/')) {
        // Format: MM/DD/YYYY or DD/MM/YYYY
        const parts = dateString.split('/');
        if (parts.length === 3) {
          // Assume MM/DD/YYYY format from API
          const month = parts[0].padStart(2, '0');
          const day = parts[1].padStart(2, '0');
          const year = parts[2];
          return `${year}-${month}-${day}`;
        }
      } else if (dateString.includes('-')) {
        // Already in YYYY-MM-DD format
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          return dateString.split('T')[0]; // Remove time part if present
        }
      } else {
        // Try to parse as timestamp or other format
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      }
    } catch (error) {
      console.error(`❌ Error parsing date: ${dateString}`, error);
    }
    
    return null;
  }

  /**
   * Parse numeric value from API response
   */
  parseValue(valueString: string | number | null | undefined): number | null {
    if (valueString === null || valueString === undefined) return null;
    
    // Handle string numbers
    if (typeof valueString === 'string') {
      // Remove any currency symbols or commas
      const cleaned = valueString.replace(/[€$,\s]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? null : parsed;
    }
    
    // Handle numeric values
    if (typeof valueString === 'number') {
      return isNaN(valueString) ? null : valueString;
    }
    
    return null;
  }

  /**
   * Aggregate time series data by period
   */
  aggregateByPeriod(seriesData: TimeSeriesData, period: Period = 'daily'): TimeSeriesData {
    if (period === 'daily') {
      return seriesData; // No aggregation needed
    }

    const aggregated = {};
    const sortedDates = Object.keys(seriesData).sort();

    switch (period) {
      case 'weekly':
        return this.aggregateWeekly(seriesData, sortedDates);
      case 'monthly':
        return this.aggregateMonthly(seriesData, sortedDates);
      case 'quarterly':
        return this.aggregateQuarterly(seriesData, sortedDates);
      case 'yearly':
        return this.aggregateYearly(seriesData, sortedDates);
      default:
        return seriesData;
    }
  }

  /**
   * Aggregate data by weeks
   */
  aggregateWeekly(seriesData: TimeSeriesData, sortedDates: string[]): TimeSeriesData {
    const weekly = {};
    
    sortedDates.forEach(date => {
      const dateObj = new Date(date);
      const weekStart = this.getWeekStart(dateObj);
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weekly[weekKey]) {
        weekly[weekKey] = 0;
      }
      
      weekly[weekKey] += seriesData[date];
    });
    
    return weekly;
  }

  /**
   * Aggregate data by months
   */
  aggregateMonthly(seriesData: TimeSeriesData, sortedDates: string[]): TimeSeriesData {
    const monthly = {};
    
    sortedDates.forEach(date => {
      const monthKey = date.substring(0, 7); // YYYY-MM
      
      if (!monthly[monthKey]) {
        monthly[monthKey] = 0;
      }
      
      monthly[monthKey] += seriesData[date];
    });
    
    return monthly;
  }

  /**
   * Aggregate data by quarters
   */
  aggregateQuarterly(seriesData: TimeSeriesData, sortedDates: string[]): TimeSeriesData {
    const quarterly = {};
    
    sortedDates.forEach(date => {
      const dateObj = new Date(date);
      const year = dateObj.getFullYear();
      const quarter = Math.floor(dateObj.getMonth() / 3) + 1;
      const quarterKey = `${year}-Q${quarter}`;
      
      if (!quarterly[quarterKey]) {
        quarterly[quarterKey] = 0;
      }
      
      quarterly[quarterKey] += seriesData[date];
    });
    
    return quarterly;
  }

  /**
   * Aggregate data by years
   */
  aggregateYearly(seriesData: TimeSeriesData, sortedDates: string[]): TimeSeriesData {
    const yearly = {};
    
    sortedDates.forEach(date => {
      const yearKey = date.substring(0, 4); // YYYY
      
      if (!yearly[yearKey]) {
        yearly[yearKey] = 0;
      }
      
      yearly[yearKey] += seriesData[date];
    });
    
    return yearly;
  }

  /**
   * Get start of week (Monday)
   */
  getWeekStart(date: Date): Date {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(date.setDate(diff));
  }

  /**
   * Fill missing dates in time series
   */
  fillMissingDates(seriesData: TimeSeriesData, startDate: string, endDate: string, fillValue: number = 0): TimeSeriesData {
    const filled = { ...seriesData };
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateKey = date.toISOString().split('T')[0];
      if (!(dateKey in filled)) {
        filled[dateKey] = fillValue;
      }
    }
    
    return filled;
  }

  /**
   * Calculate moving averages
   */
  calculateMovingAverage(seriesData: TimeSeriesData, windowSize: number = 7): TimeSeriesData {
    const sortedDates = Object.keys(seriesData).sort();
    const movingAverages = {};
    
    for (let i = windowSize - 1; i < sortedDates.length; i++) {
      const window = sortedDates.slice(i - windowSize + 1, i + 1);
      const average = window.reduce((sum, date) => sum + seriesData[date], 0) / windowSize;
      movingAverages[sortedDates[i]] = average;
    }
    
    return movingAverages;
  }

  /**
   * Validate time series data
   */
  validate(normalizedData: NormalizedMetricData): string[] {
    const errors = [];
    
    if (!normalizedData.merchant?.current) {
      errors.push('Missing merchant current data');
    }
    
    // Check for reasonable date range
    if (normalizedData.merchant?.current) {
      const dates = Object.keys(normalizedData.merchant.current);
      if (dates.length === 0) {
        errors.push('No data points in time series');
      } else {
        const sortedDates = dates.sort();
        const firstDate = new Date(sortedDates[0]);
        const lastDate = new Date(sortedDates[sortedDates.length - 1]);
        const daysDiff = (lastDate - firstDate) / (1000 * 60 * 60 * 24);
        
        if (daysDiff > 730) { // More than 2 years
          errors.push('Time series spans more than 2 years, may indicate data issues');
        }
      }
    }
    
    return errors;
  }
}

// Export singleton instance
export const timeSeriesNormalizer = new TimeSeriesNormalizer();
export default timeSeriesNormalizer;