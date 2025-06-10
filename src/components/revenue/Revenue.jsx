import { useTranslation } from 'react-i18next';
import { getTabConfig, getFilteredMetrics, getIcon, getColorClass, formatValue, formatValueDiff } from '../../utils/configHelpers.jsx';
import { UniversalMetricCard, UniversalBreakdownChart, TimeSeriesChart } from '../ui';
import { METRIC_VARIANTS } from '../../utils/constants';
import { revenueByChannel, revenueByInterests } from '../../data/mockData';
import CampaignButton from '../ui/CampaignButton';

const Revenue = ({ filters }) => {
  const { t } = useTranslation();



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
            <UniversalBreakdownChart
              data={revenueByInterests
                .sort((a, b) => (b.merchant + b.competitor) - (a.merchant + a.competitor))
                .slice(0, 6)
                .map(item => ({
                  category: item.interest.length > 15 ? item.interest.substring(0, 15) + '...' : item.interest,
                  merchant: item.merchant,
                  competitor: item.competitor
                }))}
              colors={{
                'Electronics': '#007B85',
                'Fashion': '#73AA3C',
                'Home & Garden': '#FF6B6B',
                'Sports': '#4ECDC4',
                'Books': '#45B7D1',
                'Travel': '#96CEB4',
                'Food': '#FFEAA7',
                'Health': '#DDA0DD'
              }}
              formatValue={(value) => new Intl.NumberFormat('el-GR', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(value)}
            />
          </div>

          {/* Revenue by Channel */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('revenue.byChannel')}
            </h3>
            <UniversalBreakdownChart
              data={[
                {
                  category: 'Physical Store',
                  merchant: revenueByChannel.merchant.physical,
                  competitor: revenueByChannel.competitor.physical
                },
                {
                  category: 'E-commerce',
                  merchant: revenueByChannel.merchant.ecommerce,
                  competitor: revenueByChannel.competitor.ecommerce
                }
              ]}
              colors={{
                'Physical Store': '#007B85',
                'E-commerce': '#7BB3C0'
              }}
              formatValue={(value) => new Intl.NumberFormat('el-GR', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(Math.round((value / 100) * 2345678))}
            />
          </div>
        </div>
      </div>

      {/* Campaign Button */}
      <CampaignButton />
    </div>
  );
};

export default Revenue;
