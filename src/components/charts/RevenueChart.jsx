import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { generateTimeSeriesData } from '../../data/mockData';

const RevenueChart = ({ filters }) => {
  const { t } = useTranslation();
  const [chartType, setChartType] = useState('bars');
  const [timeline, setTimeline] = useState('daily');

  // Generate mock data
  const rawData = generateTimeSeriesData();

  const processDataByTimeline = (data, timelineType) => {
    switch (timelineType) {
      case 'weekly':
        return data.filter((_, index) => index % 7 === 0).slice(0, 20);
      case 'monthly':
        return data.filter((_, index) => index % 30 === 0).slice(0, 12);
      case 'yearly':
        return data.filter((_, index) => index % 365 === 0).slice(0, 2);
      default:
        return data.slice(-30);
    }
  };

  const chartData = processDataByTimeline(rawData, timeline).map(item => ({
    date: item.date,
    merchant: Math.round(item.merchantRevenue),
    competitor: Math.round(item.competitorRevenue),
    merchantChange: ((Math.random() - 0.5) * 20).toFixed(1),
    competitorChange: ((Math.random() - 0.5) * 15).toFixed(1)
  }));

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('el-GR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatTooltip = (value, name, props) => {
    const change = name === 'merchant' ? props.payload.merchantChange : props.payload.competitorChange;
    const label = name === 'merchant' ? t('dashboard.merchant') : t('dashboard.competition');
    return [
      formatCurrency(value),
      `${label} (${change > 0 ? '+' : ''}${change}% ${t('dashboard.vsLastYear')})`
    ];
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center mt-1">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm">
                {formatTooltip(entry.value, entry.dataKey, entry)}
              </span>
            </div>
          ))}
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
            type="monotone"
            dataKey="merchant"
            stroke="#007B85"
            strokeWidth={2}
            name={t('dashboard.merchant')}
          />
          <Line
            type="monotone"
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
          {t('dashboard.revenue')} {t('dashboard.vsLastYear')}
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

export default RevenueChart;
