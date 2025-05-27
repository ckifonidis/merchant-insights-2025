import { useTranslation } from 'react-i18next';
import DashboardHeader from './DashboardHeader';
import KeyMetrics from './KeyMetrics';
import TransactionsChart from '../charts/TransactionsChart';
import RevenueChart from '../charts/RevenueChart';
import CustomersChart from '../charts/CustomersChart';
import MonthlyTurnoverHeatmap from '../charts/MonthlyTurnoverHeatmap';
import GeographicPerformance from '../charts/GeographicPerformance';
import CampaignButton from '../ui/CampaignButton';

const Dashboard = ({ filters }) => {
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Dashboard Heading */}
      <DashboardHeader />

      {/* Key Metrics */}
      <KeyMetrics filters={filters} />

      {/* Dashboard Charts - Stacked vertically on mobile */}
      <div className="space-y-6">
        {/* Transactions Chart */}
        <TransactionsChart filters={filters} />

        {/* Revenue Chart */}
        <RevenueChart filters={filters} />

        {/* Customers Chart */}
        <CustomersChart filters={filters} />

        {/* Additional Charts in Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Revenue Heatmap */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('dashboard.revenue')} {t('chartOptions.monthly')} Calendar
            </h3>
            <MonthlyTurnoverHeatmap filters={filters} />
          </div>

          {/* Geographic Performance */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('dashboard.revenue')} by Location
            </h3>
            <GeographicPerformance filters={filters} />
          </div>
        </div>
      </div>

      {/* Campaign Button */}
      <CampaignButton />
    </div>
  );
};

export default Dashboard;
