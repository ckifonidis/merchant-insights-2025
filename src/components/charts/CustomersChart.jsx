import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { generateTimeSeriesData } from '../../data/mockData';
import { processTimelineData } from '../../utils/timelineHelpers';

const CustomersChart = ({ filters }) => {
  const { t } = useTranslation();
  const [chartType, setChartType] = useState('bars');
  const [timeline, setTimeline] = useState('daily');

  // Generate mock data filtered by date range - only merchant data for compliance
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

  const chartData = processedData.map(item => ({
    date: item.displayDate, // Use the formatted display date
    customers: item.merchantCustomers,
    // Calculate percentage change from last year (mock calculation)
    change: ((Math.random() - 0.5) * 20).toFixed(1)
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-black">{label}</p>
          {payload.map((entry, index) => {
            const change = entry.payload.change;
            return (
              <p key={index} className="text-sm text-black mt-1">
                {t('dashboard.merchant')}: {entry.value} ({change > 0 ? '+' : ''}{change}% {t('dashboard.vsLastYear')})
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
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="linear"
            dataKey="customers"
            stroke="#007B85"
            strokeWidth={2}
            name={t('dashboard.merchant')}
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
                  {t('dashboard.customers')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Change vs Last Year
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
                    {row.customers.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`${row.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {row.change > 0 ? '+' : ''}{row.change}%
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
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="customers" fill="#007B85" name={t('dashboard.merchant')} />
      </BarChart>
    );
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('dashboard.customers')}
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
                { value: 'daily', label: t('chartOptions.daily') },
                { value: 'weekly', label: t('chartOptions.weekly') },
                { value: 'monthly', label: t('chartOptions.monthly') },
                { value: 'yearly', label: t('chartOptions.yearly') }
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

export default CustomersChart;
