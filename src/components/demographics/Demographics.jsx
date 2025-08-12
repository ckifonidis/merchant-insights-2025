import { useTranslation } from 'react-i18next';
import { useDemographicsData } from '../../hooks/useNormalizedData.js';
import CampaignButton from '../ui/CampaignButton';
import TotalCustomersMetric from './metrics/TotalCustomersMetric.jsx';
import CustomersByGenderChart from './charts/CustomersByGenderChart.jsx';
import CustomersByAgeChart from './charts/CustomersByAgeChart.jsx';
import CustomersByInterestsChart from './charts/CustomersByInterestsChart.jsx';

const Demographics = ({ filters }) => {
  const { t } = useTranslation();
  
  // Get demographics data with automatic fetching and year-over-year comparison
  const { data: demographicsData, isLoading: loading, error } = useDemographicsData();

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
        <TotalCustomersMetric title={t('demographics.totalCustomers')} />
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
