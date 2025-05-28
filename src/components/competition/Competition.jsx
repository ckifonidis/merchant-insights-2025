import { useTranslation } from 'react-i18next';
import CompetitionMetrics from './CompetitionMetrics.jsx';
import WeeklyTurnoverChart from '../charts/WeeklyTurnoverChart.jsx';
import MonthlyTurnoverHeatmap from '../charts/MonthlyTurnoverHeatmap.jsx';
import CampaignButton from '../ui/CampaignButton';

const Competition = ({ filters }) => {
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Competition Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('competition.title')}
        </h1>
        <p className="text-gray-600">
          {t('competition.subtitle')}
        </p>
      </div>

      {/* Competition Metrics */}
      <CompetitionMetrics filters={filters} />

      {/* Competition Charts - Use grid layout like other tabs */}
      <div className="space-y-6">
        {/* Weekly Turnover Chart - Full width container */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('competition.weeklyTurnover')}
          </h3>
          <WeeklyTurnoverChart filters={filters} />
        </div>

        {/* Monthly Turnover Heatmap - Full width container */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('competition.monthlyTurnover')}
          </h3>
          <MonthlyTurnoverHeatmap filters={filters} />
        </div>
      </div>

      {/* Campaign Button */}
      <CampaignButton />
    </div>
  );
};

export default Competition;
