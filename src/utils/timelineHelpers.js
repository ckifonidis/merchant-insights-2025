import { format, startOfWeek, startOfMonth, startOfQuarter, startOfYear, endOfWeek, endOfMonth, endOfQuarter, endOfYear, isWithinInterval } from 'date-fns';

/**
 * Process time series data based on timeline selection
 * @param {Array} data - Raw time series data with date field
 * @param {string} timeline - Timeline type: 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
 * @param {Date} startDate - Start date of the filter range
 * @param {Date} endDate - End date of the filter range
 * @returns {Array} Processed data with proper labels and aggregated values
 */
export const processTimelineData = (data, timeline, startDate = null, endDate = null) => {
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

const processDailyData = (data) => {
  // For daily, just return the data as is but limit to reasonable amount
  return data.slice(-30).map(item => ({
    ...item,
    displayDate: format(new Date(item.date), 'dd/MM/yyyy')
  }));
};

const processWeeklyData = (data) => {
  const weeklyGroups = {};

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
    .slice(-20) // Last 20 weeks
    .map(weekKey => {
      const group = weeklyGroups[weekKey];
      const weekStart = new Date(weekKey);
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      
      return {
        date: weekKey,
        displayDate: `${format(weekStart, 'dd/MM')} - ${format(weekEnd, 'dd/MM/yyyy')}`,
        merchantTransactions: Math.round(average(group.merchantTransactions)),
        competitorTransactions: Math.round(average(group.competitorTransactions)),
        merchantRevenue: Math.round(average(group.merchantRevenue)),
        competitorRevenue: Math.round(average(group.competitorRevenue)),
        merchantCustomers: Math.round(average(group.merchantCustomers))
      };
    });
};

const processMonthlyData = (data) => {
  const monthlyGroups = {};

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
    .slice(-12) // Last 12 months
    .map(monthKey => {
      const group = monthlyGroups[monthKey];
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

const processQuarterlyData = (data) => {
  const quarterlyGroups = {};

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
    .slice(-8) // Last 8 quarters
    .map(quarterKey => {
      const group = quarterlyGroups[quarterKey];
      const quarterStart = new Date(quarterKey.replace('-Q', '-') + '-01');
      const quarter = Math.ceil((quarterStart.getMonth() + 1) / 3);
      
      return {
        date: quarterKey,
        displayDate: `Q${quarter} ${quarterStart.getFullYear()}`, // e.g., "Q2 2025"
        merchantTransactions: Math.round(sum(group.merchantTransactions)),
        competitorTransactions: Math.round(sum(group.competitorTransactions)),
        merchantRevenue: Math.round(sum(group.merchantRevenue)),
        competitorRevenue: Math.round(sum(group.competitorRevenue)),
        merchantCustomers: Math.round(sum(group.merchantCustomers))
      };
    });
};

const processYearlyData = (data) => {
  const yearlyGroups = {};

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
    .slice(-3) // Last 3 years
    .map(yearKey => {
      const group = yearlyGroups[yearKey];
      
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

// Helper functions
const sum = (arr) => arr.reduce((acc, val) => acc + val, 0);
const average = (arr) => arr.length > 0 ? sum(arr) / arr.length : 0;
