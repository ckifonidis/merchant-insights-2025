import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { getTabConfig, getFilteredMetrics, getIcon, getColorClass, formatValue, formatValueDiff } from '../../utils/configHelpers.jsx';
import { UniversalMetricCard, UniversalBarChart, UniversalBreakdownChart, TimeSeriesChart } from '../ui';
import { METRIC_VARIANTS } from '../../utils/constants';
import { useRevenueData } from '../../hooks/useTabData.js';
import { transformRevenueData } from '../../services/transformations/revenueTransform.js';
import CampaignButton from '../ui/CampaignButton';

const Revenue = ({ filters }) => {
  const { t } = useTranslation();
  
  // Get revenue data from API
  const { data: revenueApiData, loading, error } = useRevenueData();
  
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
  
  // Clean development logging
  if (import.meta.env.DEV) {
    console.log('📊 Revenue data ready:', {
      loading,
      hasData: !!revenueApiData?.payload?.metrics,
      interestsCount: revenueByInterests?.length,
      channelData: !!revenueByChannelData
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

      {/* Revenue Metrics - Inlined */}
      <div className="space-y-6 mb-8">
        {(() => {
          const tabConfig = getTabConfig('revenue');
          if (!tabConfig) return null;

          const filteredMetrics = getFilteredMetrics(tabConfig.metrics);
          
          // Group metrics: regular metrics and Go For More metrics
          const regularMetrics = filteredMetrics.filter(metric => !metric.conditional);
          const goForMoreMetrics = filteredMetrics.filter(metric => metric.conditional === 'goForMore');

          return (
            <>
              {/* Regular Revenue Metrics */}
              <div className="space-y-4">
                {regularMetrics.map((metric) => {
                  const iconElement = (
                    <div className={getColorClass(metric.color)}>
                      {getIcon(metric.icon, "w-5 h-5")}
                    </div>
                  );

                  return (
                    <UniversalMetricCard
                      key={metric.id}
                      variant={METRIC_VARIANTS.detailed}
                      title={t(metric.name)}
                      icon={iconElement}
                      merchantData={{
                        value: metric.merchant.value,
                        change: metric.merchant.valueDiff,
                        valueType: metric.valueType
                      }}
                      competitorData={metric.supportsCompetition ? {
                        value: metric.competitor.value,
                        change: metric.competitor.valueDiff,
                        valueType: metric.valueType
                      } : {}}
                    />
                  );
                })}
              </div>

              {/* Go For More Metrics */}
              {goForMoreMetrics.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    {t('revenue.goForMore')}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {goForMoreMetrics.map((metric) => {
                      const iconElement = (
                        <div className={getColorClass(metric.color)}>
                          {getIcon(metric.icon, "w-5 h-5")}
                        </div>
                      );

                      return (
                        <UniversalMetricCard
                          key={metric.id}
                          variant={METRIC_VARIANTS.single}
                          title={t(metric.name)}
                          subtitle={t('dashboard.merchant')}
                          icon={iconElement}
                          value={formatValue(metric.merchant.value, metric.valueType)}
                          change={formatValueDiff(metric.merchant.valueDiff, metric.merchant.valueDiffType)}
                          iconBackground="bg-gray-50"
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          );
        })()}
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
