import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { demographicsData } from '../../data/mockData';

const ShoppingInterestsChart = ({ filters }) => {
  const { t } = useTranslation();
  const [chartType, setChartType] = useState('bars');

  // Chart type options
  const chartTypeOptions = [
    { value: 'bars', label: 'Horizontal Bars' },
    { value: 'table', label: t('chartOptions.table') }
  ];

  // Process shopping interests data for chart
  const processInterestsData = () => {
    const { interests } = demographicsData;

    // Filter interests with >10% for either merchant or competition, group others
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

    // Add "Other" category if there are grouped interests
    if (otherMerchant > 0 || otherCompetitor > 0) {
      processedData.push({
        category: 'Other',
        merchant: otherMerchant,
        competitor: otherCompetitor
      });
    }

    return processedData;
  };

  const chartData = processInterestsData();

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
              Shopping Interest
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

  // Render horizontal bar chart with reference lines (like age group chart)
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

          // Determine competition line color based on comparison
          const isCompetitorHigher = item.competitor > item.merchant;
          const competitorTextColor = isCompetitorHigher ? 'text-red-600' : 'text-green-600';

          // Wrap long labels
          const wrapLabel = (label) => {
            if (label.length > 20) {
              const words = label.split(' ');
              if (words.length > 1) {
                const mid = Math.ceil(words.length / 2);
                return (
                  <div className="text-right">
                    <div>{words.slice(0, mid).join(' ')}</div>
                    <div>{words.slice(mid).join(' ')}</div>
                  </div>
                );
              }
            }
            return <div className="text-right">{label}</div>;
          };

          return (
            <div key={index} className="flex items-center space-x-4">
              {/* Interest label with wrapping */}
              <div className="w-48 text-sm font-medium text-gray-700 flex-shrink-0">
                {wrapLabel(item.category)}
              </div>

              {/* Bar container */}
              <div className="flex-1 relative">
                {/* Full width grey background bar */}
                <div className="h-8 bg-gray-200 rounded-lg overflow-hidden relative">
                  {/* Merchant colored bar - using standard merchant color */}
                  <div
                    className="h-full transition-all duration-300"
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
        <p>Only interests with &gt;10% for either merchant or competition are shown. Others grouped as "Other".</p>
      </div>
    </div>
  );
};

export default ShoppingInterestsChart;
