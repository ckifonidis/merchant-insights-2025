import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { revenueByChannel } from '../../data/mockData';

const RevenueByChannelChart = ({ filters }) => {
  const { t } = useTranslation();
  const [chartType, setChartType] = useState('bars');

  // Transform channel data for visualization
  const channelData = [
    {
      channel: 'Physical Store',
      merchant: Math.round((revenueByChannel.merchant.physical / 100) * 2345678),
      competitor: Math.round((revenueByChannel.competitor.physical / 100) * 2789123),
      merchantPercent: revenueByChannel.merchant.physical,
      competitorPercent: revenueByChannel.competitor.physical
    },
    {
      channel: 'E-commerce',
      merchant: Math.round((revenueByChannel.merchant.ecommerce / 100) * 2345678),
      competitor: Math.round((revenueByChannel.competitor.ecommerce / 100) * 2789123),
      merchantPercent: revenueByChannel.merchant.ecommerce,
      competitorPercent: revenueByChannel.competitor.ecommerce
    }
  ];

  // Data for pie charts
  const merchantPieData = [
    { name: 'Physical Store', value: revenueByChannel.merchant.physical, color: '#007B85' },
    { name: 'E-commerce', value: revenueByChannel.merchant.ecommerce, color: '#4A90A4' }
  ];

  const competitorPieData = [
    { name: 'Physical Store', value: revenueByChannel.competitor.physical, color: '#73AA3C' },
    { name: 'E-commerce', value: revenueByChannel.competitor.ecommerce, color: '#8BC34A' }
  ];

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
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center mt-1">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm">
                {entry.dataKey === 'merchant' ? t('dashboard.merchant') : t('dashboard.competition')}: {formatCurrency(entry.value)}
                <span className="text-gray-500 ml-1">
                  ({entry.dataKey === 'merchant' ? data.merchantPercent : data.competitorPercent}%)
                </span>
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <span className="text-sm">
            {data.name}: {data.value}%
          </span>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (chartType === 'pie') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
          {/* Merchant Pie Chart */}
          <div className="flex flex-col items-center">
            <h4 className="text-sm font-medium text-gray-700 mb-2">{t('dashboard.merchant')}</h4>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={merchantPieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                  labelLine={false}
                >
                  {merchantPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Competitor Pie Chart */}
          <div className="flex flex-col items-center">
            <h4 className="text-sm font-medium text-gray-700 mb-2">{t('dashboard.competition')}</h4>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={competitorPieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                  labelLine={false}
                >
                  {competitorPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }

    if (chartType === 'table') {
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Channel
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
              {channelData.map((row, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.channel}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(row.merchant)}
                    <span className="text-gray-500 ml-1">({row.merchantPercent}%)</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(row.competitor)}
                    <span className="text-gray-500 ml-1">({row.competitorPercent}%)</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <BarChart
        data={channelData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="channel" />
        <YAxis tickFormatter={formatCurrency} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="merchant" fill="#007B85" name={t('dashboard.merchant')} />
        <Bar dataKey="competitor" fill="#73AA3C" name={t('dashboard.competition')} />
      </BarChart>
    );
  };

  return (
    <div className="h-80">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
        {/* Chart Controls */}
        <div className="flex items-center space-x-4">
          {/* View Type Selector */}
          <div className="min-w-32">
            <Select
              value={{ value: chartType, label: t(`chartOptions.${chartType}`) }}
              onChange={(option) => setChartType(option.value)}
              options={[
                { value: 'bars', label: t('chartOptions.bars') },
                { value: 'pie', label: 'Pie Charts' },
                { value: 'table', label: t('chartOptions.table') }
              ]}
              className="text-sm"
              isSearchable={false}
            />
          </div>
        </div>
      </div>

      <div className={chartType === 'table' ? 'max-h-64 overflow-y-auto' : 'h-64'}>
        {chartType === 'table' || chartType === 'pie' ? (
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

export default RevenueByChannelChart;
