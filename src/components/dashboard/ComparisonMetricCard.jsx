import { useTranslation } from 'react-i18next';

const ComparisonMetricCard = ({
  title,
  icon,
  merchantValue,
  merchantChange,
  merchantIsPositive,
  competitorValue,
  competitorChange,
  competitorIsPositive
}) => {
  const { t } = useTranslation();

  const renderChangeIndicator = (change, isPositive) => {
    if (!change) return null;

    return (
      <div className={`flex items-center text-sm mt-1 ${
        isPositive ? 'text-green-600' : 'text-red-600'
      }`}>
        {isPositive ? (
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
          </svg>
        ) : (
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
          </svg>
        )}
        {change}
      </div>
    );
  };

  return (
    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
      {/* Single header with title and icon */}
      <div className="flex items-center mb-3">
        <div className="p-1.5 bg-gray-50 rounded-lg mr-2.5">
          {icon}
        </div>
        <h3 className="text-base font-medium text-gray-700">{title}</h3>
      </div>

      {/* Two data sections - stacked on mobile, side by side on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Merchant section - very mild differentiation with slightly different background */}
        <div className="p-3 md:p-2.5 bg-blue-50/40 rounded-lg border border-blue-100/50">
          <p className="text-xs font-medium text-gray-700 mb-1.5">{t('dashboard.merchant')}</p>
          <h2 className="text-lg md:text-xl font-bold text-gray-900">{merchantValue}</h2>
          {renderChangeIndicator(merchantChange, merchantIsPositive)}
        </div>

        {/* Competition section - very mild differentiation with slightly different background */}
        <div className="p-3 md:p-2.5 bg-gray-50/60 rounded-lg border border-gray-200/50">
          <p className="text-xs font-medium text-gray-700 mb-1.5">{t('dashboard.competition')}</p>
          <h2 className="text-lg md:text-xl font-bold text-gray-900">{competitorValue}</h2>
          {renderChangeIndicator(competitorChange, competitorIsPositive)}
        </div>
      </div>
    </div>
  );
};

export default ComparisonMetricCard;
