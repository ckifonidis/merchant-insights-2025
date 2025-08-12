import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import { 
  selectDataLoading,
  selectDataErrors 
} from '../../store/selectors/dataSelectors';

// Import the presentational component
import PresentationalBreakdownChart from '../ui/charts/PresentationalBreakdownChart';

// TypeScript interfaces
export interface BreakdownDataPoint {
  category: string;
  merchant: number;
  competitor: number;
  merchantAbsolute?: number;
  competitorAbsolute?: number;
}

interface GenericBreakdownChartContainerProps {
  title: string;
  metricId: string;
  colors: Record<string, string>;
  formatValue?: (value: number) => string;
  formatTooltipValue?: (value: number) => string;
  showAbsoluteValues?: boolean;
  note?: string;
}

/**
 * Generic Breakdown Chart Container Component
 * 
 * Smart container component that connects to Redux store for breakdown metrics,
 * processes data with percentage calculations, and passes to presentational component.
 * Handles revenue by channel, customers by gender, and other breakdown metrics.
 */
const GenericBreakdownChartContainer: React.FC<GenericBreakdownChartContainerProps> = ({
  title,
  metricId,
  colors,
  formatValue = (value) => `${value}%`,
  formatTooltipValue,
  showAbsoluteValues = false,
  note
}) => {
  // Memoized selector for raw metric data
  const selectRawMetricData = useMemo(() => {
    return createSelector(
      [state => state.data.metrics],
      (metrics: any) => {
        const metric = metrics?.[metricId];
        
        // Debug logging for gender metric specifically
        if (metricId === 'converted_customers_by_gender') {
          console.log(`🔍 Gender metric selector - metricId: ${metricId}`);
          console.log(`🔍 Gender metric raw:`, metric);
          console.log(`🔍 Gender merchant.current exists:`, !!metric?.merchant?.current);
        }
        
        if (!metric?.merchant?.current) return null;
        
        const result = {
          merchant: metric.merchant,
          competitor: metric.competitor || {}
        };
        
        // Debug logging for gender metric specifically
        if (metricId === 'converted_customers_by_gender') {
          console.log(`🔍 Gender selector result:`, result);
        }
        
        return result;
      }
    );
  }, [metricId]);

  const rawData = useSelector(selectRawMetricData);
  const loading = useSelector(selectDataLoading);
  const errors = useSelector(selectDataErrors);
  
  // Check for specific loading/error states
  const isLoading = loading?.metrics || loading?.specificMetrics?.[metricId] || false;
  const error = errors?.metrics || errors?.specificMetrics?.[metricId] || null;

  // Calculate breakdown data from raw metric data
  const processedData = useMemo((): BreakdownDataPoint[] => {
    // Debug logging for gender metric specifically
    if (metricId === 'converted_customers_by_gender') {
      console.log(`🔍 Gender processing - rawData:`, rawData);
      console.log(`🔍 Gender processing - metricId:`, metricId);
    }
    
    if (!rawData || !metricId) {
      if (metricId === 'converted_customers_by_gender') {
        console.log(`❌ Gender processing failed - no rawData or metricId`);
      }
      return [];
    }

    // Handle revenue_by_channel specifically
    if (metricId === 'revenue_by_channel') {
      const merchantData = rawData.merchant;
      const competitorData = rawData.competitor;
      
      // Calculate totals for percentage calculation
      const merchantTotal = (merchantData.physical || 0) + (merchantData.ecommerce || 0);
      const competitorTotal = (competitorData.physical || 0) + (competitorData.ecommerce || 0);
      
      return [
        {
          category: 'Physical Store',
          merchant: merchantTotal > 0 ? Number((((merchantData.physical || 0) / merchantTotal) * 100).toFixed(2)) : 0,
          competitor: competitorTotal > 0 ? Number((((competitorData.physical || 0) / competitorTotal) * 100).toFixed(2)) : 0,
          merchantAbsolute: merchantData.physical || 0,
          competitorAbsolute: competitorData.physical || 0
        },
        {
          category: 'E-commerce', 
          merchant: merchantTotal > 0 ? Number((((merchantData.ecommerce || 0) / merchantTotal) * 100).toFixed(2)) : 0,
          competitor: competitorTotal > 0 ? Number((((competitorData.ecommerce || 0) / competitorTotal) * 100).toFixed(2)) : 0,
          merchantAbsolute: merchantData.ecommerce || 0,
          competitorAbsolute: competitorData.ecommerce || 0
        }
      ];
    }

    // Handle converted_customers_by_gender - normalized data stored as flat object
    if (metricId === 'converted_customers_by_gender') {
      const merchantData = rawData.merchant?.current || {};
      const competitorData = rawData.competitor?.current || {};
      
      // Gender categories are stored as keys in the normalized data
      const genderCategories = ['male', 'female', 'other'];
      
      // Calculate totals for percentage calculation
      const merchantTotal = genderCategories.reduce((sum, gender) => sum + (merchantData[gender] || 0), 0);
      const competitorTotal = genderCategories.reduce((sum, gender) => sum + (competitorData[gender] || 0), 0);
      
      // Map gender keys to display names
      const genderLabels: Record<string, string> = {
        'male': 'Male',
        'female': 'Female', 
        'other': 'Other'
      };
      
      return genderCategories
        .filter(gender => merchantData[gender] || competitorData[gender]) // Only include genders with data
        .map(gender => {
          const merchantValue = merchantData[gender] || 0;
          const competitorValue = competitorData[gender] || 0;
          
          return {
            category: genderLabels[gender],
            merchant: merchantTotal > 0 ? Number(((merchantValue / merchantTotal) * 100).toFixed(2)) : 0,
            competitor: competitorTotal > 0 ? Number(((competitorValue / competitorTotal) * 100).toFixed(2)) : 0,
            merchantAbsolute: merchantValue,
            competitorAbsolute: competitorValue
          };
        });
    }

    // Handle converted_customers_by_age - normalized data stored as flat object
    if (metricId === 'converted_customers_by_age') {
      const merchantData = rawData.merchant?.current || {};
      const competitorData = rawData.competitor?.current || {};
      
      // Age groups are stored as keys in the normalized data
      const ageGroups = ['18-24', '25-40', '41-56', '57-75', '76-96'];
      
      // Calculate totals for percentage calculation
      const merchantTotal = ageGroups.reduce((sum, age) => sum + (merchantData[age] || 0), 0);
      const competitorTotal = ageGroups.reduce((sum, age) => sum + (competitorData[age] || 0), 0);
      
      return ageGroups.map(ageGroup => {
        const merchantValue = merchantData[ageGroup] || 0;
        const competitorValue = competitorData[ageGroup] || 0;
        
        return {
          category: ageGroup,
          merchant: merchantTotal > 0 ? Number(((merchantValue / merchantTotal) * 100).toFixed(2)) : 0,
          competitor: competitorTotal > 0 ? Number(((competitorValue / competitorTotal) * 100).toFixed(2)) : 0,
          merchantAbsolute: merchantValue,
          competitorAbsolute: competitorValue
        };
      });
    }

    // Handle converted_customers_by_interest - normalized data stored as flat object with SHOPINT keys
    if (metricId === 'converted_customers_by_interest') {
      const merchantData = rawData.merchant?.current || {};
      const competitorData = rawData.competitor?.current || {};
      
      // Get all SHOPINT categories from the data and sort by merchant value
      const allShopintKeys = Object.keys(merchantData).filter(key => key.startsWith('SHOPINT'));
      const sortedByValue = allShopintKeys
        .map(key => ({ key, value: merchantData[key] || 0 }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6) // Top 6 interests
        .map(item => item.key);
      
      // Calculate totals for percentage calculation (only for top categories)
      const merchantTotal = sortedByValue.reduce((sum, key) => sum + (merchantData[key] || 0), 0);
      const competitorTotal = sortedByValue.reduce((sum, key) => sum + (competitorData[key] || 0), 0);
      
      // Map SHOPINT codes to display names
      const interestLabels: Record<string, string> = {
        'SHOPINT1': 'Shopping & Fashion',
        'SHOPINT2': 'Electronics & Technology', 
        'SHOPINT3': 'Food & Dining',
        'SHOPINT4': 'Health & Beauty',
        'SHOPINT5': 'Home & Garden',
        'SHOPINT6': 'Sports & Fitness',
        'SHOPINT7': 'Books & Education',
        'SHOPINT8': 'Travel & Tourism',
        'SHOPINT9': 'Entertainment',
        'SHOPINT10': 'Automotive',
        'SHOPINT11': 'Financial Services',
        'SHOPINT12': 'Real Estate',
        'SHOPINT13': 'Professional Services',
        'SHOPINT14': 'Insurance',
        'SHOPINT15': 'Other'
      };
      
      return sortedByValue.map(shopintKey => {
        const merchantValue = merchantData[shopintKey] || 0;
        const competitorValue = competitorData[shopintKey] || 0;
        
        return {
          category: interestLabels[shopintKey] || shopintKey,
          merchant: merchantTotal > 0 ? Number(((merchantValue / merchantTotal) * 100).toFixed(2)) : 0,
          competitor: competitorTotal > 0 ? Number(((competitorValue / competitorTotal) * 100).toFixed(2)) : 0,
          merchantAbsolute: merchantValue,
          competitorAbsolute: competitorValue
        };
      });
    }

    // Default case - no data
    return [];
  }, [rawData, metricId]);

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {title}
      </h3>
      <PresentationalBreakdownChart
        data={processedData}
        colors={colors}
        formatValue={formatValue}
        formatTooltipValue={formatTooltipValue}
        showAbsoluteValues={showAbsoluteValues}
        note={note}
        loading={isLoading}
        error={error}
      />
    </div>
  );
};

export default GenericBreakdownChartContainer;