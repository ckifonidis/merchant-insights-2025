import { useTranslation } from 'react-i18next';
import CampaignButton from '../ui/CampaignButton';
import { useMetricData } from '../../hooks/useNormalizedData.js';
import CompetitionRevenueMetric from './metrics/CompetitionRevenueMetric.jsx';
import CompetitionTransactionsMetric from './metrics/CompetitionTransactionsMetric.jsx';
import CompetitionAvgTransactionMetric from './metrics/CompetitionAvgTransactionMetric.jsx';
import CompetitionWeeklyTimelineChart from './charts/CompetitionWeeklyTimelineChart.jsx';
import CompetitionMonthlyHeatmapChart from './charts/CompetitionMonthlyHeatmapChart.jsx';

const Competition = ({ filters }) => {
  const { t } = useTranslation();

  // Competition metrics
  const competitionMetrics = [
    'total_revenue',
    'total_transactions',
    'avg_ticket_per_user',
    'revenue_per_day'
  ];

  // Get competition data with automatic fetching and year-over-year comparison
  const { data: competitionData, isLoading: loading, error } = useMetricData(competitionMetrics, { 
    autoFetch: true, 
    yearOverYear: true 
  });

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading competition metrics...</div>
        </div>
      </div>
    );
  }

  // Show error state if API call failed
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">Error loading competition metrics: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Competition Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('competition.title')}
        </h1>
        <p className="text-gray-600">
          {t('competition.subtitle')}
        </p>
      </div>

      {/* Competition Metrics - THREE ROWS as per requirements */}
      <div className="space-y-4 mb-8">
        <CompetitionRevenueMetric title={`${t('competition.revenue')} ${t('competition.merchantVsCompetition')}`} />
        <CompetitionTransactionsMetric title={`${t('competition.transactions')} ${t('competition.merchantVsCompetition')}`} />
        <CompetitionAvgTransactionMetric title={`${t('competition.avgTransactionAmount')} ${t('competition.merchantVsCompetition')}`} />
      </div>

      {/* Competition Charts - Using Bespoke Components */}
      <div className="space-y-6">
        <CompetitionWeeklyTimelineChart
          title={t('competition.weeklyTurnover')}
          filters={filters}
        />

        <CompetitionMonthlyHeatmapChart
          title={t('competition.monthlyTurnover')}
          filters={filters}
        />
      </div>

      {/* Campaign Button */}
      <CampaignButton />
    </div>
  );
};

export default Competition;
