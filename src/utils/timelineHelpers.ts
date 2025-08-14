import { format, startOfWeek, startOfMonth, startOfQuarter, startOfYear, endOfWeek } from 'date-fns';

// TypeScript types
export type TimelineType = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface TimeSeriesDataPoint {
  date: string;
  displayDate: string;
  merchantRevenue: number;
  competitorRevenue: number;
  merchantTransactions?: number;
  competitorTransactions?: number;
  merchantCustomers?: number;
}

interface GroupedData {
  dates: string[];
  merchantTransactions: number[];
  competitorTransactions: number[];
  merchantRevenue: number[];
  competitorRevenue: number[];
  merchantCustomers: number[];
}

interface ProcessedDataPoint extends TimeSeriesDataPoint {
  merchantTransactions: number;
  competitorTransactions: number;
  merchantCustomers: number;
}

interface TimelineConfig {
  timelineRules?: {
    weekly?: number;
    monthly?: number;
    quarterly?: number;
    yearly?: number;
  };
}

/**
 * Process time series data based on timeline selection
 */
export const processTimelineData = (
  data: TimeSeriesDataPoint[], 
  timeline: TimelineType, 
  startDate: Date | null = null, 
  endDate: Date | null = null
): TimeSeriesDataPoint[] => {
  if (!data || data.length === 0) return [];

  // Filter data by date range if provided
  let filteredData = data;
  if (startDate && endDate) {
    filteredData = data.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate <= endDate;
    });
  }

  switch (timeline) {
    case 'daily':
      return processDailyData(filteredData);
    case 'weekly':
      return processWeeklyData(filteredData);
    case 'monthly':
      return processMonthlyData(filteredData);
    case 'quarterly':
      return processQuarterlyData(filteredData);
    case 'yearly':
      return processYearlyData(filteredData);
    default:
      return processDailyData(filteredData);
  }
};

const processDailyData = (data: TimeSeriesDataPoint[]): TimeSeriesDataPoint[] => {
  // For daily, return all filtered data
  return data.map(item => ({
    ...item,
    displayDate: format(new Date(item.date), 'dd/MM/yyyy')
  }));
};

const processWeeklyData = (data: TimeSeriesDataPoint[]): ProcessedDataPoint[] => {
  const weeklyGroups: Record<string, GroupedData> = {};

  data.forEach(item => {
    const date = new Date(item.date);
    const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday start
    const weekKey = format(weekStart, 'yyyy-MM-dd');

    if (!weeklyGroups[weekKey]) {
      weeklyGroups[weekKey] = {
        dates: [],
        merchantTransactions: [],
        competitorTransactions: [],
        merchantRevenue: [],
        competitorRevenue: [],
        merchantCustomers: []
      };
    }

    weeklyGroups[weekKey].dates.push(item.date);
    weeklyGroups[weekKey].merchantTransactions.push(item.merchantTransactions || 0);
    weeklyGroups[weekKey].competitorTransactions.push(item.competitorTransactions || 0);
    weeklyGroups[weekKey].merchantRevenue.push(item.merchantRevenue || 0);
    weeklyGroups[weekKey].competitorRevenue.push(item.competitorRevenue || 0);
    weeklyGroups[weekKey].merchantCustomers.push(item.merchantCustomers || 0);
  });

  return Object.keys(weeklyGroups)
    .sort()
    .map(weekKey => {
      const group = weeklyGroups[weekKey];
      if (!group) {
        throw new Error(`Group not found for week key: ${weekKey}`);
      }
      const weekStart = new Date(weekKey);
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      
      return {
        date: weekKey,
        displayDate: `${format(weekStart, 'dd/MM')} - ${format(weekEnd, 'dd/MM/yyyy')}`,
        merchantTransactions: Math.round(sum(group.merchantTransactions)),
        competitorTransactions: Math.round(sum(group.competitorTransactions)),
        merchantRevenue: Math.round(sum(group.merchantRevenue)),
        competitorRevenue: Math.round(sum(group.competitorRevenue)),
        merchantCustomers: Math.round(sum(group.merchantCustomers))
      };
    });
};

