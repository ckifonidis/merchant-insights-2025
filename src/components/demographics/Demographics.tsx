import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDemographicsData } from '../../hooks/useNormalizedData';
import CampaignButton from '../ui/CampaignButton';
import GenericMetricContainer from '../containers/GenericMetricContainer';
import GenericBreakdownChartContainer from '../containers/GenericBreakdownChartContainer';
import GenericHorizontalBarChartContainer from '../containers/GenericHorizontalBarChartContainer';
import { Users } from 'lucide-react';

// TypeScript interfaces
interface DateRange {
  start?: string;
  end?: string;
}

interface Filters {
  dateRange?: DateRange;
}

interface DemographicsProps {
  filters?: Filters;
}

const Demographics: React.FC<DemographicsProps> = ({ filters }) => {
  const { t } = useTranslation();
  
  // Get demographics data with automatic fetching and year-over-year comparison
  const { data: demographicsData, isLoading: loading, error } = useDemographicsData();

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  // Show error state if API call failed
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">{t('common.error')}</div>
        </div>
      </div>
    );
  }

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

      {/* Key Metrics - Direct container configuration like Dashboard */}
      <div className="mb-8">
        <GenericMetricContainer
          title={t('demographics.totalCustomers')}
          metricId="total_customers"
          valueType="number"
          icon={
            <div className="text-purple-600">
              <Users className="w-5 h-5" />
            </div>
          }
          variant="detailed"
          hideCompetitorAbsolute={true}
        />
      </div>

      {/* Charts Section - Direct container configuration like Dashboard */}
      <div className="space-y-8">
        {/* Gender Chart */}
        <GenericBreakdownChartContainer
          title={t('demographics.customersByGender')}
          metricId="converted_customers_by_gender"
          colors={{
            [t('genders.male')]: '#3B82F6',
            [t('genders.female')]: '#F472B6'
          }}
          formatValue={(value: number) => `${value}%`}
          formatTooltipValue={(absoluteValue: number) => `${absoluteValue} ${t('common.customersLabel')}`}
          showAbsoluteValues={true}
          hideCompetitorAbsolute={true}
        />

        {/* Age Group Chart */}
        <GenericHorizontalBarChartContainer
          title={t('demographics.customersByAge')}
          metricId="converted_customers_by_age"
          context="demographics"
          merchantColor="#3B82F6"
          competitorColor="#000000"
          formatValue={(value: number) => `${value}%`}
          formatTooltipValue={(value: number) => `${value} ${t('common.customersLabel')}`}
          maxCategories={6}
          hideCompetitorAbsolute={true}
        />

        {/* Shopping Interests Chart */}
        <GenericHorizontalBarChartContainer
          title={t('demographics.customersByInterests')}
          metricId="converted_customers_by_interest"
          context="demographics"
          merchantColor="#10B981"
          competitorColor="#000000"
          formatValue={(value: number) => `${value}%`}
          formatTooltipValue={(value: number) => `${value} ${t('common.customersLabel')}`}
          maxCategories={8}
          hideCompetitorAbsolute={true}
        />
      </div>

      {/* Campaign Button */}
      <CampaignButton />
    </div>
  );
};

export default Demographics;
