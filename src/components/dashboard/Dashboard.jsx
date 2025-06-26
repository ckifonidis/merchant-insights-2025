import { useTranslation } from 'react-i18next';
import { getIcon } from '../../utils/configHelpers.jsx';
import { UniversalMetricCard, TimeSeriesChart } from '../ui';
import { METRIC_VARIANTS } from '../../utils/constants';
import CampaignButton from '../ui/CampaignButton';
import { useDashboardData } from '../../hooks/useTabData.js';

const Dashboard = ({ filters }) => {
  const { t } = useTranslation();
  const { data, loading, error, refresh } = useDashboardData();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading dashboard metrics...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">Error loading dashboard metrics: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Dashboard Header - Inlined */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('dashboard.title')}</h2>
        <p className="text-gray-600">{t('dashboard.subtitle')}</p>
      </div>

      {/* Dashboard Metrics - Using Redux Store */}
      <div className="space-y-4 mb-8">
        {data.totalRevenue && (
          <UniversalMetricCard
            variant={METRIC_VARIANTS.detailed}
            title={t('dashboard.totalRevenue')}
            icon={
              <div className="text-green-600">
                {getIcon('dollar-sign', "w-5 h-5")}
              </div>
            }
            merchantData={data.totalRevenue.merchant}
            competitorData={data.totalRevenue.competitor?.value ? data.totalRevenue.competitor : undefined}
          />
        )}
        
        {data.totalTransactions && (
          <UniversalMetricCard
            variant={METRIC_VARIANTS.detailed}
            title={t('dashboard.totalTransactions')}
            icon={
              <div className="text-blue-600">
                {getIcon('shopping-bag', "w-5 h-5")}
              </div>
            }
            merchantData={data.totalTransactions.merchant}
            competitorData={data.totalTransactions.competitor?.value ? data.totalTransactions.competitor : undefined}
          />
        )}
        
        {data.avgTransaction && (
          <UniversalMetricCard
            variant={METRIC_VARIANTS.detailed}
            title={t('dashboard.avgTransaction')}
            icon={
              <div className="text-purple-600">
                {getIcon('pie-chart', "w-5 h-5")}
              </div>
            }
            merchantData={data.avgTransaction.merchant}
            competitorData={data.avgTransaction.competitor?.value ? data.avgTransaction.competitor : undefined}
          />
        )}
      </div>

      {/* Dashboard Charts - Using unified TimeSeriesChart */}
      <div className="space-y-6">
        <TimeSeriesChart
          filters={filters}
          dataType="revenue"
          title={t('dashboard.revenue')}
          showComparison={true}
        />

        <TimeSeriesChart
          filters={filters}
          dataType="transactions"
          title={t('dashboard.transactions')}
          showComparison={true}
        />

        <TimeSeriesChart
          filters={filters}
          dataType="customers"
          title={t('dashboard.customers')}
          showComparison={false}
        />
      </div>

      {/* Campaign Button */}
      <CampaignButton />
    </div>
  );
};

export default Dashboard;
