import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { revenueByChannel } from '../../data/mockData';

const RevenueByChannelChart = ({ filters }) => {
  const { t } = useTranslation();
  const [chartType, setChartType] = useState('stackedBar');

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

  // Consistent colors for channels across merchant and competition
  const channelColors = {
    'Physical Store': '#007B85',
    'E-commerce': '#7BB3C0'
  };

  // Data for pie charts - using consistent colors
  const merchantPieData = [
    {
      name: 'Physical Store',
      value: revenueByChannel.merchant.physical,
      percentage: Math.round((revenueByChannel.merchant.physical / (revenueByChannel.merchant.physical + revenueByChannel.merchant.ecommerce)) * 100),
      color: channelColors['Physical Store']
    },
    {
      name: 'E-commerce',
      value: revenueByChannel.merchant.ecommerce,
      percentage: Math.round((revenueByChannel.merchant.ecommerce / (revenueByChannel.merchant.physical + revenueByChannel.merchant.ecommerce)) * 100),
      color: channelColors['E-commerce']
    }
  ];

  const competitorPieData = [
    {
      name: 'Physical Store',
      value: revenueByChannel.competitor.physical,
      percentage: Math.round((revenueByChannel.competitor.physical / (revenueByChannel.competitor.physical + revenueByChannel.competitor.ecommerce)) * 100),
      color: channelColors['Physical Store']
    },
    {
      name: 'E-commerce',
      value: revenueByChannel.competitor.ecommerce,
      percentage: Math.round((revenueByChannel.competitor.ecommerce / (revenueByChannel.competitor.physical + revenueByChannel.competitor.ecommerce)) * 100),
      color: channelColors['E-commerce']
    }
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
      const data = payload[0].payload; // Access the payload data
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-black">{data.name}: {data.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (chartType === 'pie') {
      return (
        <div className="flex flex-col h-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
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
                    label={(entry) => `${entry.percentage}%`}
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
                    label={(entry) => `${entry.percentage}%`}
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

          {/* Common Color Legend */}
          <div className="flex justify-center mt-4">
            <div className="flex items-center space-x-6">
              {Object.entries(channelColors).map(([channel, color]) => (
                <div key={channel} className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm text-gray-700">{channel}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (chartType === 'stackedBar') {
      // Calculate total revenue for each entity
      const totalMerchantRevenue = Math.round((revenueByChannel.merchant.physical / 100) * 2345678) +
                                   Math.round((revenueByChannel.merchant.ecommerce / 100) * 2345678);
      const totalCompetitorRevenue = Math.round((revenueByChannel.competitor.physical / 100) * 2789123) +
                                     Math.round((revenueByChannel.competitor.ecommerce / 100) * 2789123);

      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Merchant Stacked Bar */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">{t('dashboard.merchant')}</h4>
            <div className="w-full h-12 bg-gray-100 rounded-lg overflow-hidden mb-3 relative group">
              <div className="flex h-full">
                <div
                  className="h-full transition-all duration-300 relative"
                  style={{
                    width: `${revenueByChannel.merchant.physical}%`,
                    backgroundColor: channelColors['Physical Store']
                  }}
                  title={`Physical Store: ${revenueByChannel.merchant.physical}% (${formatCurrency(Math.round((revenueByChannel.merchant.physical / 100) * 2345678))})`}
                ></div>
                <div
                  className="h-full transition-all duration-300 relative"
                  style={{
                    width: `${revenueByChannel.merchant.ecommerce}%`,
                    backgroundColor: channelColors['E-commerce']
                  }}
                  title={`E-commerce: ${revenueByChannel.merchant.ecommerce}% (${formatCurrency(Math.round((revenueByChannel.merchant.ecommerce / 100) * 2345678))})`}
                ></div>
              </div>

              {/* Hover tooltip */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                  Total: {formatCurrency(totalMerchantRevenue)}
                </div>
              </div>
            </div>
            {/* Legend for Merchant */}
            <div className="flex justify-center space-x-6">
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-sm mr-2"
                  style={{ backgroundColor: channelColors['Physical Store'] }}
                ></div>
                <span className="text-sm text-gray-700">
                  Physical Store ({revenueByChannel.merchant.physical}% - {formatCurrency(Math.round((revenueByChannel.merchant.physical / 100) * 2345678))})
                </span>
              </div>
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-sm mr-2"
                  style={{ backgroundColor: channelColors['E-commerce'] }}
                ></div>
                <span className="text-sm text-gray-700">
                  E-commerce ({revenueByChannel.merchant.ecommerce}% - {formatCurrency(Math.round((revenueByChannel.merchant.ecommerce / 100) * 2345678))})
                </span>
              </div>
            </div>
          </div>

          {/* Competition Stacked Bar */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">{t('dashboard.competition')}</h4>
            <div className="w-full h-12 bg-gray-100 rounded-lg overflow-hidden mb-3">
              <div className="flex h-full">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${revenueByChannel.competitor.physical}%`,
                    backgroundColor: channelColors['Physical Store']
                  }}
                ></div>
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${revenueByChannel.competitor.ecommerce}%`,
                    backgroundColor: channelColors['E-commerce']
                  }}
                ></div>
              </div>
            </div>
            {/* Legend for Competition */}
            <div className="flex justify-center space-x-6">
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-sm mr-2"
                  style={{ backgroundColor: channelColors['Physical Store'] }}
                ></div>
                <span className="text-sm text-gray-700">
                  Physical Store ({revenueByChannel.competitor.physical}%)
                </span>
              </div>
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-sm mr-2"
                  style={{ backgroundColor: channelColors['E-commerce'] }}
                ></div>
                <span className="text-sm text-gray-700">
                  E-commerce ({revenueByChannel.competitor.ecommerce}%)
                </span>
              </div>
            </div>
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

    // Default case - should not reach here, but return null as fallback
    return null;
  };

  return (
    <div className="h-80">
      <div className="flex justify-end mb-4">
        {/* Chart Type Selector - Upper Right */}
        <div className="min-w-32">
          <Select
            value={{
              value: chartType,
              label: chartType === 'stackedBar' ? 'Stacked Bar' :
                     chartType === 'pie' ? 'Pie Charts' :
                     t(`chartOptions.${chartType}`)
            }}
            onChange={(option) => setChartType(option.value)}
            options={[
              { value: 'stackedBar', label: 'Stacked Bar' },
              { value: 'pie', label: 'Pie Charts' },
              { value: 'table', label: t('chartOptions.table') }
            ]}
            className="text-sm"
            isSearchable={false}
          />
        </div>
      </div>

      <div className={chartType === 'table' ? 'max-h-64 overflow-y-auto' : 'h-64'}>
        {chartType === 'table' || chartType === 'pie' || chartType === 'stackedBar' ? (
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
