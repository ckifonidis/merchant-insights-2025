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

// Generate time series data
export const generateTimeSeriesData = () => {
  const dates = generateDateRange();
  const data = [];
  
  dates.forEach((date, index) => {
    const dayOfYear = index;
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
  generateTimeSeriesData
};
