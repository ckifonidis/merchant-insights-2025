import React from 'react';
import { useTranslation } from 'react-i18next';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { weeklyTurnoverData } from '../../data/mockData.js';

const WeeklyTurnoverChart = ({ filters }) => {
  const { t } = useTranslation();

  // Custom tooltip with black font
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const value = data.value;
      const formattedDate = new Date(label).toLocaleDateString('el-GR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-black font-medium">{formattedDate}</p>
          <p className="text-black">
            {value > 0 ? '+' : ''}{value.toFixed(2)}%
          </p>
        </div>
      );
    }
    return null;
  };

  // Prepare merchant data
  const merchantData = weeklyTurnoverData.merchant.map((item) => ({
    week: item.week,
    percentageChange: item.percentageChange,
    positiveArea: item.percentageChange > 0 ? item.percentageChange : 0,
    negativeArea: item.percentageChange < 0 ? item.percentageChange : 0
  }));

  // Prepare competition data
  const competitionData = weeklyTurnoverData.competition.map((item) => ({
    week: item.week,
    percentageChange: item.percentageChange,
    positiveArea: item.percentageChange > 0 ? item.percentageChange : 0,
    negativeArea: item.percentageChange < 0 ? item.percentageChange : 0
  }));

  // Single chart component
  const SingleChart = ({ data, title, color }) => (
    <div className="w-full min-w-0">
      <div className="text-sm font-medium text-gray-500 mb-3 text-center">{title}</div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 12, fill: '#666' }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('el-GR', { day: '2-digit', month: '2-digit' });
              }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#666' }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Reference line at 0% */}
            <ReferenceLine y={0} stroke="#666" strokeDasharray="5 5" strokeWidth={1} />

            {/* Positive area (green) */}
            <Area
              type="monotone"
              dataKey="positiveArea"
              fill="#10B981"
              fillOpacity={0.3}
              stroke="none"
            />

            {/* Negative area (red) */}
            <Area
              type="monotone"
              dataKey="negativeArea"
              fill="#EF4444"
              fillOpacity={0.3}
              stroke="none"
            />

            {/* Main line */}
            <Line
              type="monotone"
              dataKey="percentageChange"
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: color, strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="w-full overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SingleChart
          data={merchantData}
          title={t('dashboard.merchant')}
          color="#007B85"
        />
        <SingleChart
          data={competitionData}
          title={t('dashboard.competition')}
          color="#73AA3C"
        />
      </div>
    </div>
  );
};

export default WeeklyTurnoverChart;
