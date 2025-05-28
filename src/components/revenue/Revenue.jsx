import { useTranslation } from 'react-i18next';
import RevenueMetrics from './RevenueMetrics';
import RevenueTrendChart from '../charts/RevenueTrendChart.jsx';
import RevenueChangeChart from '../charts/RevenueChangeChart.jsx';
import RevenueByInterestsChart from '../charts/RevenueByInterestsChart.jsx';
import RevenueByChannelChart from '../charts/RevenueByChannelChart.jsx';
import CampaignButton from '../ui/CampaignButton';

const Revenue = ({ filters }) => {
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Revenue Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('revenue.title')}
        </h1>
        <p className="text-gray-600">
          {t('revenue.subtitle')}
        </p>
      </div>

      {/* Revenue Metrics */}
      <RevenueMetrics filters={filters} />

      {/* Revenue Charts - Stacked vertically on mobile */}
      <div className="space-y-6">
        {/* Revenue Trend Chart */}
        <RevenueTrendChart filters={filters} />

        {/* Revenue Change Chart */}
        <RevenueChangeChart filters={filters} />

        {/* Additional Charts in Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue by Shopping Interests */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('revenue.byShoppingInterests')}
            </h3>
            <RevenueByInterestsChart filters={filters} />
          </div>

          {/* Revenue by Channel */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('revenue.byChannel')}
            </h3>
            <RevenueByChannelChart filters={filters} />
          </div>
        </div>
      </div>

      {/* Campaign Button */}
      <CampaignButton />
    </div>
  );
};

export default Revenue;
