import { useTranslation } from 'react-i18next';
import { competitionMetrics } from '../../data/mockData.js';

const CompetitionMetrics = ({ filters }) => {
  const { t } = useTranslation();

  const formatValue = (value, type) => {
    if (type === 'currency') {
      return new Intl.NumberFormat('el-GR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    } else if (type === 'number') {
      return new Intl.NumberFormat('el-GR').format(value);
    } else if (type === 'decimal') {
      return new Intl.NumberFormat('el-GR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    }
    return value;
  };

  const safeToFixed = (value, decimals = 1) => {
    if (value === null || value === undefined || isNaN(value)) return '0.0';
    return Number(value).toFixed(decimals);
  };

  const renderPerformanceIndicator = (change, isPositive) => {
    if (change === null || change === undefined || isNaN(change)) return null;

    return (
      <div className={`rounded-full p-1.5 ml-2 ${
        isPositive ? 'bg-green-100' : 'bg-red-100'
      }`} title={isPositive ? 'Θετική μεταβολή' : 'Αρνητική μεταβολή'}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isPositive ? 'text-green-600' : 'text-red-600'}>
          {isPositive ? (
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
    );
  };

  const CompetitionMetricCard = ({ title, icon, data, valueType }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-base font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Compared to Last Year */}
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
                {(data.merchantChangeFromLastYear || 0) >= 0 ? '+' : ''}{safeToFixed(data.merchantChangeFromLastYear)}%
              </h3>
              {renderPerformanceIndicator(data.merchantChangeFromLastYear, (data.merchantChangeFromLastYear || 0) >= 0)}
            </div>
          </div>
        </div>

        {/* Compared to Competitors */}
        <div className="flex items-start w-full">
          <div className="icon-circle bg-indigo-50 mt-1">
            {icon}
          </div>
          <div className="ml-3 flex-grow">
            <p className="text-sm font-medium text-gray-700">
              {t('competition.comparedToCompetition')}
            </p>
            <div className="flex items-center">
              <h3 className="text-2xl font-bold">
                {(data.merchantVsCompetition || 0) >= 0 ? '+' : ''}{safeToFixed(data.merchantVsCompetition)}%
              </h3>
              {renderPerformanceIndicator(data.merchantVsCompetition, (data.merchantVsCompetition || 0) >= 0)}
            </div>
            <div className="flex items-center text-sm">
              <span className="text-gray-600">
                {t('competition.competitorChange')}: <span className="font-medium">
                  {(data.competitionChangeFromLastYear || 0) >= 0 ? '+' : ''}{safeToFixed(data.competitionChangeFromLastYear)}%
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Icons for metrics
  const RevenueIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
      <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
    </svg>
  );

  const TransactionsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
      <path d="M3 6h18"></path>
      <path d="M16 10a4 4 0 0 1-8 0"></path>
    </svg>
  );

  const AvgTransactionIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
      <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );

  return (
    <div className="space-y-4 mb-8">
      {/* Revenue Metric */}
      <CompetitionMetricCard
        title={t('competition.revenue')}
        icon={<RevenueIcon />}
        data={competitionMetrics.revenue}
        valueType="currency"
      />

      {/* Transactions Metric */}
      <CompetitionMetricCard
        title={t('competition.transactions')}
        icon={<TransactionsIcon />}
        data={competitionMetrics.transactions}
        valueType="number"
      />

      {/* Average Transaction Amount Metric */}
      <CompetitionMetricCard
        title={t('competition.avgTransactionAmount')}
        icon={<AvgTransactionIcon />}
        data={competitionMetrics.avgTransactionAmount}
        valueType="decimal"
      />
    </div>
  );
};

export default CompetitionMetrics;
