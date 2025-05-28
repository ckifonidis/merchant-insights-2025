import { subDays, format, startOfYear } from 'date-fns';

// Generate date range from 2023-01-01 to yesterday
const generateDateRange = () => {
  const start = startOfYear(new Date(2023, 0, 1));
  const end = subDays(new Date(), 1);
  const dates = [];

  let current = start;
  while (current <= end) {
    dates.push(new Date(current));
    current = new Date(current.getTime() + 24 * 60 * 60 * 1000);
  }

  return dates;
};

// Shopping interests
export const shoppingInterests = [
  'Automotive & Fuel Products',
  'Electronics & Household Appliances',
  'Telecommunication',
  'Health & Medical Care',
  'Entertainment & Hobbies',
  'Education',
  'Toys',
  'Travel & Transportation',
  'Personal Care',
  'Pets',
  'Fashion, Cosmetics & Jewelry',
  'Tourism',
  'Home & Garden',
  'Restaurants, Bars, Fast Food & Coffee',
  'Food & Drinks'
];

// Greek locations (mock data)
export const greekLocations = {
  'ΑΤΤΙΚΗ': {
    'ΒΟΡΕΙΟΣ ΤΟΜΕΑΣ ΑΘΗΝΩΝ': ['ΧΑΛΑΝΔΡΙ', 'ΜΑΡΟΥΣΙ', 'ΚΗΦΙΣΙΑ'],
    'ΝΟΤΙΟΣ ΤΟΜΕΑΣ ΑΘΗΝΩΝ': ['ΓΛΥΦΑΔΑ', 'ΒΟΥΛΑ', 'ΕΛΛΗΝΙΚΟ'],
    'ΚΕΝΤΡΙΚΟΣ ΤΟΜΕΑΣ ΑΘΗΝΩΝ': ['ΑΘΗΝΑ', 'ΖΩΓΡΑΦΟΥ', 'ΚΑΙΣΑΡΙΑΝΗ']
  },
  'ΘΕΣΣΑΛΟΝΙΚΗ': {
    'ΘΕΣΣΑΛΟΝΙΚΗ': ['ΠΥΛΑΙΑ', 'ΚΑΛΑΜΑΡΙΑ', 'ΝΕΑΠΟΛΗ']
  },
  'ΚΡΗΤΗ': {
    'ΧΑΝΙΑ': ['ΣΦΑΚΙΑ', 'ΚΙΣΣΑΜΟΣ', 'ΠΛΑΤΑΝΙΑΣ'],
    'ΗΡΑΚΛΕΙΟ': ['ΑΡΧΑΝΕΣ', 'ΓΟΡΓΟΛΑΙΝΙ', 'ΤΕΜΕΝΟΣ']
  }
};

// Store names
export const stores = [
  'Store Central Athens',
  'Store Thessaloniki',
  'Store Patras',
  'Store Heraklion',
  'Store Larissa'
];

// Merchant info
export const merchantInfo = {
  name: 'Random Walk',
  isGoForMore: true
};

// Generate random data with trends
const generateRandomData = (baseValue, trend = 0, variance = 0.2) => {
  return baseValue * (1 + trend + (Math.random() - 0.5) * variance);
};

// Generate time series data with optional date range filtering
export const generateTimeSeriesData = (startDate = null, endDate = null) => {
  const dates = generateDateRange();
  let filteredDates = dates;

  // Filter dates based on provided date range
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    filteredDates = dates.filter(date => date >= start && date <= end);
  }

  const data = [];

  filteredDates.forEach((date, index) => {
    const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const seasonalFactor = 1 + 0.3 * Math.sin((dayOfYear / 365) * 2 * Math.PI);

    data.push({
      date: format(date, 'yyyy-MM-dd'),
      merchantTransactions: Math.floor(generateRandomData(150, 0.1, 0.3) * seasonalFactor),
      competitorTransactions: Math.floor(generateRandomData(180, 0.05, 0.25) * seasonalFactor),
      merchantRevenue: generateRandomData(6500, 0.08, 0.4) * seasonalFactor,
      competitorRevenue: generateRandomData(8200, 0.04, 0.3) * seasonalFactor,
      merchantCustomers: Math.floor(generateRandomData(120, 0.12, 0.35) * seasonalFactor)
    });
  });

  return data;
};

// Dashboard metrics
export const dashboardMetrics = {
  merchant: {
    totalTransactions: 45678,
    totalRevenue: 2345678.90,
    avgTransaction: 51.34,
    changeFromLastYear: {
      transactions: 8.2,
      revenue: 12.5,
      avgTransaction: 2.1
    }
  },
  competitor: {
    totalTransactions: 52341,
    totalRevenue: 2789123.45,
    avgTransaction: 53.28,
    changeFromLastYear: {
      transactions: 4.5,
      revenue: 5.8,
      avgTransaction: -1.2
    }
  }
};

// Revenue metrics
export const revenueMetrics = {
  merchant: {
    totalRevenue: 2345678.90,
    avgDailyRevenue: 15678.52,
    avgTransaction: 51.34,
    goForMore: {
      totalRevenue: 456789.12,
      totalRewarded: 23456.78,
      totalRedeemed: 18765.43
    }
  }
};

// Customer demographics metrics
export const customerMetrics = {
  totalCustomers: 12456,
  newCustomers: 2345,
  returningCustomers: 8765,
  topSpenders: 1234,
  loyalCustomers: 3456,
  atRiskCustomers: 567
};

