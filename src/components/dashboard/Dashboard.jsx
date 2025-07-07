import { useTranslation } from 'react-i18next';
import { getIcon } from '../../utils/configHelpers.jsx';
import { UniversalMetricCard, TimeSeriesChart } from '../ui';
import { METRIC_VARIANTS } from '../../utils/constants';
import CampaignButton from '../ui/CampaignButton';
import { useDashboardDataWithYearComparison } from '../../hooks/useTabData.js';

const Dashboard = ({ filters }) => {
  const { t } = useTranslation();
  const { 
    current: data, 
    previous: previousData, 
    dateRanges, 
    loading, 
    error, 
    refresh,
    hasPreviousYearData 
  } = useDashboardDataWithYearComparison();




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

      {/* Dashboard Metrics - Auto-calculating YoY from API data */}
      <div className="space-y-4 mb-8">
        <UniversalMetricCard
          variant={METRIC_VARIANTS.detailed}
          title={t('dashboard.totalRevenue')}
          icon={
            <div className="text-green-600">
              {getIcon('dollar-sign', "w-5 h-5")}
            </div>
          }
          metricId="total_revenue"
          currentData={data}
          previousData={previousData}
          valueType="currency"
        />
        
        <UniversalMetricCard
          variant={METRIC_VARIANTS.detailed}
          title={t('dashboard.totalTransactions')}
          icon={
            <div className="text-blue-600">
              {getIcon('shopping-bag', "w-5 h-5")}
            </div>
          }
          metricId="total_transactions"
          currentData={data}
          previousData={previousData}
          valueType="number"
        />
        
        <UniversalMetricCard
          variant={METRIC_VARIANTS.detailed}
          title={t('dashboard.avgTransaction')}
          icon={
            <div className="text-purple-600">
              {getIcon('pie-chart', "w-5 h-5")}
            </div>
          }
          metricId="avg_ticket_per_user"
          currentData={data}
          previousData={previousData}
          valueType="currency"
        />
      </div>

      {/* Dashboard Charts - Using unified TimeSeriesChart */}
      <div className="space-y-6">
        <TimeSeriesChart
          filters={filters}
          dataType="revenue"
          title={t('dashboard.revenue')}
          showComparison={true}
          apiData={data.revenueTimeSeries}
        />

        <TimeSeriesChart
          filters={filters}
          dataType="transactions"
          title={t('dashboard.transactions')}
          showComparison={true}
          apiData={data.transactionsTimeSeries}
        />

        <TimeSeriesChart
          filters={filters}
          dataType="customers"
          title={t('dashboard.customers')}
          showComparison={false}
          apiData={data.customersTimeSeries}
        />
      </div>

      {/* Campaign Button */}
      <CampaignButton />
    </div>
  );
};

export default Dashboard;
