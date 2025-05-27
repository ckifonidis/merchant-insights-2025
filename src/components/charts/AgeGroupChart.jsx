import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { demographicsData } from '../../data/mockData';

const AgeGroupChart = ({ filters }) => {
  const { t } = useTranslation();
  const [chartType, setChartType] = useState('bars');

  // Chart type options
  const chartTypeOptions = [
    { value: 'bars', label: t('chartOptions.bars') },
    { value: 'table', label: t('chartOptions.table') }
  ];

  // Process age group data for chart
  const processAgeGroupData = () => {
    const { ageGroups } = demographicsData;

    return Object.keys(ageGroups.merchant).map(ageGroup => ({
      category: ageGroup,
      merchant: ageGroups.merchant[ageGroup],
      competitor: ageGroups.competitor[ageGroup]
    }));
  };

  const chartData = processAgeGroupData();

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-sm text-gray-700">
                {entry.name}: {entry.value}%
              </span>
            </div>
          ))}
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
              Age Group
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('dashboard.merchant')} (%)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('dashboard.competition')} (%)
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {chartData.map((row, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {row.category}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {row.merchant}%
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {row.competitor}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Render horizontal bar chart with reference lines (as per requirements)
  const renderHorizontalBarChart = () => {
    // Calculate absolute numbers for merchant (mock calculation)
    const totalMerchantCustomers = 12456; // From demographics metrics

    return (
      <div className="space-y-4">
        {chartData.map((item, index) => {
          // All bars use the same scale (0-100%)
          const merchantWidth = item.merchant;
          const competitorPosition = item.competitor;

          // Calculate absolute customer numbers
          const merchantCustomers = Math.round(totalMerchantCustomers * item.merchant / 100);

          // Determine competition text color based on comparison (keep red/green logic for text)
          const isCompetitorHigher = item.competitor > item.merchant;
          const competitorTextColor = isCompetitorHigher ? 'text-red-600' : 'text-green-600';

          return (
            <div key={index} className="flex items-center space-x-4">
              {/* Age group label */}
              <div className="w-40 text-sm font-medium text-gray-700 text-right">
                {item.category}
              </div>

              {/* Bar container */}
              <div className="flex-1 relative">
                {/* Full width grey background bar */}
                <div className="h-8 bg-gray-200 rounded-lg overflow-hidden relative">
                  {/* Merchant colored bar - using standard merchant color */}
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${merchantWidth}%`, backgroundColor: '#007B85' }}
                    title={`${item.merchant}% (${merchantCustomers.toLocaleString()} customers)`}
                  ></div>

                  {/* Competition reference line - always black */}
                  <div
                    className="absolute top-0 h-full w-1 bg-black transition-all duration-300"
                    style={{ left: `${competitorPosition}%` }}
                  ></div>
                </div>

                {/* Values */}
                <div className="flex justify-between mt-1 text-xs">
                  <span className="font-medium" style={{ color: '#007B85' }}>
                    {item.merchant}% ({merchantCustomers.toLocaleString()})
                  </span>
                  <span className={`font-medium ${competitorTextColor}`}>
                    ({item.competitor}%)
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Legend */}
        <div className="flex justify-center space-x-8 mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-3 rounded" style={{ backgroundColor: '#007B85' }}></div>
            <span className="text-sm text-gray-700">{t('dashboard.merchant')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-1 bg-black"></div>
            <span className="text-sm text-gray-700">{t('dashboard.competition')}</span>
          </div>
        </div>
      </div>
    );
  };

  // Render chart
  const renderChart = () => {
    if (chartType === 'table') {
      return renderTable();
    }

    return renderHorizontalBarChart();
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
        <p>Horizontal bars show merchant percentages with competition reference lines</p>
      </div>
    </div>
  );
};

export default AgeGroupChart;