const processMonthlyData = (data: TimeSeriesDataPoint[]): ProcessedDataPoint[] => {
  const monthlyGroups: Record<string, GroupedData> = {};

  data.forEach(item => {
    const date = new Date(item.date);
    const monthStart = startOfMonth(date);
    const monthKey = format(monthStart, 'yyyy-MM');

    if (!monthlyGroups[monthKey]) {
      monthlyGroups[monthKey] = {
        dates: [],
        merchantTransactions: [],
        competitorTransactions: [],
        merchantRevenue: [],
        competitorRevenue: [],
        merchantCustomers: []
      };
    }

    monthlyGroups[monthKey].dates.push(item.date);
    monthlyGroups[monthKey].merchantTransactions.push(item.merchantTransactions || 0);
    monthlyGroups[monthKey].competitorTransactions.push(item.competitorTransactions || 0);
    monthlyGroups[monthKey].merchantRevenue.push(item.merchantRevenue || 0);
    monthlyGroups[monthKey].competitorRevenue.push(item.competitorRevenue || 0);
    monthlyGroups[monthKey].merchantCustomers.push(item.merchantCustomers || 0);
  });

  return Object.keys(monthlyGroups)
    .sort()
    .map(monthKey => {
      const group = monthlyGroups[monthKey];
      if (!group) {
        throw new Error(`Group not found for month key: ${monthKey}`);
      }
      const monthStart = new Date(monthKey + '-01');
      
      return {
        date: monthKey,
        displayDate: format(monthStart, 'MMM yyyy'), // e.g., "Apr 2025"
        merchantTransactions: Math.round(sum(group.merchantTransactions)),
        competitorTransactions: Math.round(sum(group.competitorTransactions)),
        merchantRevenue: Math.round(sum(group.merchantRevenue)),
        competitorRevenue: Math.round(sum(group.competitorRevenue)),
        merchantCustomers: Math.round(sum(group.merchantCustomers))
      };
    });
};

const processQuarterlyData = (data: TimeSeriesDataPoint[]): ProcessedDataPoint[] => {
  const quarterlyGroups: Record<string, GroupedData> = {};

  data.forEach(item => {
    const date = new Date(item.date);
    const quarterStart = startOfQuarter(date);
    const quarterKey = format(quarterStart, 'yyyy-QQ');

    if (!quarterlyGroups[quarterKey]) {
      quarterlyGroups[quarterKey] = {
        dates: [],
        merchantTransactions: [],
        competitorTransactions: [],
        merchantRevenue: [],
        competitorRevenue: [],
        merchantCustomers: []
      };
    }

    quarterlyGroups[quarterKey].dates.push(item.date);
    quarterlyGroups[quarterKey].merchantTransactions.push(item.merchantTransactions || 0);
    quarterlyGroups[quarterKey].competitorTransactions.push(item.competitorTransactions || 0);
    quarterlyGroups[quarterKey].merchantRevenue.push(item.merchantRevenue || 0);
    quarterlyGroups[quarterKey].competitorRevenue.push(item.competitorRevenue || 0);
    quarterlyGroups[quarterKey].merchantCustomers.push(item.merchantCustomers || 0);
  });

  return Object.keys(quarterlyGroups)
    .sort()
    .map(quarterKey => {
      const group = quarterlyGroups[quarterKey];
      if (!group) {
        throw new Error(`Group not found for quarter key: ${quarterKey}`);
      }
      
      // Parse quarter from quarterKey format 'yyyy-QQ' (e.g., '2024-02' for Q2)
      const [year, quarterPart] = quarterKey.split('-');
      if (!year || !quarterPart) {
        throw new Error(`Invalid quarter key format: ${quarterKey}`);
      }
      const quarter = parseInt(quarterPart, 10); // QQ format gives 01, 02, 03, 04
      
      return {
        date: quarterKey,
        displayDate: `Q${quarter} ${year}`, // e.g., "Q2 2025"
        merchantTransactions: Math.round(sum(group.merchantTransactions)),
        competitorTransactions: Math.round(sum(group.competitorTransactions)),
        merchantRevenue: Math.round(sum(group.merchantRevenue)),
        competitorRevenue: Math.round(sum(group.competitorRevenue)),
        merchantCustomers: Math.round(sum(group.merchantCustomers))
      };
    });
};

