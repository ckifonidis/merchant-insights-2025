import { useTranslation } from 'react-i18next';
import CampaignButton from '../ui/CampaignButton';
import TotalRevenueMetric from './metrics/TotalRevenueMetric.jsx';
import TotalTransactionsMetric from './metrics/TotalTransactionsMetric.jsx';
import AvgTransactionMetric from './metrics/AvgTransactionMetric.jsx';
import RevenueTimeSeriesChart from './charts/RevenueTimeSeriesChart.jsx';
import TransactionsTimeSeriesChart from './charts/TransactionsTimeSeriesChart.jsx';
import CustomersTimeSeriesChart from './charts/CustomersTimeSeriesChart.jsx';
import { useDashboardDataNormalized } from '../../hooks/useNormalizedData.js';

const Dashboard = ({ filters }) => {
  const { t } = useTranslation();
  
  // 1. Dashboard triggers ONE batched API call for all dashboard metrics
  const { data, loading, error, isLoading } = useDashboardDataNormalized();

  // 2. Show loading state while data is being fetched
  if (loading || isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading dashboard metrics...</div>
        </div>
      </div>
    );
  }

  // 3. Show error state if API call failed
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

      {/* Dashboard Metrics - Bespoke components handle configuration and data */}
      <div className="space-y-4 mb-8">
        <TotalRevenueMetric title={t('dashboard.totalRevenue')} />
        <TotalTransactionsMetric title={t('dashboard.totalTransactions')} />
        <AvgTransactionMetric title={t('dashboard.avgTransaction')} />
      </div>

      {/* Dashboard Charts - Bespoke components handle configuration and data */}
      <div className="space-y-6">
        <RevenueTimeSeriesChart
          title={t('dashboard.revenue')}
          filters={filters}
        />

        <TransactionsTimeSeriesChart
          title={t('dashboard.transactions')}
          filters={filters}
        />

        <CustomersTimeSeriesChart
          title={t('dashboard.customers')}
          filters={filters}
        />
      </div>

      {/* Campaign Button */}
      <CampaignButton />
    </div>
  );
};

export default Dashboard;
