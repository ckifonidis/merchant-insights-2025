import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { demographicsData } from '../../data/mockData';
import { useResponsive } from '../../hooks/useResponsive';

const GenderChart = ({ filters }) => {
  const { t } = useTranslation();
  const [chartType, setChartType] = useState('stacked');
  const { isMobile, isTablet } = useResponsive();

  // Chart type options - removed 'bars', added 'pie'
  const chartTypeOptions = [
    { value: 'stacked', label: 'Stacked Bar' },
    { value: 'pie', label: 'Pie Charts' },
    { value: 'table', label: t('chartOptions.table') }
  ];

  // Process gender data for chart
  const processGenderData = () => {
    const { gender } = demographicsData;

    return [
      {
        category: t('genders.male'),
        merchant: gender.merchant.male,
        competitor: gender.competitor.male
      },
      {
        category: t('genders.female'),
        merchant: gender.merchant.female,
        competitor: gender.competitor.female
      }
    ];
  };

  const chartData = processGenderData();

  // Consistent colors for genders (same as stacked bar)
  const genderColors = {
    'Male': '#3B82F6', // blue-500
    'Female': '#F472B6' // pink-400
  };

  // Data for pie charts - using consistent colors
  const { gender } = demographicsData;
  const merchantPieData = [
    {
      name: t('genders.male'),
      value: gender.merchant.male,
      percentage: gender.merchant.male,
      color: genderColors['Male']
    },
    {
      name: t('genders.female'),
      value: gender.merchant.female,
      percentage: gender.merchant.female,
      color: genderColors['Female']
    }
  ];

  const competitorPieData = [
    {
      name: t('genders.male'),
      value: gender.competitor.male,
      percentage: gender.competitor.male,
      color: genderColors['Male']
    },
    {
      name: t('genders.female'),
      value: gender.competitor.female,
      percentage: gender.competitor.female,
      color: genderColors['Female']
    }
  ];

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

  // Pie chart tooltip (following RevenueByChannel pattern)
  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-black">{data.name}: {data.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  // Calculate responsive pie chart radius (reduced to leave space for labels)
  const getPieRadius = () => {
    if (isMobile) return 40;
    if (isTablet) return 50;
    return 60;
  };

  // Custom label function with labels outside for all screen sizes
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;

    // Position labels outside the pie for all screen sizes
    const labelRadius = outerRadius + 20;

    const x = cx + labelRadius * Math.cos(-midAngle * RADIAN);
    const y = cy + labelRadius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#374151" // Dark text for all screen sizes
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Render table view
  const renderTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Gender
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

  // Render stacked bar visualization
  const renderStackedBars = () => {
    const { gender } = demographicsData;

    // Calculate absolute numbers for merchant (mock calculation)
    const totalMerchantCustomers = 12456; // From demographics metrics
    const merchantMaleCustomers = Math.round(totalMerchantCustomers * gender.merchant.male / 100);
    const merchantFemaleCustomers = Math.round(totalMerchantCustomers * gender.merchant.female / 100);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Merchant Stacked Bar */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">{t('dashboard.merchant')}</h4>
          <div className="w-full h-12 bg-gray-100 rounded-lg overflow-hidden mb-3 relative group">
            <div className="flex h-full">
              <div
                className="h-full bg-blue-500 transition-all duration-300 relative"
                style={{ width: `${gender.merchant.male}%` }}
                title={`${t('genders.male')}: ${gender.merchant.male}% (${merchantMaleCustomers.toLocaleString()} customers)`}
              ></div>
              <div
                className="h-full bg-pink-400 transition-all duration-300 relative"
                style={{ width: `${gender.merchant.female}%` }}
                title={`${t('genders.female')}: ${gender.merchant.female}% (${merchantFemaleCustomers.toLocaleString()} customers)`}
              ></div>
            </div>

            {/* Hover tooltip */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                Total: {totalMerchantCustomers.toLocaleString()} customers
              </div>
            </div>
          </div>
          {/* Legend for Merchant */}
          <div className="flex justify-center space-x-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-sm mr-2"></div>
              <span className="text-sm text-gray-700">{t('genders.male')} ({gender.merchant.male}% - {merchantMaleCustomers.toLocaleString()})</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-pink-400 rounded-sm mr-2"></div>
              <span className="text-sm text-gray-700">{t('genders.female')} ({gender.merchant.female}% - {merchantFemaleCustomers.toLocaleString()})</span>
            </div>
          </div>
        </div>

        {/* Competition Stacked Bar */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">{t('dashboard.competition')}</h4>
          <div className="w-full h-12 bg-gray-100 rounded-lg overflow-hidden mb-3">
            <div className="flex h-full">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${gender.competitor.male}%` }}
              ></div>
              <div
                className="h-full bg-pink-400 transition-all duration-300"
                style={{ width: `${gender.competitor.female}%` }}
              ></div>
            </div>
          </div>
          {/* Legend for Competition */}
          <div className="flex justify-center space-x-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-sm mr-2"></div>
              <span className="text-sm text-gray-700">{t('genders.male')} ({gender.competitor.male}%)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-pink-400 rounded-sm mr-2"></div>
              <span className="text-sm text-gray-700">{t('genders.female')} ({gender.competitor.female}%)</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render pie charts (following RevenueByChannel pattern)
  const renderPieCharts = () => {
    return (
      <div className="flex flex-col h-full">
        <div className={`grid gap-4 flex-grow ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
          {/* Merchant Pie Chart */}
          <div className="flex flex-col items-center min-h-0">
            <h4 className="text-sm font-medium text-gray-700 mb-2">{t('dashboard.merchant')}</h4>
            <div className="w-full h-56 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={merchantPieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={getPieRadius()}
                    innerRadius={0}
                    dataKey="value"
                    label={renderCustomLabel}
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
          </div>

          {/* Competitor Pie Chart */}
          <div className="flex flex-col items-center min-h-0">
            <h4 className="text-sm font-medium text-gray-700 mb-2">{t('dashboard.competition')}</h4>
            <div className="w-full h-56 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={competitorPieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={getPieRadius()}
                    innerRadius={0}
                    dataKey="value"
                    label={renderCustomLabel}
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
        </div>

        {/* Common Color Legend */}
        <div className="flex justify-center mt-4">
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-sm mr-2"
                style={{ backgroundColor: genderColors['Male'] }}
              ></div>
              <span className="text-sm text-gray-700">{t('genders.male')}</span>
            </div>
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-sm mr-2"
                style={{ backgroundColor: genderColors['Female'] }}
              ></div>
              <span className="text-sm text-gray-700">{t('genders.female')}</span>
            </div>
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

    if (chartType === 'stacked') {
      return renderStackedBars();
    }

    if (chartType === 'pie') {
      return renderPieCharts();
    }

    // Default fallback (should not be reached)
    return renderStackedBars();
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
      <div className={
        chartType === 'table' ? 'mt-4 max-h-64 overflow-y-auto' :
        isMobile && chartType === 'pie' ? 'mt-4 h-auto min-h-96' :
        'mt-4 h-64'
      }>
        {renderChart()}
      </div>

      {/* Note */}
      <div className="mt-4 text-xs text-gray-500">
        <p>{t('common.genderChartNote')}</p>
      </div>
    </div>
  );
};

export default GenderChart;
