import { useTranslation } from 'react-i18next';
import KeyMetrics from '../dashboard/KeyMetrics';
import GenderChart from '../charts/GenderChart.jsx';
import AgeGroupChart from '../charts/AgeGroupChart.jsx';
import ShoppingFrequencyChart from '../charts/ShoppingFrequencyChart.jsx';
import ShoppingInterestsChart from '../charts/ShoppingInterestsChart.jsx';
import CampaignButton from '../ui/CampaignButton';

const Demographics = ({ filters }) => {
  const { t } = useTranslation();

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
        <KeyMetrics tabId="demographics" filters={filters} />
      </div>

      {/* Charts Section */}
      <div className="space-y-8">
        {/* Gender Chart */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('demographics.customersByGender')}
          </h3>
          <GenderChart filters={filters} />
        </div>

        {/* Age Group Chart */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('demographics.customersByAge')}
          </h3>
          <AgeGroupChart filters={filters} />
        </div>

        {/* Additional Charts in Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Shopping Frequency Chart */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('demographics.customersByFrequency')}
            </h3>
            <ShoppingFrequencyChart filters={filters} />
          </div>

          {/* Shopping Interests Chart */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('demographics.customersByInterests')}
            </h3>
            <ShoppingInterestsChart filters={filters} />
          </div>
        </div>
      </div>

      {/* Campaign Button */}
      <CampaignButton />
    </div>
  );
};

export default Demographics;
