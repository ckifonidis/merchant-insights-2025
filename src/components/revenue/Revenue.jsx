import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
// Removed unused imports: getTabConfig, getFilteredMetrics, getIcon, getColorClass, formatValue, formatValueDiff
import { UniversalMetricCard, UniversalBarChart, UniversalBreakdownChart, TimeSeriesChart } from '../ui';
import { METRIC_VARIANTS } from '../../utils/constants';
import { useRevenueDataWithYearComparison } from '../../hooks/useTabData.js';
import { transformRevenueData } from '../../services/transformations/revenueTransform.js';
import CampaignButton from '../ui/CampaignButton';

const Revenue = ({ filters }) => {
  const { t } = useTranslation();
  
  // Get revenue data from API with year-over-year comparison
  const { 
    current: revenueApiData, 
    previous: previousRevenueData, 
    dateRanges, 
    loading, 
    error,
    hasPreviousYearData 
  } = useRevenueDataWithYearComparison();

  console.log('🎯 Revenue year-over-year data:', { 
    current: revenueApiData, 
    previous: previousRevenueData, 
    dateRanges,
    hasPrevious: hasPreviousYearData() 
  });
  
  // Simple, clean transformations - let React Strict Mode do its thing
  const revenueByInterests = useMemo(() => {
    if (!revenueApiData?.payload?.metrics) return [];
    return transformRevenueData(revenueApiData, 'interests');
  }, [revenueApiData]);

  const revenueByChannelData = useMemo(() => {
    if (!revenueApiData?.payload?.metrics) {
      return { 
        merchant: { physical: 0, ecommerce: 0, physicalAbsolute: 0, ecommerceAbsolute: 0 }, 
        competitor: { physical: 0, ecommerce: 0, physicalAbsolute: 0, ecommerceAbsolute: 0 } 
      };
    }
    return transformRevenueData(revenueApiData, 'channel');
  }, [revenueApiData]);

  const revenueScalarMetrics = useMemo(() => {
    if (!revenueApiData?.payload?.metrics) return {};
    return transformRevenueData(revenueApiData, 'scalars');
  }, [revenueApiData]);
  
  // Metric configuration for year-over-year support
  const metricConfig = {
    // Standard revenue metrics support YoY (use detailed variant)
    total_revenue: { supportsYoY: true, variant: METRIC_VARIANTS.detailed },
    avg_daily_revenue: { supportsYoY: true, variant: METRIC_VARIANTS.detailed },
    avg_ticket_per_user: { supportsYoY: true, variant: METRIC_VARIANTS.detailed },
    
    // Go For More metrics are merchant-only, no YoY (use single variant)
    goformore_amount: { supportsYoY: false, variant: METRIC_VARIANTS.single },
    rewarded_amount: { supportsYoY: false, variant: METRIC_VARIANTS.single },
    redeemed_amount: { supportsYoY: false, variant: METRIC_VARIANTS.single }
  };

  // Clean development logging
  if (import.meta.env.DEV) {
    console.log('📊 Revenue data ready:', {
      loading,
      hasData: !!revenueApiData?.payload?.metrics,
      interestsCount: revenueByInterests?.length,
      channelData: !!revenueByChannelData,
      scalarMetricsCount: Object.keys(revenueScalarMetrics).length,
      scalarMetrics: revenueScalarMetrics
    });
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

      {/* Revenue Metrics - Using API Data */}
      <div className="space-y-6 mb-8">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">Loading revenue metrics...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-red-500">Error loading metrics: {error}</div>
          </div>
        ) : (
          <>
            {/* Regular Revenue Metrics */}
            <div className="space-y-4">
              {/* Total Revenue */}
              {revenueScalarMetrics.total_revenue && (
                <UniversalMetricCard
                  variant={METRIC_VARIANTS.detailed}
                  title={t('revenue.totalRevenue')}
                  icon={<div className="text-blue-600"><div className="w-5 h-5">💰</div></div>}
                  merchantData={revenueScalarMetrics.total_revenue.merchant}
                  competitorData={revenueScalarMetrics.total_revenue.competition}
                />
              )}
              
              {/* Average Daily Revenue */}
              {revenueScalarMetrics.avg_daily_revenue && (
                <UniversalMetricCard
                  variant={METRIC_VARIANTS.detailed}
                  title={t('revenue.avgDailyRevenue')}
                  icon={<div className="text-green-600"><div className="w-5 h-5">📈</div></div>}
                  merchantData={revenueScalarMetrics.avg_daily_revenue.merchant}
                  competitorData={revenueScalarMetrics.avg_daily_revenue.competition}
                />
              )}
              
              {/* Average Transaction */}
              {revenueScalarMetrics.avg_ticket_per_user && (
                <UniversalMetricCard
                  variant={METRIC_VARIANTS.detailed}
                  title={t('revenue.avgTransaction')}
                  icon={<div className="text-purple-600"><div className="w-5 h-5">🎫</div></div>}
                  merchantData={revenueScalarMetrics.avg_ticket_per_user.merchant}
                  competitorData={revenueScalarMetrics.avg_ticket_per_user.competition}
                />
              )}
            </div>

            {/* Go For More Metrics */}
            {(revenueScalarMetrics.goformore_amount || revenueScalarMetrics.rewarded_amount || revenueScalarMetrics.redeemed_amount) && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {t('revenue.goForMore')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Go For More Total */}
                  {revenueScalarMetrics.goformore_amount && (
                    <UniversalMetricCard
                      variant={METRIC_VARIANTS.single}
                      title={t('revenue.goForMoreTotal')}
                      subtitle={t('dashboard.merchant')}
                      icon={<div className="text-orange-600"><div className="w-5 h-5">🎁</div></div>}
                      value={revenueScalarMetrics.goformore_amount.merchant.value}
                      change={revenueScalarMetrics.goformore_amount.merchant.change}
                      valueType={revenueScalarMetrics.goformore_amount.merchant.valueType}
                      iconBackground="bg-gray-50"
                    />
                  )}
                  
                  {/* Rewarded Amount */}
                  {revenueScalarMetrics.rewarded_amount && (
                    <UniversalMetricCard
                      variant={METRIC_VARIANTS.single}
                      title={t('revenue.rewarded')}
                      subtitle={t('dashboard.merchant')}
                      icon={<div className="text-green-600"><div className="w-5 h-5">💰</div></div>}
                      value={revenueScalarMetrics.rewarded_amount.merchant.value}
                      change={revenueScalarMetrics.rewarded_amount.merchant.change}
                      valueType={revenueScalarMetrics.rewarded_amount.merchant.valueType}
                      iconBackground="bg-gray-50"
                    />
                  )}
                  
                  {/* Redeemed Amount */}
                  {revenueScalarMetrics.redeemed_amount && (
                    <UniversalMetricCard
                      variant={METRIC_VARIANTS.single}
                      title={t('revenue.redeemed')}
                      subtitle={t('dashboard.merchant')}
                      icon={<div className="text-red-600"><div className="w-5 h-5">🎫</div></div>}
                      value={revenueScalarMetrics.redeemed_amount.merchant.value}
                      change={revenueScalarMetrics.redeemed_amount.merchant.change}
                      valueType={revenueScalarMetrics.redeemed_amount.merchant.valueType}
                      iconBackground="bg-gray-50"
                    />
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Revenue Charts - Using TimeSeriesChart */}
      <div className="space-y-6">
        {/* Revenue Trend Chart */}
        <TimeSeriesChart
          filters={filters}
          dataType="revenue"
          title={t('revenue.trends')}
          showComparison={true}
        />

        {/* Revenue Change Chart */}
        <TimeSeriesChart
          filters={filters}
          dataType="revenue"
          title={t('revenue.changes')}
          showComparison={false}
          chartType="change"
        />

        {/* Additional Charts in Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue by Shopping Interests */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('revenue.byShoppingInterests')}
            </h3>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading revenue data...</div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-red-500">Error loading data: {error}</div>
              </div>
            ) : revenueByInterests.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">No data available</div>
              </div>
            ) : (
              <UniversalBarChart
                data={revenueByInterests
                  .sort((a, b) => (b.merchant + b.competitor) - (a.merchant + a.competitor))
                  .slice(0, 6)
                  .map(item => ({
                    category: item.interest.length > 15 ? item.interest.substring(0, 15) + '...' : item.interest,
                    merchant: item.merchant,
                    competitor: item.competitor
                  }))}
                merchantColor="#007B85"
                competitorColor="#73AA3C"
                yAxisLabel="€"
              />
            )}
          </div>

          {/* Revenue by Channel */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('revenue.byChannel')}
            </h3>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading revenue data...</div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-red-500">Error loading data: {error}</div>
              </div>
            ) : (
              <UniversalBreakdownChart
                data={[
                  {
                    category: 'Physical Store',
                    merchant: revenueByChannelData.merchant.physical,
                    competitor: revenueByChannelData.competitor.physical,
                    merchantAbsolute: revenueByChannelData.merchant.physicalAbsolute,
                    competitorAbsolute: revenueByChannelData.competitor.physicalAbsolute
                  },
                  {
                    category: 'E-commerce',
                    merchant: revenueByChannelData.merchant.ecommerce,
                    competitor: revenueByChannelData.competitor.ecommerce,
                    merchantAbsolute: revenueByChannelData.merchant.ecommerceAbsolute,
                    competitorAbsolute: revenueByChannelData.competitor.ecommerceAbsolute
                  }
                ]}
                colors={{
                  'Physical Store': '#007B85',
                  'E-commerce': '#7BB3C0'
                }}
                formatValue={(value) => `${value.toFixed(1)}%`}
                formatTooltipValue={(absoluteValue) => new Intl.NumberFormat('el-GR', {
                  style: 'currency',
                  currency: 'EUR',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(absoluteValue)}
                showAbsoluteValues={true}
              />
            )}
          </div>
        </div>
      </div>

      {/* Campaign Button */}
      <CampaignButton />
    </div>
  );
};

export default Revenue;
