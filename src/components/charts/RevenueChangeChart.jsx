import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { generateTimeSeriesData } from '../../data/mockData';
import { processTimelineData } from '../../utils/timelineHelpers';

const RevenueChangeChart = ({ filters }) => {
  const { t } = useTranslation();
  const [timeline, setTimeline] = useState('weekly');

  // Generate mock data for percentage change filtered by date range
  const rawData = generateTimeSeriesData(
    filters?.dateRange?.start,
    filters?.dateRange?.end
  );

  // Process data based on timeline selection using the new helper
  const processedData = processTimelineData(
    rawData,
    timeline,
    filters?.dateRange?.start ? new Date(filters.dateRange.start) : null,
    filters?.dateRange?.end ? new Date(filters.dateRange.end) : null
  );

  // Generate percentage change data (merchant only)
  const chartData = processedData.map((item, index) => {
    // Simulate percentage change from last year
    const baseChange = Math.sin(index * 0.3) * 15; // Seasonal pattern
    const randomVariation = (Math.random() - 0.5) * 10;
    const percentageChange = baseChange + randomVariation;

    return {
      date: item.displayDate, // Use the formatted display date
      change: parseFloat(percentageChange.toFixed(1)),
      revenue: Math.round(item.merchantRevenue)
    };
  });

  const formatPercentage = (value) => {
    return `${value > 0 ? '+' : ''}${value}%`;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('el-GR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <div className="flex items-center mt-1">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: payload[0].color }}
            />
            <span className="text-sm">
              {t('dashboard.merchant')}: {formatPercentage(data.change)}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('revenue.revenueChange')}
        </h3>

        <div className="flex items-center space-x-4">
          {/* Timeline Selector */}
          <div className="min-w-32">
            <Select
              value={{ value: timeline, label: t(`chartOptions.${timeline}`) }}
              onChange={(option) => setTimeline(option.value)}
              options={[
                { value: 'weekly', label: t('chartOptions.weekly') },
                { value: 'monthly', label: t('chartOptions.monthly') },
                { value: 'quarterly', label: t('chartOptions.quarterly') }
              ]}
              className="text-sm"
              isSearchable={false}
            />
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={formatPercentage} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#666" strokeDasharray="2 2" />
            <Line
              type="linear"
              dataKey="change"
              stroke="#007B85"
              strokeWidth={3}
              dot={{ fill: '#007B85', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#007B85', strokeWidth: 2 }}
              name={t('dashboard.merchant')}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChangeChart;