const processYearlyData = (data: TimeSeriesDataPoint[]): ProcessedDataPoint[] => {
  const yearlyGroups: Record<string, GroupedData> = {};

  data.forEach(item => {
    const date = new Date(item.date);
    const yearStart = startOfYear(date);
    const yearKey = format(yearStart, 'yyyy');

    if (!yearlyGroups[yearKey]) {
      yearlyGroups[yearKey] = {
        dates: [],
        merchantTransactions: [],
        competitorTransactions: [],
        merchantRevenue: [],
        competitorRevenue: [],
        merchantCustomers: []
      };
    }

    yearlyGroups[yearKey].dates.push(item.date);
    yearlyGroups[yearKey].merchantTransactions.push(item.merchantTransactions || 0);
    yearlyGroups[yearKey].competitorTransactions.push(item.competitorTransactions || 0);
    yearlyGroups[yearKey].merchantRevenue.push(item.merchantRevenue || 0);
    yearlyGroups[yearKey].competitorRevenue.push(item.competitorRevenue || 0);
    yearlyGroups[yearKey].merchantCustomers.push(item.merchantCustomers || 0);
  });

  return Object.keys(yearlyGroups)
    .sort()
    .map(yearKey => {
      const group = yearlyGroups[yearKey];
      if (!group) {
        throw new Error(`Group not found for year key: ${yearKey}`);
      }
      
      return {
        date: yearKey,
        displayDate: yearKey, // e.g., "2025"
        merchantTransactions: Math.round(sum(group.merchantTransactions)),
        competitorTransactions: Math.round(sum(group.competitorTransactions)),
        merchantRevenue: Math.round(sum(group.merchantRevenue)),
        competitorRevenue: Math.round(sum(group.competitorRevenue)),
        merchantCustomers: Math.round(sum(group.merchantCustomers))
      };
    });
};

/**
 * Get available timeline options based on date range
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @param config - Optional configuration overrides
 * @returns Array of available timeline values
 */
export const getAvailableTimelines = (
  startDate: string | null,
  endDate: string | null,
  config: TimelineConfig = {}
): TimelineType[] => {
  if (!startDate || !endDate) {
    console.warn('getAvailableTimelines: Invalid date inputs, defaulting to daily only');
    return ['daily'];
  }

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.warn('getAvailableTimelines: Invalid date format, defaulting to daily only');
      return ['daily'];
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Configuration-driven availability rules (matches documentation requirements)
    const rules = {
      weekly: 14,     // Weekly becomes available when at least 14 days are selected
      monthly: 30,    // Monthly becomes available when at least 30 days are selected
      quarterly: 90,  // Quarterly becomes available when at least 90 days are selected
      yearly: 365,    // Yearly becomes available when at least 365 days are selected
      ...config.timelineRules // Allow configuration override
    };

    const available: TimelineType[] = ['daily']; // Always available
    
    if (days >= rules.weekly) available.push('weekly');
    if (days >= rules.monthly) available.push('monthly');
    if (days >= rules.quarterly) available.push('quarterly');
    if (days >= rules.yearly) available.push('yearly');
    
    console.log(`📅 Timeline availability for ${days} days:`, available);
    return available;
  } catch (error) {
    console.error('Error calculating timeline availability:', error);
    return ['daily'];
  }
};

// Helper functions
const sum = (arr: number[]): number => arr.reduce((acc, val) => acc + val, 0);
const average = (arr: number[]): number => arr.length > 0 ? sum(arr) / arr.length : 0;
