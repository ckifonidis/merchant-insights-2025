import { useTranslation } from 'react-i18next';
import CampaignButton from '../ui/CampaignButton';
import TotalRevenueMetric from './metrics/TotalRevenueMetric.jsx';
import AvgDailyRevenueMetric from './metrics/AvgDailyRevenueMetric.jsx';
import AvgTransactionMetric from './metrics/AvgTransactionMetric.jsx';
import GoForMoreMetric from './metrics/GoForMoreMetric.jsx';
import RewardedAmountMetric from './metrics/RewardedAmountMetric.jsx';
import RedeemedAmountMetric from './metrics/RedeemedAmountMetric.jsx';
import RevenueTimeSeriesChart from './charts/RevenueTimeSeriesChart.jsx';
import RevenueChangeChart from './charts/RevenueChangeChart.jsx';
import RevenueByInterestsChart from './charts/RevenueByInterestsChart.jsx';
import RevenueByChannelChart from './charts/RevenueByChannelChart.jsx';
import { useRevenueDataNormalized } from '../../hooks/useNormalizedData.js';

const Revenue = ({ filters }) => {
  const { t } = useTranslation();
  
  // 1. Revenue triggers ONE batched API call for all revenue metrics
  const { data, loading, error, isLoading } = useRevenueDataNormalized();

  // 2. Show loading state while data is being fetched
  if (loading || isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading revenue metrics...</div>
        </div>
      </div>
    );
  }

  // 3. Show error state if API call failed
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">Error loading revenue metrics: {error}</div>
        </div>
      </div>
    );
  }



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

      {/* Revenue Metrics - Bespoke components handle configuration and data */}
      <div className="space-y-6 mb-8">
        {/* Regular Revenue Metrics */}
        <div className="space-y-4">
          <TotalRevenueMetric title={t('revenue.totalRevenue')} />
          <AvgDailyRevenueMetric title={t('revenue.avgDailyRevenue')} />
          <AvgTransactionMetric title={t('revenue.avgTransaction')} />
        </div>

        {/* Go For More Metrics */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {t('revenue.goForMore')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GoForMoreMetric title={t('revenue.goForMoreTotal')} />
            <RewardedAmountMetric title={t('revenue.rewarded')} />
            <RedeemedAmountMetric title={t('revenue.redeemed')} />
          </div>
        </div>
      </div>

      {/* Revenue Charts - Bespoke components handle configuration and data */}
      <div className="space-y-6">
        <RevenueTimeSeriesChart
          title={t('revenue.trends')}
          filters={filters}
        />

        <RevenueChangeChart
          title={t('revenue.changes')}
          filters={filters}
        />

        {/* Additional Charts in Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueByInterestsChart
            title={t('revenue.byShoppingInterests')}
            filters={filters}
          />

          <RevenueByChannelChart
            title={t('revenue.byChannel')}
            filters={filters}
          />
        </div>
      </div>

      {/* Campaign Button */}
      <CampaignButton />
    </div>
  );
};

export default Revenue;
