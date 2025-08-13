import React from 'react';
import { useTranslation } from 'react-i18next';
import ChangeIndicator from '../metrics/ChangeIndicator';
import { formatValue } from '../../../utils/formatters';

interface TableColumn {
  key: string;
  label: string;
  render: (value: any, row?: any) => React.ReactNode;
}

interface ChartTableProps {
  data?: any[];
  columns?: TableColumn[];
  maxRows?: number;
  showChange?: boolean;
  className?: string;
  currency?: boolean;
}

/**
 * Reusable table component for chart data display
 * Consolidates the repeated table structure across chart components
 */
const ChartTable: React.FC<ChartTableProps> = ({
  data = [],
  columns = [],
  maxRows = 10,
  showChange = true,
  className = '',
  currency = false
}) => {
  const { t } = useTranslation();

  // Default columns if none provided
  const defaultColumns = [
    {
      key: 'date',
      label: 'Date',
      render: (value) => value
    },
    {
      key: 'merchant',
      label: t('dashboard.merchant'),
      render: (value, row) => (
        <div className="flex items-center justify-between">
          <span>{formatValue(value, currency ? 'currency' : 'number')}</span>
          {showChange && row.merchantChange !== undefined && (
            <ChangeIndicator 
              value={row.merchantChange}
              type="percentage"
              size="xs"
              className="ml-2"
            />
          )}
        </div>
      )
    },
    {
      key: 'competitor',
      label: t('dashboard.competition'),
      render: (value, row) => (
        <div className="flex items-center justify-between">
          <span>{formatValue(value, currency ? 'currency' : 'number')}</span>
          {showChange && row.competitorChange !== undefined && (
            <ChangeIndicator 
              value={row.competitorChange}
              type="percentage"
              size="xs"
              className="ml-2"
            />
          )}
        </div>
      )
    }
  ];

  const tableColumns = columns.length > 0 ? columns : defaultColumns;
  const displayData = data.slice(0, maxRows);

  if (!displayData.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        {t('common.noDataAvailable')}
      </div>
    );
  }

  return (
    <div className={`overflow-auto max-h-64 ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            {tableColumns.map((column, index) => (
              <th
                key={column.key || index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {displayData.map((row, rowIndex) => (
            <tr 
              key={row.id || rowIndex}
              className="hover:bg-gray-50 transition-colors"
            >
              {tableColumns.map((column, colIndex) => {
                const value = row[column.key];
                const cellContent = column.render 
                  ? column.render(value, row, rowIndex) 
                  : value;

                return (
                  <td
                    key={`${rowIndex}-${column.key || colIndex}`}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {cellContent}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      
      {data.length > maxRows && (
        <div className="px-6 py-3 bg-gray-50 text-center text-sm text-gray-500 sticky bottom-0">
          {t('common.showingXOfY', { showing: maxRows, total: data.length })}
        </div>
      )}
    </div>
  );
};

export default ChartTable;