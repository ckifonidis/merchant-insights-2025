import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { revenueByInterests } from '../../data/mockData';

const RevenueByInterestsChart = ({ filters }) => {
  const { t } = useTranslation();
  const [chartType, setChartType] = useState('bars');

  // Use mock data and take top 6 interests for better visualization
  const chartData = revenueByInterests
    .sort((a, b) => (b.merchant + b.competitor) - (a.merchant + a.competitor))
    .slice(0, 6)
    .map(item => ({
      interest: item.interest.length > 15 ? item.interest.substring(0, 15) + '...' : item.interest,
      fullInterest: item.interest,
      merchant: item.merchant,
      competitor: item.competitor
    }));

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
          <p className="font-medium text-gray-900 mb-2">{data.fullInterest}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center mt-1">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm">
                {entry.dataKey === 'merchant' ? t('dashboard.merchant') : t('dashboard.competition')}: {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (chartType === 'table') {
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shopping Interest
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
              {chartData.map((row, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.fullInterest}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(row.merchant)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(row.competitor)}
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
        data={chartData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="interest"
          angle={-45}
          textAnchor="end"
          height={100}
          fontSize={11}
          interval={0}
        />
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
      <div className="flex justify-end mb-4">
        {/* Chart Type Selector - Upper Right */}
        <div className="min-w-32">
          <Select
            value={{ value: chartType, label: t(`chartOptions.${chartType}`) }}
            onChange={(option) => setChartType(option.value)}
            options={[
              { value: 'bars', label: t('chartOptions.bars') },
              { value: 'table', label: t('chartOptions.table') }
            ]}
            className="text-sm"
            isSearchable={false}
          />
        </div>
      </div>

      <div className={chartType === 'table' ? 'max-h-64 overflow-y-auto' : 'h-64'}>
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

export default RevenueByInterestsChart;
