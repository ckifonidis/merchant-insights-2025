import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { demographicsData } from '../../data/mockData';

const ShoppingFrequencyChart = ({ filters }) => {
  const { t } = useTranslation();
  const [chartType, setChartType] = useState('bars');

  // Chart type options
  const chartTypeOptions = [
    { value: 'bars', label: t('chartOptions.bars') },
    { value: 'table', label: t('chartOptions.table') }
  ];

  // Process shopping frequency data for chart
  const processFrequencyData = () => {
    const { shoppingFrequency } = demographicsData;

    return Object.keys(shoppingFrequency.merchant).map(frequency => ({
      category: frequency,
      merchant: shoppingFrequency.merchant[frequency],
      competitor: shoppingFrequency.competitor[frequency]
    }));
  };

  const chartData = processFrequencyData();

  // Custom tooltip with absolute values for merchant only
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => {
            const isMerchant = entry.dataKey === 'merchant';
            // Calculate absolute values (mock calculation for demo)
            const absoluteValue = isMerchant ? Math.round(entry.value * 124.56) : null;

            return (
              <div key={index} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="text-sm text-gray-700">
                  {entry.name}: {entry.value}%
                  {isMerchant && absoluteValue && (
                    <span className="text-gray-500 ml-1">({absoluteValue} customers)</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  // Render table view
  const renderTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Transaction Group
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('dashboard.merchant')} (%)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Merchant (Customers)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('dashboard.competition')} (%)
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {chartData.map((row, index) => {
            const absoluteValue = Math.round(row.merchant * 124.56);
            return (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {row.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.merchant}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {absoluteValue}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.competitor}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  // Render chart
  const renderChart = () => {
    if (chartType === 'table') {
      return renderTable();
    }

    return (
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="category"
            angle={-45}
            textAnchor="end"
            height={80}
            fontSize={11}
            interval={0}
          />
          <YAxis label={{ value: '%', angle: -90, position: 'insideLeft' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="merchant" fill="#007B85" name={t('dashboard.merchant')} />
          <Bar dataKey="competitor" fill="#73AA3C" name={t('dashboard.competition')} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
        <div></div>

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="min-w-[120px]">
            <Select
              value={chartTypeOptions.find(option => option.value === chartType)}
              onChange={(selectedOption) => setChartType(selectedOption.value)}
              options={chartTypeOptions}
              isSearchable={false}
              className="text-sm"
              classNamePrefix="select"
            />
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-4">
        {renderChart()}
      </div>

      {/* Note */}
      <div className="mt-4 text-xs text-gray-500">
        <p>Percentage of customers by transaction group. Absolute values shown for merchant only.</p>
      </div>
    </div>
  );
};

export default ShoppingFrequencyChart;
