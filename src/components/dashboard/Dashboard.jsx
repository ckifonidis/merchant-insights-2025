import { useTranslation } from 'react-i18next';
import DashboardHeader from './DashboardHeader';
import DashboardMetrics from './DashboardMetrics';
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

      {/* Dashboard Metrics */}
      <DashboardMetrics filters={filters} />

      {/* Dashboard Charts - Stacked vertically on mobile */}
      <div className="space-y-6">
        {/* Revenue Chart */}
        <RevenueChart filters={filters} />

        {/* Transactions Chart */}
        <TransactionsChart filters={filters} />

        {/* Customers Chart */}
        <CustomersChart filters={filters} />
      </div>

      {/* Campaign Button */}
      <CampaignButton />
    </div>
  );
};

export default Dashboard;
