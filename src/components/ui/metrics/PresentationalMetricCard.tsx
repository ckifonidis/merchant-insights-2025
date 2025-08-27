import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import ChangeIndicator from './ChangeIndicator';
import { formatValue } from '../../../utils/formatters';
import { CSS_CLASSES, METRIC_VARIANTS } from '../../../utils/constants';

// TypeScript interfaces
export type MetricVariant = 'single' | 'detailed' | 'comparison' | 'competition';
export type ValueType = 'currency' | 'number' | 'percentage';
export type LayoutType = 'horizontal' | 'vertical';
export type SizeType = 'small' | 'medium' | 'large';

export interface MetricData {
  value: number | null;
  change?: number | null;
}

export interface PresentationalMetricCardProps {
  // Layout variant
  variant?: MetricVariant;
  
  // Common props
  title: string;
  subtitle?: string;
  icon: ReactNode;
  className?: string;
  
  // Data props
  merchantData?: MetricData;
  competitorData?: MetricData;
  valueType?: ValueType;
  
  // State props
  isLoading?: boolean;
  error?: string | null;
  
  // Additional options
  showIcon?: boolean;
  iconBackground?: string;
  layout?: LayoutType;
  size?: SizeType;
  hideCompetitorAbsolute?: boolean;
}

/**
 * Presentational Metric Card Component
 * 
 * Pure UI component that displays metric data passed as props.
 * No Redux connections, no store dependencies, no business logic.
 */
const PresentationalMetricCard: React.FC<PresentationalMetricCardProps> = ({
  // Layout variant
  variant = METRIC_VARIANTS.single,
  
  // Common props
  title,
  subtitle,
  icon,
  className = '',
  
  // Data props
  merchantData = { value: null, change: null },
  competitorData = { value: null, change: null },
  valueType = 'number',
  
  // State props
  isLoading = false,
  error = null,
  
  // Additional options
  showIcon = true,
  iconBackground = 'bg-gray-50',
  layout = 'horizontal',
  size = 'medium',
  hideCompetitorAbsolute = false
}) => {
  const { t } = useTranslation();

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

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-3"></div>
        <div className="h-16 bg-gray-200 rounded"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <div className="text-red-800">Error: {error}</div>
      </div>
    );
  }

  // Render single metric section
  const renderMetricSection = (data: MetricData, label = ''): React.ReactElement => {
    const { value: sectionValue, change: sectionChange } = data;
    
    return (
      <div className="flex-1">
        {label && (
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            {label}
          </div>
        )}
        <div className="flex items-baseline justify-between">
          <div className={currentSize.value}>
            {formatValue(sectionValue, valueType)}
          </div>
          {sectionChange !== undefined && sectionChange !== null && (
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
  const renderIcon = (): React.ReactElement | null => {
    if (!showIcon || !icon) return null;
    
    return (
      <div className={`${currentSize.icon} rounded-lg ${iconBackground} flex items-center justify-center mr-3`}>
        {icon}
      </div>
    );
  };

  // Render header (title/subtitle)
  const renderHeader = (): React.ReactElement => (
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
    return (
      <div className={`${CSS_CLASSES.card} ${currentSize.container} ${className}`}>
        {layout === 'vertical' && renderIcon()}
        {renderHeader()}
        <div className="mt-3">
          {renderMetricSection(merchantData)}
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
          {renderMetricSection(merchantData, t('dashboard.merchant'))}
          {renderMetricSection(competitorData, t('dashboard.competition'))}
        </div>
      </div>
    );
  }

  // Detailed variant (like DashboardMetrics cards)
  if (variant === METRIC_VARIANTS.detailed) {
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
                  {merchantData.value !== null ? formatValue(merchantData.value, valueType) : '-'}
                </h3>
                {merchantData.change !== null && merchantData.change !== undefined && (
                  <div className={`rounded-full p-1.5 ml-2 ${
                    merchantData.change > 0 ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={merchantData.change > 0 ? 'text-green-600' : 'text-red-600'}>
                      {merchantData.change > 0 ? (
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
                {merchantData.change !== null && merchantData.change !== undefined ? (
                  `${merchantData.change > 0 ? '+' : ''}${merchantData.change.toFixed(1)}% ${t('dashboard.vsLastYear')}`
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
                  {!hideCompetitorAbsolute && competitorData.value !== null ? formatValue(competitorData.value, valueType) : '-'}
                </h3>
                {competitorData.change !== null && competitorData.change !== undefined && (
                  <div className={`rounded-full p-1.5 ml-2 ${
                    competitorData.change > 0 ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={competitorData.change > 0 ? 'text-green-600' : 'text-red-600'}>
                      {competitorData.change > 0 ? (
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
                {competitorData.change !== null && competitorData.change !== undefined ? (
                  `${competitorData.change > 0 ? '+' : ''}${competitorData.change.toFixed(1)}% ${t('dashboard.vsLastYear')}`
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

  // Competition variant (special for competition metrics)
  if (variant === METRIC_VARIANTS.competition) {
    // Calculate merchant vs competition percentage (if both have values)
    const merchantVsCompetitionPercentage = 
      merchantData.value && competitorData.value 
        ? ((merchantData.value - competitorData.value) / competitorData.value) * 100
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
                  {merchantData.change !== null && merchantData.change !== undefined 
                    ? `${merchantData.change >= 0 ? '+' : ''}${merchantData.change.toFixed(1)}%`
                    : '-'
                  }
                </h3>
                {merchantData.change !== null && merchantData.change !== undefined && (
                  <div className={`rounded-full p-1.5 ml-2 ${
                    merchantData.change > 0 ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={merchantData.change > 0 ? 'text-green-600' : 'text-red-600'}>
                      {merchantData.change > 0 ? (
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
                {t('competition.competitorChange')}: {competitorData.change !== null && competitorData.change !== undefined 
                  ? `${competitorData.change >= 0 ? '+' : ''}${competitorData.change.toFixed(1)}%`
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

export default PresentationalMetricCard;