/**
 * Analytics API Schema Documentation
 * Based on analysis of actual API request/response pairs
 */

export const API_ENDPOINTS = {
  ANALYTICS_QUERY: '/api/ANALYTICS/QUERY',
  AUTHORIZATION_CHECK: '/api/authorization/checkUserStatus', // User status check endpoint
  CONFIGURATION_ADMIN: '/api/CONFIGURATION/ADMIN/GET',
  CONFIGURATION_MERCHANT: '/api/CONFIGURATION/MERCHANT/GET'
} as const;

export const ANALYTICS_PROVIDER_IDS = {
  POST_PROMOTION_ANALYTICS: '56f9cf99-3727-4f2f-bf1c-58dc532ebaf5',
  AUDIENCE_FILTERING: '79706006-ed8a-426d-88a8-c574acb92f26'
} as const;

export const METRIC_IDS = {
  // Loyalty Metrics
  REWARDED_POINTS: 'rewarded_points',
  REWARDED_AMOUNT: 'rewarded_amount',
  REDEEMED_POINTS: 'redeemed_points',
  REDEEMED_AMOUNT: 'redeemed_amount',
  
  // Transaction Metrics
  TOTAL_REVENUE: 'total_revenue',
  TOTAL_TRANSACTIONS: 'total_transactions',
  AVG_TICKET_PER_USER: 'avg_ticket_per_user',
  AVG_DAILY_REVENUE: 'avg_daily_revenue',
  
  // Customer Metrics
  TOTAL_CUSTOMERS: 'total_customers',
  
  // Go For More Metrics
  GOFORMORE_AMOUNT: 'goformore_amount',
  
  // Customer Analytics (Series Data)
  CONVERTED_CUSTOMERS_BY_ACTIVITY: 'converted_customers_by_activity',
  CONVERTED_CUSTOMERS_BY_INTEREST: 'converted_customers_by_interest',
  CONVERTED_CUSTOMERS_BY_AGE: 'converted_customers_by_age',
  CONVERTED_CUSTOMERS_BY_GENDER: 'converted_customers_by_gender',
  
  // Time Series Metrics
  REVENUE_PER_DAY: 'revenue_per_day',
  TRANSACTIONS_PER_DAY: 'transactions_per_day',
  CUSTOMERS_PER_DAY: 'customers_per_day',
  
  // Revenue Breakdown Metrics
  REVENUE_BY_CHANNEL: 'revenue_by_channel',
  
  // Geographic Metrics
  TRANSACTIONS_BY_GEO: 'transactions_by_geo'
} as const;

export const FILTER_IDS = {
  INTEREST_TYPE: 'interest_type',
  AGE_GROUP_TYPE: 'age_group_type',
  CUSTOMER_REGION_TYPE: 'customer_region_type',
  TRANSACTIONS_TYPE: 'transactions_type',
  DATA_ORIGIN: 'data_origin',
  STORE: 'store',
  PROFESSION: 'profession',
  CHANNEL: 'channel',
  CHANNEL_TYPE: 'channel_type',
  GENDER: 'gender',
  AGE: 'age',
  AGE_GROUP: 'age_group',
  SHOPPING_INTERESTS: 'shopping_interests',
  HOME_LOCATION: 'home_location',
  WORK_LOCATION: 'work_location',
  CUSTOMER_ACTIVITY_PROMOTION: 'customer_activity_promotion',
  NBG_CUSTOMER_SEGMENTATION: 'nbg_customer_segmentation',
  SPENDING_PROFILE: 'spending_profile',
  CUSTOMERS_ACTIVITY: 'customers_activity'
} as const;

