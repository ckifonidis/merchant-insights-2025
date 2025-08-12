/**
 * Chart Component Type Definitions
 */

// Chart types available in the application
export type ChartType = 'bar' | 'line' | 'pie' | 'table' | 'heatmap' | 'timeline';

// Timeline aggregation options
export type TimelineAggregation = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

// Chart view modes
export type ChartViewMode = 'absolute' | 'percentage' | 'comparison';

// Y-axis mode for time series charts
export type YAxisMode = 'absolute' | 'percentage';

// Chart color configuration
export interface ChartColors {
  merchant: string;
  competitor: string;
  [key: string]: string;
}

// Chart tooltip data
export interface TooltipData {
  label: string;
  value: number;
  formattedValue: string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  color: string;
}

// Chart configuration for Universal components
export interface ChartConfig {
  title: string;
  metricId: string;
  chartType: ChartType;
  colors: ChartColors;
  formatValue?: (value: number) => string;
  formatTooltipValue?: (value: number) => string;
  showLegend?: boolean;
  showGrid?: boolean;
  allowedChartTypes?: ChartType[];
}

// Time series chart specific props
export interface TimeSeriesChartProps {
  metricId: string;
  title?: string;
  yAxisMode?: YAxisMode;
  showCompetitor?: boolean;
  dateRange?: [string, string];
  yearOverYear?: boolean;
  allowedChartTypes?: ChartType[];
  colors?: ChartColors;
  formatValue?: (value: number) => string;
  labels?: {
    merchant: string;
    competitor: string;
  };
}

// Breakdown chart props (pie/bar charts)
export interface BreakdownChartProps {
  metricId: string;
  title?: string;
  chartType?: 'pie' | 'bar' | 'table';
  maxCategories?: number;
  colors?: Record<string, string>;
  formatValue?: (value: number) => string;
  formatTooltipValue?: (value: number) => string;
}

// Bar chart props
export interface BarChartProps {
  metricId: string;
  title?: string;
  maxCategories?: number;
  sortBy?: 'value' | 'category';
  colors?: ChartColors;
  formatValue?: (value: number) => string;
}

// Chart container props
export interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

// Chart selector props
export interface ChartSelectorProps {
  chartType: ChartType;
  onChartTypeChange: (type: ChartType) => void;
  allowedTypes: ChartType[];
  timeline?: TimelineAggregation;
  onTimelineChange?: (timeline: TimelineAggregation) => void;
  allowedTimelines?: TimelineAggregation[];
}

// Chart table props
export interface ChartTableProps {
  data: Array<Record<string, any>>;
  columns: Array<{
    key: string;
    label: string;
    formatter?: (value: any) => string;
  }>;
  sortable?: boolean;
}