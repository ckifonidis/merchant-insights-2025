import { useTranslation } from 'react-i18next';
import { competitionMetrics, weeklyTurnoverData } from '../../data/mockData.js';
import { UniversalMetricCard, UniversalTimelineChart, UniversalCalendarHeatmap } from '../ui';
import { METRIC_VARIANTS } from '../../utils/constants';
import { useCompetitionDataWithYearComparison } from '../../hooks/useTabData.js';
import CampaignButton from '../ui/CampaignButton';

const Competition = ({ filters }) => {
  const { t } = useTranslation();

  // Get competition data from API with year-over-year comparison
  const { 
    current: competitionApiData, 
    previous: previousCompetitionData, 
    dateRanges, 
    loading, 
    error,
    hasPreviousYearData 
  } = useCompetitionDataWithYearComparison();

  console.log('🎯 Competition year-over-year data:', { 
    current: competitionApiData, 
    previous: previousCompetitionData, 
    dateRanges,
    hasPrevious: hasPreviousYearData() 
  });

  // Icons for metrics
  const RevenueIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
      <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
    </svg>
  );

  const TransactionsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
      <path d="M3 6h18"></path>
      <path d="M16 10a4 4 0 0 1-8 0"></path>
    </svg>
  );

  const AvgTransactionIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
      <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );

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

      {/* Competition Metrics - Using UniversalMetricCard */}
      <div className="space-y-4 mb-8">
        {/* Revenue Metric */}
        <UniversalMetricCard
          variant={METRIC_VARIANTS.competition}
          title={t('competition.revenue')}
          icon={<RevenueIcon />}
          merchantData={{
            value: competitionMetrics.revenue.merchantChangeFromLastYear
          }}
          competitorData={{
            value: competitionMetrics.revenue.merchantVsCompetition,
            competitorChange: competitionMetrics.revenue.competitionChangeFromLastYear
          }}
        />

        {/* Transactions Metric */}
        <UniversalMetricCard
          variant={METRIC_VARIANTS.competition}
          title={t('competition.transactions')}
          icon={<TransactionsIcon />}
          merchantData={{
            value: competitionMetrics.transactions.merchantChangeFromLastYear
          }}
          competitorData={{
            value: competitionMetrics.transactions.merchantVsCompetition,
            competitorChange: competitionMetrics.transactions.competitionChangeFromLastYear
          }}
        />

        {/* Average Transaction Amount Metric */}
        <UniversalMetricCard
          variant={METRIC_VARIANTS.competition}
          title={t('competition.avgTransactionAmount')}
          icon={<AvgTransactionIcon />}
          merchantData={{
            value: competitionMetrics.avgTransactionAmount.merchantChangeFromLastYear
          }}
          competitorData={{
            value: competitionMetrics.avgTransactionAmount.merchantVsCompetition,
            competitorChange: competitionMetrics.avgTransactionAmount.competitionChangeFromLastYear
          }}
        />
      </div>

      {/* Competition Charts - Using Universal Components */}
      <div className="space-y-6">
        {/* Weekly Turnover Chart - Full width container */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('competition.weeklyTurnover')}
          </h3>
          <UniversalTimelineChart 
            data={weeklyTurnoverData}
            title={t('competition.weeklyTurnover')}
            filters={filters}
          />
        </div>

        {/* Monthly Turnover Heatmap - Full width container */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('competition.monthlyTurnover')}
          </h3>
          <UniversalCalendarHeatmap 
            title={t('competition.monthlyTurnover')}
            valueLabel="Turnover"
            filters={filters}
          />
        </div>
      </div>

      {/* Campaign Button */}
      <CampaignButton />
    </div>
  );
};

export default Competition;
