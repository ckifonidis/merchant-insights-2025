import React from 'react';
import { useTranslation } from 'react-i18next';
import ChangeIndicator from './ChangeIndicator';
import { formatValue } from '../../../utils/formatters';
import { CSS_CLASSES, METRIC_VARIANTS } from '../../../utils/constants';
import { useSelector } from 'react-redux';
import { createMetricSelector } from '../../../store/selectors/dataSelectors.js';

/**
 * Universal metric card that consolidates all metric display patterns
 * Replaces: MetricCard, ComparisonMetricCard, and inline metric cards
 * 
 * ALWAYS requires metricId - connects to Redux store for all data
 * Throws error if metricId is missing
 */
const UniversalMetricCard = ({
  // Layout variant
  variant = METRIC_VARIANTS.single, // 'single', 'comparison', 'detailed'
  
  // Common props
  title,
  subtitle,
  icon,
  className = '',
  
  // Single variant props (DEPRECATED - use metricId instead)
  value,
  change,
  valueType = 'number',
  
  // Comparison variant props (DEPRECATED - use metricId instead)
  merchantData = {},
  competitorData = {},
  
  // REQUIRED: Metric ID for store connection
  metricId,
  
  // Additional options
  showIcon = true,
  iconBackground = 'bg-gray-50',
  layout = 'horizontal', // 'horizontal', 'vertical'
  size = 'medium' // 'small', 'medium', 'large'
}) => {
  const { t } = useTranslation();

  // ALWAYS require metricId - no fallback to props
  if (!metricId) {
    const errorMessage = `UniversalMetricCard: metricId is required. Component title: "${title || 'Unknown'}"`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  // Connect to store using metricId - get data in exact store format
  const storeData = useSelector(createMetricSelector(metricId));
  
  
  // Calculate year-over-year percentage change
  const calculateYoYChange = (current, previous) => {
    if (!current || !previous || previous === 0) return null;
    return ((current - previous) / previous) * 100;
  };

  // Always use store data - no fallback to props
  // Store format: { merchant: { current: value, previous: value }, competitor: { current: value, previous: value } }
  const finalMerchantData = {
    value: storeData?.merchant?.current,
    change: calculateYoYChange(storeData?.merchant?.current, storeData?.merchant?.previous)
  };
  const finalCompetitorData = {
    value: storeData?.competitor?.current,
    change: calculateYoYChange(storeData?.competitor?.current, storeData?.competitor?.previous)
  };

  // Size-based classes
  const sizeClasses = {
    small: {
      container: 'p-3',
      title: 'text-sm font-medium text-gray-600',
      value: 'text-lg font-bold text-gray-900',
      icon: 'w-8 h-8'
    },
    medium: {
      container: 'p-4',
      title: 'text-sm font-medium text-gray-600',
      value: 'text-2xl font-bold text-gray-900',
      icon: 'w-10 h-10'
    },
    large: {
      container: 'p-6',
      title: 'text-base font-semibold text-gray-700',
      value: 'text-3xl font-bold text-gray-900',
      icon: 'w-12 h-12'
    }
  };

  const currentSize = sizeClasses[size] || sizeClasses.medium;

  // Render single metric section
  const renderMetricSection = (data, label = '') => {
    const { value: sectionValue, change: sectionChange, valueType: sectionValueType = valueType } = data;
    
    return (
      <div className="flex-1">
        {label && (
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            {label}
          </div>
        )}
        <div className="flex items-baseline justify-between">
          <div className={currentSize.value}>
            {formatValue(sectionValue, sectionValueType)}
          </div>
          {sectionChange !== undefined && (
            <ChangeIndicator 
              value={sectionChange}
              type="percentage"
              size="sm"
              className="ml-2"
            />
          )}
        </div>
      </div>
    );
  };

  // Render icon section
  const renderIcon = () => {
    if (!showIcon || !icon) return null;
    
    return (
      <div className={`${currentSize.icon} rounded-lg ${iconBackground} flex items-center justify-center mr-3`}>
        {icon}
      </div>
    );
  };

  // Render header (title/subtitle)
  const renderHeader = () => (
    <div className="flex items-center mb-3">
      {layout === 'horizontal' && renderIcon()}
      <div className="flex-1">
        <h3 className={currentSize.title}>{title}</h3>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );

  // Single variant (original MetricCard)
  if (variant === METRIC_VARIANTS.single) {
    // Always use store data (metricId is required)
    const singleData = {
      value: finalMerchantData.value,
      change: finalMerchantData.change,
      valueType
    };

    return (
      <div className={`${CSS_CLASSES.card} ${currentSize.container} ${className}`}>
        {layout === 'vertical' && renderIcon()}
        {renderHeader()}
        <div className="mt-3">
          {renderMetricSection(singleData)}
        </div>
      </div>
    );
  }

  // Comparison variant (side-by-side)
  if (variant === METRIC_VARIANTS.comparison) {
    return (
      <div className={`${CSS_CLASSES.card} ${currentSize.container} ${className}`}>
        {renderHeader()}
        <div className="grid grid-cols-2 gap-4 mt-3">
          {renderMetricSection(finalMerchantData, t('dashboard.merchant'))}
          {renderMetricSection(finalCompetitorData, t('dashboard.competition'))}
        </div>
      </div>
    );
  }

  // Detailed variant (like DashboardMetrics cards) - Always uses store data
  if (variant === METRIC_VARIANTS.detailed) {
    // Show loading state if data is being fetched
    if (storeData?.isLoading) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-3"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      );
    }

    // Show error state if no store connection
    if (!storeData) {
      return (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="text-red-800">Error: Unable to connect to metric data store for metricId: {metricId}</div>
        </div>
      );
    }
    
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-base font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">
          {title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Merchant Section */}
          <div className="flex items-start w-full">
            <div className="icon-circle bg-blue-50 mt-1">
              {icon}
            </div>
            <div className="ml-3 flex-grow">
              <p className="text-sm font-medium text-gray-700">
                {t('dashboard.merchant')}
              </p>
              <div className="flex items-center">
                <h3 className="text-2xl font-bold">
                  {finalMerchantData.value !== null ? formatValue(finalMerchantData.value, finalMerchantData.valueType || valueType) : '-'}
                </h3>
                {finalMerchantData.change !== null && finalMerchantData.change !== undefined && (
                  <div className={`rounded-full p-1.5 ml-2 ${
                    finalMerchantData.change > 0 ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={finalMerchantData.change > 0 ? 'text-green-600' : 'text-red-600'}>
                      {finalMerchantData.change > 0 ? (
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
                )}
              </div>
              <div className="text-sm text-gray-600">
                {finalMerchantData.change !== null && finalMerchantData.change !== undefined ? (
                  `${finalMerchantData.change > 0 ? '+' : ''}${finalMerchantData.change.toFixed(1)}% ${t('dashboard.vsLastYear')}`
                ) : (
                  `- ${t('dashboard.vsLastYear')}`
                )}
              </div>
            </div>
          </div>

          {/* Competition Section */}
          <div className="flex items-start w-full">
            <div className="icon-circle bg-gray-50 mt-1">
              {icon}
            </div>
            <div className="ml-3 flex-grow">
              <p className="text-sm font-medium text-gray-700">
                {t('dashboard.competition')}
              </p>
              <div className="flex items-center">
                <h3 className="text-2xl font-bold">
                  {finalCompetitorData.value !== null ? formatValue(finalCompetitorData.value, finalCompetitorData.valueType || valueType) : '-'}
                </h3>
                {finalCompetitorData.change !== null && finalCompetitorData.change !== undefined && (
                  <div className={`rounded-full p-1.5 ml-2 ${
                    finalCompetitorData.change > 0 ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={finalCompetitorData.change > 0 ? 'text-green-600' : 'text-red-600'}>
                      {finalCompetitorData.change > 0 ? (
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
                )}
              </div>
              <div className="text-sm text-gray-600">
                {finalCompetitorData.change !== null && finalCompetitorData.change !== undefined ? (
                  `${finalCompetitorData.change > 0 ? '+' : ''}${finalCompetitorData.change.toFixed(1)}% ${t('dashboard.vsLastYear')}`
                ) : (
                  `- ${t('dashboard.vsLastYear')}`
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Competition variant (special for competition metrics with percentage values and competitor change detail)
  if (variant === METRIC_VARIANTS.competition) {
    // Show loading state if data is being fetched
    if (storeData?.isLoading) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-3"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      );
    }

    // Show error state if no store connection
    if (!storeData) {
      return (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="text-red-800">Error: Unable to connect to metric data store for metricId: {metricId}</div>
        </div>
      );
    }

    // Calculate merchant vs competition percentage (if both merchant and competitor have current values)
    const merchantVsCompetitionPercentage = 
      finalMerchantData.value && finalCompetitorData.value 
        ? ((finalMerchantData.value - finalCompetitorData.value) / finalCompetitorData.value) * 100
        : null;

    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-base font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">
          {title}
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Left: Compared to last year */}
          <div className="flex items-start w-full">
            <div className="icon-circle bg-blue-50 mt-1">
              {icon}
            </div>
            <div className="ml-3 flex-grow">
              <p className="text-sm font-medium text-gray-700">
                {t('competition.comparedToLastYear')}
              </p>
              <div className="flex items-center">
                <h3 className="text-2xl font-bold">
                  {finalMerchantData.change !== null && finalMerchantData.change !== undefined 
                    ? `${finalMerchantData.change >= 0 ? '+' : ''}${finalMerchantData.change.toFixed(1)}%`
                    : '-'
                  }
                </h3>
                {finalMerchantData.change !== null && finalMerchantData.change !== undefined && (
                  <div className={`rounded-full p-1.5 ml-2 ${
                    finalMerchantData.change > 0 ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={finalMerchantData.change > 0 ? 'text-green-600' : 'text-red-600'}>
                      {finalMerchantData.change > 0 ? (
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
                )}
              </div>
            </div>
          </div>
          
          {/* Right: Compared to competition */}
          <div className="flex items-start w-full">
            <div className="icon-circle bg-gray-50 mt-1">
              {icon}
            </div>
            <div className="ml-3 flex-grow">
              <p className="text-sm font-medium text-gray-700">
                {t('competition.comparedToCompetition')}
              </p>
              <div className="flex items-center">
                <h3 className="text-2xl font-bold">
                  {merchantVsCompetitionPercentage !== null 
                    ? `${merchantVsCompetitionPercentage >= 0 ? '+' : ''}${merchantVsCompetitionPercentage.toFixed(1)}%`
                    : '-'
                  }
                </h3>
              </div>
              <div className="text-sm text-gray-600">
                {t('competition.competitorChange')}: {finalCompetitorData.change !== null && finalCompetitorData.change !== undefined 
                  ? `${finalCompetitorData.change >= 0 ? '+' : ''}${finalCompetitorData.change.toFixed(1)}%`
                  : '-'
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default UniversalMetricCard;