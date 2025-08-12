/**
 * Categorical Normalizer
 * Handles normalization of category-based metrics (breakdowns by gender, age, interests, etc.)
 */

interface CategoricalMetric {
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

interface CategoryData {
  [categoryName: string]: number;
}

interface NormalizedCategoricalData {
  current: CategoryData;
  previous?: CategoryData;
}

interface NormalizedMetricData {
  merchant?: NormalizedCategoricalData;
  competitor?: NormalizedCategoricalData;
}

interface CategorySummary {
  categoryCount: number;
  totalValue: number;
  averageValue: number;
  topCategory: string | null;
  topCategoryValue: number;
}

export class CategoricalNormalizer {
  /**
   * Normalize categorical metric data
   */
  normalize(metricID: string, metricData: { merchant?: CategoricalMetric[]; competitor?: CategoricalMetric[] }): NormalizedMetricData {
    console.log(`🔄 Normalizing categorical metric: ${metricID}`);
    
    const normalized = {};

    // Process merchant data
    if (metricData.merchant) {
      normalized.merchant = this.normalizeEntityData(metricData.merchant, metricID, 'merchant');
    }

    // Process competitor data
    if (metricData.competitor) {
      normalized.competitor = this.normalizeEntityData(metricData.competitor, metricID, 'competitor');
    }

    console.log(`✅ Categorical metric ${metricID} normalized:`, {
      merchant: normalized.merchant ? Object.keys(normalized.merchant.current || {}).length : 0,
      competitor: normalized.competitor ? Object.keys(normalized.competitor.current || {}).length : 0
    });

    return normalized;
  }

  /**
   * Normalize data for a specific entity (merchant or competitor)
   */
  normalizeEntityData(entityMetrics: CategoricalMetric[], metricID: string, entityType: string): NormalizedCategoricalData {
    const categoryData = {};

    entityMetrics.forEach((metric) => {
      if (metric.seriesValues && metric.seriesValues.length > 0) {
        // Process series values for categories
        metric.seriesValues.forEach((series) => {
          if (series.seriesPoints && series.seriesPoints.length > 0) {
            // For categorical breakdowns, each seriesPoint represents a different category
            series.seriesPoints.forEach((point) => {
              const categoryName = this.extractCategoryFromPoint(point.value2, metricID);
              const categoryValue = this.parseValue(point.value1);
              
              if (categoryName && categoryValue !== null) {
                categoryData[categoryName] = categoryValue;
              }
            });
          }
        });
      } else if (metric.scalarValue !== null) {
        // Some categorical metrics might come as scalar with category in metadata
        console.warn(`⚠️ Categorical metric ${metricID} has scalar value, may need category context`);
      }
    });

    // Apply metric-specific transformations
    const transformedData = this.applyMetricTransformations(metricID, categoryData);

    // Return in the expected format
    return {
      current: transformedData
      // previous will be added during year-over-year normalization
    };
  }

  /**
   * Extract category name from series ID
   */
  extractCategoryName(seriesID: string, metricID: string): string | null {
    if (!seriesID) return null;

    // Handle different naming conventions based on metric type
    switch (metricID) {
      case 'converted_customers_by_gender':
        return this.mapGenderCategory(seriesID);
      
      case 'converted_customers_by_age':
        return this.mapAgeCategory(seriesID);
      
      case 'converted_customers_by_interest':
        return this.mapInterestCategory(seriesID);
      
      case 'revenue_by_channel':
        return this.mapChannelCategory(seriesID);
      
      case 'transactions_by_geo':
        return this.mapGeographicCategory(seriesID);
      
      default:
        // Generic category name extraction
        return seriesID.toString();
    }
  }

  /**
   * Extract category name from seriesPoint value2 field
   */
  extractCategoryFromPoint(categoryValue: string, metricID: string): string | null {
    if (!categoryValue || categoryValue === '') {
      // Handle empty category values - might represent "other" or "uncategorized"
      if (metricID === 'converted_customers_by_interest') {
        return null; // Skip empty categories for shopping interests
      }
      return null;
    }

    // Handle different naming conventions based on metric type
    switch (metricID) {
      case 'converted_customers_by_gender':
        return this.mapGenderCategory(categoryValue);
      
      case 'converted_customers_by_age':
        return this.mapAgeCategory(categoryValue);
      
      case 'converted_customers_by_interest':
        return this.mapInterestCategory(categoryValue);
      
      case 'revenue_by_channel':
        return this.mapChannelCategory(categoryValue);
      
      case 'transactions_by_geo':
        return this.mapGeographicCategory(categoryValue);
      
      default:
        // Generic category name extraction
        return categoryValue.toString();
    }
  }

