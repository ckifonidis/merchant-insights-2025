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

  // Combine merchant and competition data
  const combinedData = weeklyTurnoverData.merchant.map((merchantItem, index) => {
    const competitionItem = weeklyTurnoverData.competition[index];
    return {
      week: merchantItem.week,
      percentageChange: merchantItem.percentageChange,
      competitionChange: competitionItem ? competitionItem.percentageChange : 0,
      positiveArea: merchantItem.percentageChange > 0 ? merchantItem.percentageChange : 0,
      negativeArea: merchantItem.percentageChange < 0 ? merchantItem.percentageChange : 0
    };
  });

  const chartData = combinedData;

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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

          {/* Merchant line */}
          <Line
            type="monotone"
            dataKey="percentageChange"
            stroke="#007B85"
            strokeWidth={2}
            dot={{ fill: "#007B85", strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, stroke: "#007B85", strokeWidth: 2 }}
            name={t('dashboard.merchant')}
          />

          {/* Competition line */}
          <Line
            type="monotone"
            dataKey="competitionChange"
            stroke="#73AA3C"
            strokeWidth={2}
            dot={{ fill: "#73AA3C", strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, stroke: "#73AA3C", strokeWidth: 2 }}
            name={t('dashboard.competition')}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyTurnoverChart;
