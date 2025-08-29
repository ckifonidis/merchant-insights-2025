import React from 'react';
import { useTranslation } from 'react-i18next';
import CampaignButton from '../ui/CampaignButton';
import GenericMetricContainer from '../containers/GenericMetricContainer';
import GenericTimeSeriesChartContainer from '../containers/GenericTimeSeriesChartContainer';
import GenericBarChartContainer from '../containers/GenericBarChartContainer';
import GenericBreakdownChartContainer from '../containers/GenericBreakdownChartContainer';
import { 
  selectRevenuePerDay
} from '../../store/selectors/dataSelectors';
import { formatCurrency } from '../../utils/formatters';
import { useRevenueData } from '../../hooks/useNormalizedData';

// TypeScript interfaces
interface DateRange {
  start?: string;
  end?: string;
}

interface Filters {
  dateRange?: DateRange;
}

interface RevenueProps {
  filters?: Filters;
}

const Revenue: React.FC<RevenueProps> = ({ filters }) => {
  const { t } = useTranslation();
  
  // Get revenue data with automatic fetching and year-over-year comparison
  const { data: revenueData, isLoading: loading, error } = useRevenueData();

  // 2. Show loading state while data is being fetched
  if (loading) {
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

      {/* Revenue Metrics - Direct container configuration like Dashboard */}
      <div className="space-y-6 mb-8">
        {/* Regular Revenue Metrics */}
        <div className="space-y-4">
          <GenericMetricContainer
            title={t('revenue.totalRevenue')}
            metricId="total_revenue"
            valueType="currency"
            icon={
              <div className="text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
            }
          />
          
          <GenericMetricContainer
            title={t('revenue.avgDailyRevenue')}
            metricId="avg_daily_revenue"
            valueType="currency"
            icon={
              <div className="text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"></polyline>
                </svg>
              </div>
            }
          />
          
          <GenericMetricContainer
            title={t('revenue.avgTransaction')}
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
          />
        </div>

        {/* Go For More Metrics */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {t('revenue.goForMore')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GenericMetricContainer
              title={t('revenue.goForMoreTotal')}
              metricId="goformore_amount"
              valueType="currency"
              variant="single"
              icon={
                <div className="text-orange-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <polyline points="20,6 9,17 4,12"></polyline>
                  </svg>
                </div>
              }
            />
            
            <GenericMetricContainer
              title={t('revenue.rewarded')}
              metricId="rewarded_amount"
              valueType="currency"
              variant="single"
              icon={
                <div className="text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </div>
              }
            />
            
            <GenericMetricContainer
              title={t('revenue.redeemed')}
              metricId="redeemed_amount"
              valueType="currency"
              variant="single"
              icon={
                <div className="text-red-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M7 7l10 10M7 17L17 7"></path>
                  </svg>
                </div>
              }
            />
          </div>
        </div>
      </div>

      {/* Revenue Charts - Direct container configuration like Dashboard */}
      <div className="space-y-6">
        <GenericTimeSeriesChartContainer
          title={t('revenue.trends')}
          metricId="revenue_per_day"
          selector={selectRevenuePerDay}
          formatValue={formatCurrency}
          showCompetitor={true}
          merchantLabel={t('dashboard.merchant')}
          hasCompetitorData={true}
          filters={filters}
        />

        <GenericTimeSeriesChartContainer
          title={t('revenue.changes')}
          metricId="revenue_per_day"
          selector={selectRevenuePerDay}
          formatValue={(value: number) => `${value}%`}
          showCompetitor={true}
          merchantLabel={t('dashboard.merchant')}
          hasCompetitorData={true}
          filters={filters}
          yAxisMode="percentage"
        />

        {/* Additional Charts in Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GenericBarChartContainer
            title={t('revenue.byShoppingInterests')}
            metricId="converted_customers_by_interest"
            context="revenue"
            merchantColor="#007B85"
            competitorColor="#73AA3C"
            yAxisLabel="%"
            formatValue={(value: number) => `${value}%`}
            formatTooltipValue={(absoluteValue: number) => 
              new Intl.NumberFormat('el-GR', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(absoluteValue)
            }
            showAbsoluteValues={true}
            maxCategories={6}
          />

          <GenericBreakdownChartContainer
            title={t('revenue.byChannel')}
            metricId="revenue_by_channel"
            colors={{
              [t('channels.physical')]: '#007B85',
              [t('channels.ecommerce')]: '#7BB3C0'
            }}
            formatValue={(value: number) => `${value}%`}
            formatTooltipValue={(absoluteValue: number) => 
              new Intl.NumberFormat('el-GR', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(absoluteValue)
            }
            showAbsoluteValues={true}
          />
        </div>
      </div>

      {/* Campaign Button */}
      <CampaignButton />
    </div>
  );
};

export default Revenue;