  /**
   * Map gender category names
   */
  mapGenderCategory(seriesID: string): string {
    const genderMapping = {
      'm': 'male',
      'f': 'female',
      'male': 'male',
      'female': 'female',
      'M': 'male',
      'F': 'female'
    };
    
    return genderMapping[seriesID] || seriesID;
  }

  /**
   * Map age category names
   */
  mapAgeCategory(seriesID: string): string {
    const ageMapping = {
      'generation_z': '18-24',
      'millennials': '25-40',
      'generation_x': '41-56', 
      'baby_boomers': '57-75',
      'silent_generation': '76-96',
      '18-24': '18-24',
      '25-40': '25-40',
      '41-56': '41-56',
      '57-75': '57-75',
      '76-96': '76-96'
    };
    
    return ageMapping[seriesID] || seriesID;
  }

  /**
   * Map shopping interest categories
   */
  mapInterestCategory(seriesID: string | number): string {
    // Keep SHOPINT format but ensure consistency
    if (typeof seriesID === 'string' && seriesID.toUpperCase().startsWith('SHOPINT')) {
      return seriesID.toUpperCase();
    }
    
    // Handle numeric interest IDs
    if (typeof seriesID === 'number' || /^\d+$/.test(seriesID)) {
      return `SHOPINT${seriesID}`;
    }
    
    return seriesID;
  }

  /**
   * Map channel categories
   */
  mapChannelCategory(seriesID: string): string {
    const channelMapping = {
      'physical': 'physical',
      'ecommerce': 'ecommerce',
      'e-commerce': 'ecommerce',
      'online': 'ecommerce',
      'store': 'physical',
      'retail': 'physical'
    };
    
    return channelMapping[seriesID?.toLowerCase()] || seriesID;
  }

  /**
   * Map geographic categories
   */
  mapGeographicCategory(seriesID: string): string {
    // Geographic names should be preserved as-is
    // May need special handling for Greek character encoding
    return seriesID;
  }

  /**
   * Aggregate values for a category from series points
   */
  aggregateCategoryValue(seriesPoints: SeriesPoint[]): number | null {
    if (!seriesPoints || seriesPoints.length === 0) return null;
    
    let totalValue = 0;
    let validPoints = 0;
    
    seriesPoints.forEach(point => {
      const value = this.parseValue(point.value1);
      if (value !== null) {
        totalValue += value;
        validPoints++;
      }
    });
    
    return validPoints > 0 ? totalValue : null;
  }

  /**
   * Parse numeric value from API response
   */
  parseValue(valueString: string | number | null | undefined): number | null {
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
    
    return null;
  }

  /**
   * Apply metric-specific transformations
   */
  applyMetricTransformations(metricID: string, categoryData: CategoryData): CategoryData {
    // Store raw absolute values - percentage calculations happen in components
    return { ...categoryData };
  }

  /**
   * Normalize values to percentages that sum to 100%
   */
  normalizePercentages(categoryData: CategoryData): CategoryData {
    const values = Object.values(categoryData);
    const total = values.reduce((sum, val) => sum + (val || 0), 0);
    
    if (total === 0) return categoryData;
    
    const normalized = {};
    Object.keys(categoryData).forEach(category => {
      normalized[category] = (categoryData[category] / total) * 100;
    });
    
    return normalized;
  }

  /**
   * Calculate percentages while keeping absolute values
   */
  calculateRevenuePercentages(categoryData: CategoryData): CategoryData {
    const total = Object.values(categoryData).reduce((sum, val) => sum + (val || 0), 0);
    
    if (total === 0) return categoryData;
    
    // For revenue data, we might want to preserve absolute values
    // and add percentage information separately
    const result = {};
    Object.keys(categoryData).forEach(category => {
      result[category] = categoryData[category];
    });
    
    return result;
  }

  /**
   * Fill missing categories with default values
   */
  fillMissingCategories(categoryData: CategoryData, metricID: string, fillValue: number = 0): CategoryData {
    const expectedCategories = this.getExpectedCategories(metricID);
    const filled = { ...categoryData };
    
    expectedCategories.forEach(category => {
      if (!(category in filled)) {
        filled[category] = fillValue;
      }
    });
    
    return filled;
  }

