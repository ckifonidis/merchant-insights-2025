import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { generateTimeSeriesData } from '../../data/mockData';
import { processTimelineData } from '../../utils/timelineHelpers';

const RevenueTrendChart = ({ filters }) => {
  const { t } = useTranslation();
  const [chartType, setChartType] = useState('bars');
  const [timeline, setTimeline] = useState('weekly');

  // Generate mock data filtered by date range
  const rawData = generateTimeSeriesData(
    filters?.dateRange?.start,
    filters?.dateRange?.end
  );

  // Process data with extended range to get previous period for calculations
  const getExtendedDateRange = () => {
    if (!filters?.dateRange?.start || !filters?.dateRange?.end) {
      return { extendedStart: null, extendedEnd: null };
    }

    const start = new Date(filters.dateRange.start);
    const end = new Date(filters.dateRange.end);
    let extendedStart;

    // Calculate how much to extend the start date based on timeline
    switch (timeline) {
      case 'weekly':
        // Go back 1 week to get previous week's data
        extendedStart = new Date(start.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        // Go back 1 month to get previous month's data
        extendedStart = new Date(start.getFullYear(), start.getMonth() - 1, start.getDate());
        break;
      case 'quarterly':
        // Go back 3 months to get previous quarter's data
        extendedStart = new Date(start.getFullYear(), start.getMonth() - 3, start.getDate());
        break;
      default:
        extendedStart = start;
    }

    return { extendedStart, extendedEnd: end };
  };

  const { extendedStart, extendedEnd } = getExtendedDateRange();

  // Process data with extended range to include previous period
  const extendedProcessedData = processTimelineData(
    rawData,
    timeline,
    extendedStart,
    extendedEnd
  );

  // Process data for the actual display range
  const displayProcessedData = processTimelineData(
    rawData,
    timeline,
    filters?.dateRange?.start ? new Date(filters.dateRange.start) : null,
    filters?.dateRange?.end ? new Date(filters.dateRange.end) : null
  );

  // Calculate period-over-period changes using extended data
  const chartData = displayProcessedData.map((item, displayIndex) => {
    let merchantChange = 0;
    let competitorChange = 0;

    // Find the corresponding item in extended data
    const extendedIndex = extendedProcessedData.findIndex(extItem => extItem.date === item.date);

    if (extendedIndex > 0) {
      const previousItem = extendedProcessedData[extendedIndex - 1];
      merchantChange = previousItem.merchantRevenue > 0
        ? ((item.merchantRevenue - previousItem.merchantRevenue) / previousItem.merchantRevenue * 100)
        : 0;
      competitorChange = previousItem.competitorRevenue > 0
        ? ((item.competitorRevenue - previousItem.competitorRevenue) / previousItem.competitorRevenue * 100)
        : 0;
    }

    return {
      date: item.displayDate, // Use the formatted display date
      merchant: Math.round(item.merchantRevenue),
      competitor: Math.round(item.competitorRevenue),
      merchantChange: merchantChange.toFixed(1),
      competitorChange: competitorChange.toFixed(1)
    };
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('el-GR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Get the appropriate comparison text based on timeline
  const getComparisonText = () => {
    switch (timeline) {
      case 'weekly':
        return t('dashboard.vsLastWeek');
      case 'monthly':
        return t('dashboard.vsLastMonth');
      case 'quarterly':
        return t('dashboard.vsLastQuarter');
      default:
        return t('dashboard.vsLastYear');
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-black">{label}</p>
          {payload.map((entry, index) => {
            const change = entry.dataKey === 'merchant' ? entry.payload.merchantChange : entry.payload.competitorChange;
            const label = entry.dataKey === 'merchant' ? t('dashboard.merchant') : t('dashboard.competition');
            return (
              <p key={index} className="text-sm text-black mt-1">
                {label}: {formatCurrency(entry.value)} ({change > 0 ? '+' : ''}{change}% {getComparisonText()})
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    if (chartType === 'line') {
      return (
        <LineChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={formatCurrency} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="linear"
            dataKey="merchant"
            stroke="#007B85"
            strokeWidth={2}
            name={t('dashboard.merchant')}
          />
          <Line
            type="linear"
            dataKey="competitor"
            stroke="#73AA3C"
            strokeWidth={2}
            name={t('dashboard.competition')}
          />
        </LineChart>
      );
    }

    if (chartType === 'table') {
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('dashboard.merchant')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('dashboard.competition')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {chartData.slice(0, 10).map((row, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(row.merchant)}
                    <span className={`ml-2 text-xs ${row.merchantChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ({row.merchantChange > 0 ? '+' : ''}{row.merchantChange}%)
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(row.competitor)}
                    <span className={`ml-2 text-xs ${row.competitorChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ({row.competitorChange > 0 ? '+' : ''}{row.competitorChange}%)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <BarChart {...commonProps}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis tickFormatter={formatCurrency} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="merchant" fill="#007B85" name={t('dashboard.merchant')} />
        <Bar dataKey="competitor" fill="#73AA3C" name={t('dashboard.competition')} />
      </BarChart>
    );
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('revenue.revenueTrend')}
        </h3>

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          {/* Chart Type Selector */}
          <div className="min-w-32">
            <Select
              value={{ value: chartType, label: t(`chartOptions.${chartType}`) }}
              onChange={(option) => setChartType(option.value)}
              options={[
                { value: 'bars', label: t('chartOptions.bars') },
                { value: 'line', label: t('chartOptions.line') },
                { value: 'table', label: t('chartOptions.table') }
              ]}
              className="text-sm"
              isSearchable={false}
            />
          </div>

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

      <div className={chartType === 'table' ? 'max-h-80 overflow-y-auto' : 'h-80'}>
        {chartType === 'table' ? (
          renderChart()
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default RevenueTrendChart;
