import React from 'react';
import { useTranslation } from 'react-i18next';
import CampaignButton from '../ui/CampaignButton';
import { useMetricData } from '../../hooks/useNormalizedData';
import GenericMetricContainer from '../containers/GenericMetricContainer';
import GenericTimeSeriesChartContainer from '../containers/GenericTimeSeriesChartContainer';
import GenericCalendarHeatmapContainer from '../containers/GenericCalendarHeatmapContainer';
import { selectRevenuePerDay } from '../../store/selectors/dataSelectors';

// TypeScript interfaces
interface UIDateRange {
  start?: string;
  end?: string;
}

interface Filters {
  dateRange?: UIDateRange;
}

interface CompetitionProps {
  filters?: Filters;
}

const Competition: React.FC<CompetitionProps> = ({ filters }) => {
  const { t } = useTranslation();

  // Competition metrics
  const competitionMetrics = [
    'total_revenue',
    'total_transactions',
    'avg_ticket_per_user',
    'revenue_per_day'
  ];

  // Get competition data with automatic fetching and year-over-year comparison
  const { isLoading: loading, error } = useMetricData(competitionMetrics, { 
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

      {/* Competition Metrics - Direct container configuration like Dashboard */}
      <div className="space-y-4 mb-8">
        <GenericMetricContainer
          title={`${t('competition.revenue')} ${t('competition.merchantVsCompetition')}`}
          metricId="total_revenue"
          valueType="currency"
          icon={
            <div className="text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
          }
          variant="competition"
        />
        
        <GenericMetricContainer
          title={`${t('competition.transactions')} ${t('competition.merchantVsCompetition')}`}
          metricId="total_transactions"
          valueType="number"
          icon={
            <div className="text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="8" x2="21" y2="8"></line>
                <path d="M16 4h-8v4h8V4z"></path>
              </svg>
            </div>
          }
          variant="competition"
        />
        
        <GenericMetricContainer
          title={`${t('competition.avgTransactionAmount')} ${t('competition.merchantVsCompetition')}`}
          metricId="avg_ticket_per_user"
          valueType="currency"
          icon={
            <div className="text-purple-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
              </svg>
            </div>
          }
          variant="competition"
        />
      </div>

      {/* Competition Charts - Direct container configuration like Dashboard */}
      <div className="space-y-6">
        <GenericTimeSeriesChartContainer
          title={t('competition.weeklyTurnover')}
          metricId="revenue_per_day"
          selector={selectRevenuePerDay}
          formatValue={(value: number) => `${value.toFixed(1)}%`}
          showCompetitor={true}
          merchantLabel="Merchant"
          hasCompetitorData={true}
          filters={filters}
        />

        <GenericCalendarHeatmapContainer
          title={t('competition.monthlyTurnover')}
          metricId="revenue_per_day"
          valueLabel="Revenue"
          showMerchantAndCompetition={true}
          dateRange={filters?.dateRange ? {
            start: new Date(filters.dateRange.start || ''),
            end: new Date(filters.dateRange.end || '')
          } : null}
        />
      </div>

      {/* Campaign Button */}
      <CampaignButton />
    </div>
  );
};

export default Competition;
