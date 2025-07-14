import { useTranslation } from 'react-i18next';
import { useTabData, DEMOGRAPHICS_METRIC_IDS } from '../../hooks/useTabData.js';
import { useEffect } from 'react';
import CampaignButton from '../ui/CampaignButton';
import TotalCustomersMetric from './metrics/TotalCustomersMetric.jsx';
import CustomersByGenderChart from './charts/CustomersByGenderChart.jsx';
import CustomersByAgeChart from './charts/CustomersByAgeChart.jsx';
import CustomersByInterestsChart from './charts/CustomersByInterestsChart.jsx';

const Demographics = ({ filters }) => {
  const { t } = useTranslation();
  
  // Get data utilities from simplified hook
  const { 
    allMetricsData, 
    getMetricsData, 
    loading, 
    error, 
    filtersChanged,
    fetchDataWithYearComparison,
    markFiltersApplied
  } = useTabData();
  
  // Get demographics-specific data
  const demographicsData = getMetricsData(DEMOGRAPHICS_METRIC_IDS);
  
  // Fetch demographics data on mount
  useEffect(() => {
    fetchDataWithYearComparison(DEMOGRAPHICS_METRIC_IDS, {
      metricSpecificFilters: {
        'converted_customers_by_interest': {
          interest_type: 'customers'
        }
      }
    });
  }, [fetchDataWithYearComparison]);
  
  // Fetch data when filters change
  useEffect(() => {
    if (filtersChanged) {
      fetchDataWithYearComparison(DEMOGRAPHICS_METRIC_IDS, {
        metricSpecificFilters: {
          'converted_customers_by_interest': {
            interest_type: 'customers'
          }
        }
      });
      markFiltersApplied();
    }
  }, [filtersChanged, fetchDataWithYearComparison, markFiltersApplied]);

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading demographics metrics...</div>
        </div>
      </div>
    );
  }

  // Show error state if API call failed
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">Error loading demographics data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Demographics Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('demographics.title')}
        </h1>
        <p className="text-gray-600">
          {t('demographics.subtitle')}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TotalCustomersMetric title={t('demographics.totalCustomers')} />
        </div>
      </div>

      {/* Charts Section */}
      <div className="space-y-8">
        {/* Gender Chart */}
        <CustomersByGenderChart title={t('demographics.customersByGender')} />

        {/* Age Group Chart */}
        <CustomersByAgeChart title={t('demographics.customersByAge')} />

        {/* Shopping Interests Chart */}
        <CustomersByInterestsChart title={t('demographics.customersByInterests')} />
      </div>

      {/* Campaign Button */}
      <CampaignButton />
    </div>
  );
};

export default Demographics;