  /**
   * Get expected categories for a metric
   */
  getExpectedCategories(metricID: string): string[] {
    switch (metricID) {
      case 'converted_customers_by_gender':
        return ['male', 'female'];
      
      case 'converted_customers_by_age':
        return ['18-24', '25-40', '41-56', '57-75', '76-96'];
      
      case 'converted_customers_by_interest':
        return Array.from({ length: 15 }, (_, i) => `SHOPINT${i + 1}`);
      
      case 'revenue_by_channel':
        return ['ecommerce', 'physical'];
      
      case 'transactions_by_geo':
        // Greek regions - return major ones, full list could be loaded dynamically
        return [
          'ΑΤΤΙΚΗ', 'ΚΕΝΤΡΙΚΗ ΜΑΚΕΔΟΝΙΑ', 'ΘΕΣΣΑΛΙΑ', 'ΚΕΝΤΡΙΚΗ ΕΛΛΑΔΑ',
          'ΔΥΤΙΚΗ ΕΛΛΑΔΑ', 'ΠΕΛΟΠΟΝΝΗΣΟΣ', 'ΚΡΗΤΗ'
        ];
      
      default:
        return [];
    }
  }

  /**
   * Sort categories in logical order
   */
  sortCategories(categoryData: CategoryData, metricID: string): string[] {
    const keys = Object.keys(categoryData);
    
    switch (metricID) {
      case 'converted_customers_by_age':
        // Sort age groups in chronological order
        const ageOrder = ['18-24', '25-40', '41-56', '57-75', '76-96'];
        return keys.sort((a, b) => ageOrder.indexOf(a) - ageOrder.indexOf(b));
      
      case 'converted_customers_by_interest':
        // Sort shopping interests numerically
        return keys.sort((a, b) => {
          const numA = parseInt(a.replace('SHOPINT', '')) || 0;
          const numB = parseInt(b.replace('SHOPINT', '')) || 0;
          return numA - numB;
        });
      
      case 'revenue_by_channel':
        // Sort with ecommerce first
        const channelOrder = ['ecommerce', 'physical'];
        return keys.sort((a, b) => channelOrder.indexOf(a) - channelOrder.indexOf(b));
      
      default:
        // Default alphabetical sort
        return keys.sort();
    }
  }

  /**
   * Validate categorical data
   */
  validate(normalizedData: NormalizedMetricData, metricID: string): string[] {
    const errors = [];
    
    if (!normalizedData.merchant?.current) {
      errors.push('Missing merchant current data');
    }
    
    // Validate category data
    if (normalizedData.merchant?.current) {
      const categoryData = normalizedData.merchant.current;
      const categories = Object.keys(categoryData);
      
      if (categories.length === 0) {
        errors.push('No categories found in data');
      }
      
      // Check for negative values in percentage metrics
      const percentageMetrics = [
        'converted_customers_by_gender',
        'converted_customers_by_age', 
        'converted_customers_by_interest',
        'transactions_by_geo'
      ];
      
      if (percentageMetrics.includes(metricID)) {
        categories.forEach(category => {
          const value = categoryData[category];
          if (value < 0) {
            errors.push(`Negative percentage value for category ${category}: ${value}`);
          }
          if (value > 100) {
            errors.push(`Percentage value over 100% for category ${category}: ${value}`);
          }
        });
        
        // Check if percentages roughly sum to 100% (allow some tolerance for rounding)
        const total = categories.reduce((sum, cat) => sum + (categoryData[cat] || 0), 0);
        if (Math.abs(total - 100) > 5) {
          errors.push(`Percentages don't sum to 100%: ${total}%`);
        }
      }
    }
    
    return errors;
  }

  /**
   * Create category summary statistics
   */
  createCategorySummary(categoryData: CategoryData): CategorySummary {
    const values = Object.values(categoryData).filter(v => v !== null && !isNaN(v));
    
    if (values.length === 0) {
      return {
        categoryCount: 0,
        totalValue: 0,
        averageValue: 0,
        topCategory: null,
        topCategoryValue: 0
      };
    }
    
    const totalValue = values.reduce((sum, val) => sum + val, 0);
    const averageValue = totalValue / values.length;
    
    // Find top category
    let topCategory = null;
    let topCategoryValue = 0;
    Object.keys(categoryData).forEach(category => {
      if (categoryData[category] > topCategoryValue) {
        topCategory = category;
        topCategoryValue = categoryData[category];
      }
    });
    
    return {
      categoryCount: values.length,
      totalValue,
      averageValue,
      topCategory,
      topCategoryValue
    };
  }
}

// Export singleton instance
export const categoricalNormalizer = new CategoricalNormalizer();
export default categoricalNormalizer;