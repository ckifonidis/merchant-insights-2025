import { useTranslation } from 'react-i18next';
import MetricCard from './MetricCard';
import ComparisonMetricCard from './ComparisonMetricCard';
import { getTabConfig, getFilteredMetrics, getIcon, getColorClass, formatValue, formatValueDiff } from '../../utils/configHelpers.jsx';

const KeyMetrics = ({ filters, tabId = 'dashboard' }) => {
  const { t } = useTranslation();

  // Get configuration for the current tab
  const tabConfig = getTabConfig(tabId);
  if (!tabConfig) return null;

  // Filter metrics based on conditions (e.g., Go For More)
  const filteredMetrics = getFilteredMetrics(tabConfig.metrics);

  // Render metrics in pairs (merchant vs competition) or single cards
  const renderMetrics = () => {
    return filteredMetrics.map((metric) => {
      const iconElement = (
        <div className={getColorClass(metric.color)}>
          {getIcon(metric.icon, "w-5 h-5")}
        </div>
      );

      if (metric.supportsCompetition) {
        // Render as unified comparison card
        return (
          <ComparisonMetricCard
            key={metric.id}
            title={t(metric.name)}
            icon={iconElement}
            merchantValue={formatValue(metric.merchant.value, metric.valueType)}
            merchantChange={formatValueDiff(metric.merchant.valueDiff, metric.merchant.valueDiffType)}
            merchantIsPositive={metric.merchant.valueDiff > 0}
            competitorValue={formatValue(metric.competitor.value, metric.valueType)}
            competitorChange={formatValueDiff(metric.competitor.valueDiff, metric.competitor.valueDiffType)}
            competitorIsPositive={metric.competitor.valueDiff > 0}
          />
        );
      } else {
        // Render as single card (merchant only) - maintain grid structure
        return (
          <div key={metric.id} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MetricCard
              title={t(metric.name)}
              value={formatValue(metric.merchant.value, metric.valueType)}
              subtitle={t('dashboard.merchant')}
              change={formatValueDiff(metric.merchant.valueDiff, metric.merchant.valueDiffType)}
              isPositive={metric.merchant.valueDiff > 0}
              icon={iconElement}
            />
            {/* Empty space for alignment */}
            <div></div>
          </div>
        );
      }
    });
  };

  return (
    <div className="space-y-6 mb-8">
      {renderMetrics()}
    </div>
  );
};

export default KeyMetrics;