export const FILTER_VALUES = {
  INTEREST_TYPE: {
    CUSTOMERS: 'customers',
    REVENUE: 'revenue'
  },
  AGE_GROUP_TYPE: {
    CUSTOMERS: 'customers',
    REVENUE: 'revenue',
    TRANSACTIONS: 'transactions'
  },
  CUSTOMER_REGION_TYPE: {
    HOME_ADDRESS: 'home_address',
    WORK_ADDRESS: 'work_address'
  },
  TRANSACTIONS_TYPE: {
    COUNT: 'transactions_count',
    AMOUNT: 'transactions_amount'
  },
  DATA_ORIGIN: {
    OWN_DATA: 'own_data',
    COMPETITION_COMPARISON: 'competition_comparison'
  },
  CHANNEL: {
    PHYSICAL: 'physical',
    ECOMMERCE: 'ecommerce',
    ALL: 'all'
  },
  PROFESSION: {
    EMPLOYEE: 'e',
    UNEMPLOYED: 'u',
    INDIVIDUAL_BUSINESS: 'f',
    RETIRED: 'r',
    STUDENT: 's'
  },
  GENDER: {
    MALE: 'm',
    FEMALE: 'f',
    ALL: 'a'
  },
  CUSTOMER_ACTIVITY: {
    FREQUENT: 'frequent',
    PROSPECTIVE: 'prospective',
    LESS_FREQUENT: 'less_frequent'
  }
} as const;

// Metric categorization for type-safe validation and component behavior
export const METRIC_CATEGORIES = {
  SCALAR: {
    TOTAL_REVENUE: 'total_revenue',
    TOTAL_TRANSACTIONS: 'total_transactions',
    AVG_TICKET_PER_USER: 'avg_ticket_per_user',
    AVG_DAILY_REVENUE: 'avg_daily_revenue',
    TOTAL_CUSTOMERS: 'total_customers',
    GOFORMORE_AMOUNT: 'goformore_amount',
    REWARDED_AMOUNT: 'rewarded_amount',
    REDEEMED_AMOUNT: 'redeemed_amount',
    REWARDED_POINTS: 'rewarded_points',
    REDEEMED_POINTS: 'redeemed_points'
  },
  TIME_SERIES: {
    REVENUE_PER_DAY: 'revenue_per_day',
    TRANSACTIONS_PER_DAY: 'transactions_per_day',
    CUSTOMERS_PER_DAY: 'customers_per_day'
  },
  CATEGORICAL: {
    CONVERTED_CUSTOMERS_BY_GENDER: 'converted_customers_by_gender',
    CONVERTED_CUSTOMERS_BY_AGE: 'converted_customers_by_age',
    CONVERTED_CUSTOMERS_BY_INTEREST: 'converted_customers_by_interest',
    CONVERTED_CUSTOMERS_BY_ACTIVITY: 'converted_customers_by_activity',
    REVENUE_BY_CHANNEL: 'revenue_by_channel',
    TRANSACTIONS_BY_GEO: 'transactions_by_geo'
  }
} as const;

export const SHOPPING_INTERESTS = [
  'SHOPINT1', 'SHOPINT2', 'SHOPINT3', 'SHOPINT4', 'SHOPINT5',
  'SHOPINT6', 'SHOPINT7', 'SHOPINT8', 'SHOPINT9', 'SHOPINT10',
  'SHOPINT11', 'SHOPINT12', 'SHOPINT13', 'SHOPINT14', 'SHOPINT15'
];

export const GREEK_REGIONS = [
  'ΑΤΤΙΚΗ', 'ΚΕΝΤΡΙΚΗ ΜΑΚΕΔΟΝΙΑ', 'ΘΕΣΣΑΛΙΑ', 'ΚΕΝΤΡΙΚΗ ΕΛΛΑΔΑ',
  'ΔΥΤΙΚΗ ΕΛΛΑΔΑ', 'ΠΕΛΟΠΟΝΝΗΣΟΣ', 'ΑΝΑΤΟΛΙΚΗ ΜΑΚΕΔΟΝΙΑ ΚΑΙ ΘΡΑΚΗ',
  'ΚΡΗΤΗ', 'ΗΠΕΙΡΟΣ', 'ΔΥΤΙΚΗ ΜΑΚΕΔΟΝΙΑ', 'ΝΟΤΙΟ ΑΙΓΑΙΟ',
  'ΒΟΡΕΙΟ ΑΙΓΑΙΟ', 'ΝΗΣΙΑ ΙΟΝΙΟΥ'
];

export const AGE_GROUPS = [
  '18-24', '25-40', '41-56', '57-75', '76-96'
];