import { useTranslation } from 'react-i18next';
import { getTabConfig, getFilteredMetrics, getIcon, getColorClass, formatValue, formatValueDiff } from '../../utils/configHelpers.jsx';

const RevenueMetrics = ({ filters }) => {
  const { t } = useTranslation();

  // Get configuration for the revenue tab
  const tabConfig = getTabConfig('revenue');
  if (!tabConfig) return null;

  // Filter metrics based on conditions (e.g., Go For More)
  const filteredMetrics = getFilteredMetrics(tabConfig.metrics);

  // Group metrics: regular metrics and Go For More metrics
  const regularMetrics = filteredMetrics.filter(metric => !metric.conditional);
  const goForMoreMetrics = filteredMetrics.filter(metric => metric.conditional === 'goForMore');

  const RevenueMetricCard = ({ metric }) => {
    const iconElement = (
      <div className={getColorClass(metric.color)}>
        {getIcon(metric.icon, "w-5 h-5")}
      </div>
    );

    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-base font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">
          {t(metric.name)}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Merchant */}
          <div className="flex items-start w-full">
            <div className="icon-circle bg-blue-50 mt-1">
              {iconElement}
            </div>
            <div className="ml-3 flex-grow">
              <p className="text-sm font-medium text-gray-700">
                {t('dashboard.merchant')}
              </p>
              <div className="flex items-center">
                <h3 className="text-2xl font-bold">
                  {formatValue(metric.merchant.value, metric.valueType)}
                </h3>
                <div className={`rounded-full p-1.5 ml-2 ${
                  metric.merchant.valueDiff > 0 ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={metric.merchant.valueDiff > 0 ? 'text-green-600' : 'text-red-600'}>
                    {metric.merchant.valueDiff > 0 ? (
                      <>
                        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                        <polyline points="16 7 22 7 22 13"></polyline>
                      </>
                    ) : (
                      <>
                        <polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline>
                        <polyline points="16 17 22 17 22 11"></polyline>
                      </>
                    )}
                  </svg>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                {formatValueDiff(metric.merchant.valueDiff, metric.merchant.valueDiffType)} {t('dashboard.vsLastYear')}
              </div>
            </div>
          </div>

          {/* Competition */}
          {metric.supportsCompetition && (
            <div className="flex items-start w-full">
              <div className="icon-circle bg-gray-50 mt-1">
                {iconElement}
              </div>
              <div className="ml-3 flex-grow">
                <p className="text-sm font-medium text-gray-700">
                  {t('dashboard.competition')}
                </p>
                <div className="flex items-center">
                  <h3 className="text-2xl font-bold">
                    {formatValue(metric.competitor.value, metric.valueType)}
                  </h3>
                  <div className={`rounded-full p-1.5 ml-2 ${
                    metric.competitor.valueDiff > 0 ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={metric.competitor.valueDiff > 0 ? 'text-green-600' : 'text-red-600'}>
                      {metric.competitor.valueDiff > 0 ? (
                        <>
                          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                          <polyline points="16 7 22 7 22 13"></polyline>
                        </>
                      ) : (
                        <>
                          <polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline>
                          <polyline points="16 17 22 17 22 11"></polyline>
                        </>
                      )}
                    </svg>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {formatValueDiff(metric.competitor.valueDiff, metric.competitor.valueDiffType)} {t('dashboard.vsLastYear')}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Simplified card for Go For More metrics (merchant only)
  const GoForMoreMetricCard = ({ metric }) => {
    const iconElement = (
      <div className={getColorClass(metric.color)}>
        {getIcon(metric.icon, "w-5 h-5")}
      </div>
    );

    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-start">
          <div className="icon-circle bg-blue-50 mt-1">
            {iconElement}
          </div>
          <div className="ml-3 flex-grow">
            <h3 className="text-base font-semibold text-gray-700 mb-2">
              {t(metric.name)}
            </h3>
            <div className="flex items-center">
              <h3 className="text-2xl font-bold">
                {formatValue(metric.merchant.value, metric.valueType)}
              </h3>
              <div className={`rounded-full p-1.5 ml-2 ${
                metric.merchant.valueDiff > 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={metric.merchant.valueDiff > 0 ? 'text-green-600' : 'text-red-600'}>
                  {metric.merchant.valueDiff > 0 ? (
                    <>
                      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                      <polyline points="16 7 22 7 22 13"></polyline>
                    </>
                  ) : (
                    <>
                      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline>
                      <polyline points="16 17 22 17 22 11"></polyline>
                    </>
                  )}
                </svg>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {formatValueDiff(metric.merchant.valueDiff, metric.merchant.valueDiffType)} {t('dashboard.vsLastYear')}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 mb-8">
      {/* Regular Revenue Metrics */}
      <div className="space-y-4">
        {regularMetrics.map((metric) => (
          <RevenueMetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      {/* Go For More Metrics */}
      {goForMoreMetrics.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {t('revenue.goForMore')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {goForMoreMetrics.map((metric) => (
              <GoForMoreMetricCard key={metric.id} metric={metric} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueMetrics;
