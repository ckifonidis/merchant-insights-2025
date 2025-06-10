import { useTranslation } from 'react-i18next';
import { getTabConfig, getFilteredMetrics, getIcon, getColorClass, formatValue, formatValueDiff } from '../../utils/configHelpers.jsx';
import { UniversalMetricCard, UniversalBreakdownChart, UniversalHorizontalBarChart, UniversalBarChart } from '../ui';
import { METRIC_VARIANTS } from '../../utils/constants';
import { demographicsData } from '../../data/mockData';
import CampaignButton from '../ui/CampaignButton';

const Demographics = ({ filters }) => {
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Demographics Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('demographics.title')}
        </h1>
        <p className="text-gray-600">
          {t('demographics.subtitle')}
        </p>
      </div>

      {/* Key Metrics - Inlined */}
      <div className="mb-8">
        {(() => {
          const tabConfig = getTabConfig('demographics');
          if (!tabConfig) return null;
          
          const filteredMetrics = getFilteredMetrics(tabConfig.metrics);
          
          const metricCards = filteredMetrics.map((metric) => {
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
          });

          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {metricCards}
            </div>
          );
        })()}
      </div>

      {/* Charts Section */}
      <div className="space-y-8">
        {/* Gender Chart */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('demographics.customersByGender')}
          </h3>
          <UniversalBreakdownChart
            data={[
              {
                category: t('genders.male'),
                merchant: demographicsData.gender.merchant.male,
                competitor: demographicsData.gender.competitor.male
              },
              {
                category: t('genders.female'),
                merchant: demographicsData.gender.merchant.female,
                competitor: demographicsData.gender.competitor.female
              }
            ]}
            colors={{
              [t('genders.male')]: '#3B82F6',
              [t('genders.female')]: '#F472B6'
            }}
            showAbsoluteValues={true}
            totalValue={12456}
            note={t('common.genderChartNote')}
          />
        </div>

        {/* Age Group Chart */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('demographics.customersByAge')}
          </h3>
          <UniversalHorizontalBarChart
            data={Object.keys(demographicsData.ageGroups.merchant).map(ageGroup => ({
              category: ageGroup,
              merchant: demographicsData.ageGroups.merchant[ageGroup],
              competitor: demographicsData.ageGroups.competitor[ageGroup]
            }))}
            title={t('demographics.customersByAge')}
            totalValue={12456}
            note="Horizontal bars show merchant percentages with competition reference lines"
            filters={filters}
          />
        </div>

        {/* Additional Charts in Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Shopping Frequency Chart */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('demographics.customersByFrequency')}
            </h3>
            <UniversalBarChart
              data={Object.keys(demographicsData.shoppingFrequency.merchant).map(frequency => ({
                category: frequency,
                merchant: demographicsData.shoppingFrequency.merchant[frequency],
                competitor: demographicsData.shoppingFrequency.competitor[frequency]
              }))}
              title={t('demographics.customersByFrequency')}
              showAbsoluteValues={true}
              totalValue={12456}
              filters={filters}
            />
          </div>

          {/* Shopping Interests Chart */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('demographics.customersByInterests')}
            </h3>
            <UniversalHorizontalBarChart
              data={(() => {
                const { interests } = demographicsData;
                const processedData = [];
                let otherMerchant = 0;
                let otherCompetitor = 0;

                Object.keys(interests.merchant).forEach(interest => {
                  const merchantValue = interests.merchant[interest];
                  const competitorValue = interests.competitor[interest];

                  if (merchantValue >= 10 || competitorValue >= 10) {
                    processedData.push({
                      category: interest,
                      merchant: merchantValue,
                      competitor: competitorValue
                    });
                  } else {
                    otherMerchant += merchantValue;
                    otherCompetitor += competitorValue;
                  }
                });

                if (otherMerchant > 0 || otherCompetitor > 0) {
                  processedData.push({
                    category: 'Other',
                    merchant: otherMerchant,
                    competitor: otherCompetitor
                  });
                }

                return processedData.sort((a, b) => (b.merchant + b.competitor) - (a.merchant + a.competitor));
              })()}
              title={t('demographics.customersByInterests')}
              totalValue={12456}
              note="Horizontal bars show merchant percentages with competition reference lines"
              filters={filters}
            />
          </div>
        </div>
      </div>

      {/* Campaign Button */}
      <CampaignButton />
    </div>
  );
};

export default Demographics;