// Demographics data
export const demographicsData = {
  gender: {
    merchant: { male: 45, female: 55 },
    competitor: { male: 48, female: 52 }
  },
  ageGroups: {
    merchant: {
      'Generation Z (18-24)': 15,
      'Millennials (25-40)': 35,
      'Generation X (41-56)': 30,
      'Baby Boomers (57-75)': 18,
      'Silent Generation (76-96)': 2
    },
    competitor: {
      'Generation Z (18-24)': 18,
      'Millennials (25-40)': 32,
      'Generation X (41-56)': 28,
      'Baby Boomers (57-75)': 20,
      'Silent Generation (76-96)': 2
    }
  },
  shoppingFrequency: {
    merchant: {
      '1 transaction': 25,
      '2 transactions': 20,
      '3 transactions': 15,
      '4-10 transactions': 30,
      '10+ transactions': 10
    },
    competitor: {
      '1 transaction': 30,
      '2 transactions': 22,
      '3 transactions': 18,
      '4-10 transactions': 25,
      '10+ transactions': 5
    }
  },
  interests: {
    merchant: {
      'Food & Drinks': 25,
      'Fashion, Cosmetics & Jewelry': 18,
      'Electronics & Household Appliances': 15,
      'Health & Medical Care': 12,
      'Restaurants, Bars, Fast Food & Coffee': 10,
      'Other': 20
    },
    competitor: {
      'Food & Drinks': 22,
      'Fashion, Cosmetics & Jewelry': 20,
      'Electronics & Household Appliances': 18,
      'Health & Medical Care': 10,
      'Restaurants, Bars, Fast Food & Coffee': 12,
      'Other': 18
    }
  }
};

// Revenue by channel data
export const revenueByChannel = {
  merchant: {
    physical: 65,
    ecommerce: 35
  },
  competitor: {
    physical: 58,
    ecommerce: 42
  }
};

// Revenue by shopping interests
export const revenueByInterests = shoppingInterests.map(interest => ({
  interest,
  merchant: Math.floor(Math.random() * 100000) + 50000,
  competitor: Math.floor(Math.random() * 120000) + 60000
}));

// Competition metrics data
export const competitionMetrics = {
  revenue: {
    merchantChangeFromLastYear: 12.5, // merchant revenue change vs last year
    competitionChangeFromLastYear: 5.8, // competition revenue change vs last year
    merchantVsCompetition: -15.9 // merchant is 15.9% lower than competition
  },
  transactions: {
    merchantChangeFromLastYear: 8.2, // merchant transactions change vs last year
    competitionChangeFromLastYear: 4.5, // competition transactions change vs last year
    merchantVsCompetition: -12.7 // merchant is 12.7% lower than competition
  },
  avgTransactionAmount: {
    merchantChangeFromLastYear: 2.1, // merchant avg transaction change vs last year
    competitionChangeFromLastYear: -1.2, // competition avg transaction change vs last year
    merchantVsCompetition: -3.6 // merchant is 3.6% lower than competition
  }
};

// Weekly turnover data for charts (percentage change vs same week last year)
export const weeklyTurnoverData = {
  merchant: [
    { week: '2024-01-01', percentageChange: 5.2 },
    { week: '2024-01-08', percentageChange: 7.8 },
    { week: '2024-01-15', percentageChange: 3.1 },
    { week: '2024-01-22', percentageChange: -2.4 },
    { week: '2024-01-29', percentageChange: 8.9 },
    { week: '2024-02-05', percentageChange: 12.3 },
    { week: '2024-02-12', percentageChange: 6.7 },
    { week: '2024-02-19', percentageChange: -1.8 },
    { week: '2024-02-26', percentageChange: 4.5 },
    { week: '2024-03-04', percentageChange: 9.2 },
    { week: '2024-03-11', percentageChange: -5.6 },
    { week: '2024-03-18', percentageChange: 2.8 },
    { week: '2024-03-25', percentageChange: 11.4 },
    { week: '2024-04-01', percentageChange: -3.2 },
    { week: '2024-04-08', percentageChange: 6.9 },
    { week: '2024-04-15', percentageChange: 8.1 },
    { week: '2024-04-22', percentageChange: -7.3 },
    { week: '2024-04-29', percentageChange: 4.6 },
    { week: '2024-05-06', percentageChange: 13.7 },
    { week: '2024-05-13', percentageChange: 2.4 }
  ],
  competition: [
    { week: '2024-01-01', percentageChange: 3.8 },
    { week: '2024-01-08', percentageChange: 5.2 },
    { week: '2024-01-15', percentageChange: 1.9 },
    { week: '2024-01-22', percentageChange: -1.1 },
    { week: '2024-01-29', percentageChange: 6.4 },
    { week: '2024-02-05', percentageChange: 8.7 },
    { week: '2024-02-12', percentageChange: 4.3 },
    { week: '2024-02-19', percentageChange: -0.9 },
    { week: '2024-02-26', percentageChange: 2.8 },
    { week: '2024-03-04', percentageChange: 6.1 },
    { week: '2024-03-11', percentageChange: -3.2 },
    { week: '2024-03-18', percentageChange: 1.5 },
    { week: '2024-03-25', percentageChange: 7.8 },
    { week: '2024-04-01', percentageChange: -2.1 },
    { week: '2024-04-08', percentageChange: 4.6 },
    { week: '2024-04-15', percentageChange: 5.9 },
    { week: '2024-04-22', percentageChange: -4.8 },
    { week: '2024-04-29', percentageChange: 3.2 },
    { week: '2024-05-06', percentageChange: 9.3 },
    { week: '2024-05-13', percentageChange: 1.7 }
  ]
};

export default {
  merchantInfo,
  shoppingInterests,
  greekLocations,
  stores,
  dashboardMetrics,
  revenueMetrics,
  customerMetrics,
  demographicsData,
  revenueByChannel,
  revenueByInterests,
  competitionMetrics,
  weeklyTurnoverData,
  generateTimeSeriesData
};
