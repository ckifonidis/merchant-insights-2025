import { useTranslation } from 'react-i18next';
import { getTabConfig, getFilteredMetrics, getIcon, getColorClass } from '../../utils/configHelpers.jsx';
import { UniversalMetricCard, TimeSeriesChart } from '../ui';
import { METRIC_VARIANTS } from '../../utils/constants';
import CampaignButton from '../ui/CampaignButton';

const Dashboard = ({ filters }) => {
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Dashboard Header - Inlined */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('dashboard.title')}</h2>
        <p className="text-gray-600">{t('dashboard.subtitle')}</p>
      </div>

      {/* Dashboard Metrics - Inlined */}
      <div className="space-y-4 mb-8">
        {(() => {
          const tabConfig = getTabConfig('dashboard');
          if (!tabConfig) return null;
          
          const filteredMetrics = getFilteredMetrics(tabConfig.metrics);
          
          return filteredMetrics.map((metric) => {
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
          });
        })()}
      </div>

      {/* Dashboard Charts - Using unified TimeSeriesChart */}
      <div className="space-y-6">
        <TimeSeriesChart
          filters={filters}
          dataType="revenue"
          title={t('dashboard.revenue')}
          showComparison={true}
        />

        <TimeSeriesChart
          filters={filters}
          dataType="transactions"
          title={t('dashboard.transactions')}
          showComparison={true}
        />

        <TimeSeriesChart
          filters={filters}
          dataType="customers"
          title={t('dashboard.customers')}
          showComparison={false}
        />
      </div>

      {/* Campaign Button */}
      <CampaignButton />
    </div>
  );
};

export default Dashboard;
