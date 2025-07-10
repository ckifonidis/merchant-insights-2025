# Comprehensive Redux State Model

## Overview

This document defines the complete normalized state structure for the NBG Business Insights application, organizing all metrics, UI state, and filters in a consistent hierarchy.

## Complete State Structure

```javascript
{
  ui: {
    // Global UI state
    global: {
      isLoading: false,
      activeTab: 'dashboard', // 'dashboard' | 'revenue' | 'demographics' | 'competition'
      sidebarOpen: false,
      language: 'en', // 'en' | 'gr'
      theme: 'light', // 'light' | 'dark'
      lastActivity: '2025-01-01T10:00:00Z'
    },
    
    // Loading states per operation
    loading: {
      fetchingMetrics: false,
      fetchingCurrentYear: false,
      fetchingPreviousYear: false,
      applyingFilters: false,
      exportingData: false
    },
    
    // Error states
    errors: {
      global: null,
      metrics: {}, // { metricId: 'error message' }
      filters: null,
      network: null
    },
    
    // Chart and component preferences
    chartPreferences: {
      // Per-chart settings
      dashboard: {
        revenueChart: {
          chartType: 'bars', // 'bars' | 'line' | 'table'
          timeline: 'daily', // 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
          yAxisMode: 'absolute' // 'absolute' | 'percentage_change'
        },
        transactionsChart: {
          chartType: 'line',
          timeline: 'weekly',
          yAxisMode: 'absolute'
        },
        customersChart: {
          chartType: 'bars',
          timeline: 'daily',
          yAxisMode: 'absolute'
        }
      },
      revenue: {
        revenueTrend: {
          chartType: 'line',
          timeline: 'weekly',
          yAxisMode: 'absolute'
        },
        revenueChange: {
          chartType: 'line',
          timeline: 'weekly',
          yAxisMode: 'percentage_change'
        },
        revenueByInterests: {
          chartType: 'bars'
        },
        revenueByChannel: {
          chartType: 'pie'
        }
      },
      demographics: {
        genderChart: {
          chartType: 'pie'
        },
        ageGroupsChart: {
          chartType: 'bars'
        },
        shoppingInterests: {
          chartType: 'bars'
        }
      },
      competition: {
        weeklyTimeline: {
          chartType: 'line'
        },
        monthlyHeatmap: {
          // Heatmap-specific preferences
        }
      }
    },
    
    // Modal and overlay states
    modals: {
      filterSidebar: false,
      exportDialog: false,
      settingsDialog: false,
      helpDialog: false
    },
    
    // Notification system
    notifications: [
      // {
      //   id: 'unique-id',
      //   type: 'success' | 'error' | 'warning' | 'info',
      //   message: 'Notification message',
      //   timestamp: '2025-01-01T10:00:00Z',
      //   autoClose: true,
      //   duration: 5000
      // }
    ]
  },

  filters: {
    // UI filters (user-friendly values)
    ui: {
      dateRange: {
        start: '2025-01-01',
        end: '2025-01-31',
        preset: 'lastMonth' // 'custom' | 'lastWeek' | 'lastMonth' | 'lastQuarter' | 'lastYear'
      },
      channel: {
        selected: 'all', // 'all' | 'ecommerce' | 'physical'
        options: ['all', 'ecommerce', 'physical']
      },
      demographics: {
        gender: {
          selected: 'all', // 'all' | 'male' | 'female'
          options: ['all', 'male', 'female']
        },
        ageGroups: {
          selected: [], // ['18-24', '25-40', '41-56', '57-75', '76-96']
          options: ['18-24', '25-40', '41-56', '57-75', '76-96'],
          multiSelect: true
        }
      },
      location: {
        regions: {
          selected: [], // ['ΑΤΤΙΚΗ', 'ΚΕΝΤΡΙΚΗ ΜΑΚΕΔΟΝΙΑ', ...]
          options: [], // Loaded from API
          multiSelect: true
        },
        municipalities: {
          selected: [],
          options: [], // Loaded from API based on selected regions
          multiSelect: true
        }
      },
      goForMore: {
        selected: null, // null | true | false (null = not applicable)
        available: false // Whether merchant participates in Go For More
      },
      shoppingInterests: {
        selected: [], // ['SHOPINT1', 'SHOPINT2', ...]
        options: [
          'SHOPINT1', 'SHOPINT2', 'SHOPINT3', 'SHOPINT4', 'SHOPINT5',
          'SHOPINT6', 'SHOPINT7', 'SHOPINT8', 'SHOPINT9', 'SHOPINT10',
          'SHOPINT11', 'SHOPINT12', 'SHOPINT13', 'SHOPINT14', 'SHOPINT15'
        ],
        multiSelect: true
      },
      stores: {
        selected: [], // Store IDs
        options: [], // Loaded from API
        multiSelect: true
      }
    },
    
    // API filters (API-ready values)
    api: {
      dateRange: {
        start: '2025-01-01',
        end: '2025-01-31'
      },
      channel: 'all', // 'all' | 'ecommerce' | 'physical'
      gender: 'a', // 'a' | 'm' | 'f'
      ageGroups: [], // API format age group values
      regions: [], // API format region values
      municipalities: [], // API format municipality values
      goForMore: null, // null | true | false
      shoppingInterests: [], // ['SHOPINT1', 'SHOPINT2', ...]
      stores: [] // Store IDs
    },
    
    // Filter state management
    state: {
      filtersChanged: false, // Whether filters have changed since last apply
      hasUnsavedChanges: false, // Whether there are pending filter changes
      lastApplied: '2025-01-01T10:00:00Z', // When filters were last applied
      isValid: true, // Whether current filter combination is valid
      validationErrors: [] // Array of validation error messages
    },
    
    // Saved filter sets
    saved: {
      default: {
        name: 'Default',
        filters: {}, // Saved filter configuration
        isDefault: true
      },
      // Additional saved filter sets
      // 'custom-set-1': {
      //   name: 'Monthly Analysis',
      //   filters: {},
      //   isDefault: false
      // }
    }
  },

  data: {
    // Core metrics data - normalized by metric ID
    metrics: {
      
      // ========================
      // TIME SERIES METRICS (date-indexed data)
      // ========================
      
      revenue_per_day: {
        merchant: {
          current: {
            '2025-01-01': 1250.75,
            '2025-01-02': 1580.40,
            '2025-01-03': 980.15
            // ... more dates
          },
          previous: {
            '2024-01-01': 1180.50,
            '2024-01-02': 1420.30,
            '2024-01-03': 950.80
            // ... more dates
          }
        },
        competitor: {
          current: {
            '2025-01-01': 1100.25,
            '2025-01-02': 1350.60,
            '2025-01-03': 890.45
            // ... more dates
          },
          previous: {
            '2024-01-01': 1050.75,
            '2024-01-02': 1280.20,
            '2024-01-03': 870.30
            // ... more dates
          }
        }
      },
      
      transactions_per_day: {
        merchant: {
          current: {
            '2025-01-01': 45,
            '2025-01-02': 52,
            '2025-01-03': 38
            // ... more dates
          },
          previous: {
            '2024-01-01': 42,
            '2024-01-02': 48,
            '2024-01-03': 35
            // ... more dates
          }
        },
        competitor: {
          current: {
            '2025-01-01': 38,
            '2025-01-02': 45,
            '2025-01-03': 32
            // ... more dates
          },
          previous: {
            '2024-01-01': 36,
            '2024-01-02': 42,
            '2024-01-03': 30
            // ... more dates
          }
        }
      },
      
      customers_per_day: {
        // Customer data is merchant-only (compliance requirement)
        merchant: {
          current: {
            '2025-01-01': 35,
            '2025-01-02': 42,
            '2025-01-03': 28
            // ... more dates
          },
          previous: {
            '2024-01-01': 32,
            '2024-01-02': 38,
            '2024-01-03': 26
            // ... more dates
          }
        }
        // No competitor data for customer metrics
      },
      
      // ========================
      // SCALAR METRICS (single values)
      // ========================
      
      total_revenue: {
        merchant: {
          current: 2345678.90,
          previous: 2189456.75
        },
        competitor: {
          current: 2789123.45,
          previous: 2634891.20
        }
      },
      
      total_transactions: {
        merchant: {
          current: 45678,
          previous: 42134
        },
        competitor: {
          current: 52341,
          previous: 50128
        }
      },
      
      avg_ticket_per_user: {
        merchant: {
          current: 51.34,
          previous: 48.92
        },
        competitor: {
          current: 53.28,
          previous: 52.64
        }
      },
      
      avg_daily_revenue: {
        merchant: {
          current: 15678.52,
          previous: 14567.23
        },
        competitor: {
          current: 18234.67,
          previous: 17456.89
        }
      },
      
      // Go For More metrics (merchant-only)
      goformore_amount: {
        merchant: {
          current: 456789.12,
          previous: 395245.67
        }
        // No competitor data for Go For More metrics
      },
      
      rewarded_amount: {
        merchant: {
          current: 23456.78,
          previous: 19234.56
        }
      },
      
      rewarded_points: {
        merchant: {
          current: 234567,
          previous: 192345
        }
      },
      
      redeemed_amount: {
        merchant: {
          current: 18765.43,
          previous: 15789.34
        }
      },
      
      redeemed_points: {
        merchant: {
          current: 187654,
          previous: 157893
        }
      },
      
      // Customer segmentation metrics (merchant-only)
      total_customers: {
        merchant: {
          current: 12456,
          previous: 11567
        }
      },
      
      new_customers: {
        merchant: {
          current: 2345,
          previous: 2156
        }
      },
      
      returning_customers: {
        merchant: {
          current: 8765,
          previous: 8234
        }
      },
      
      top_spenders: {
        merchant: {
          current: 1234,
          previous: 1156
        }
      },
      
      loyal_customers: {
        merchant: {
          current: 3456,
          previous: 3234
        }
      },
      
      at_risk_customers: {
        merchant: {
          current: 567,
          previous: 589
        }
      },
      
      // ========================
      // CATEGORICAL METRICS (category breakdowns)
      // ========================
      
      revenue_by_channel: {
        merchant: {
          current: {
            'ecommerce': 1456789.50,
            'physical': 888889.40
          },
          previous: {
            'ecommerce': 1234567.25,
            'physical': 954889.50
          }
        },
        competitor: {
          current: {
            'ecommerce': 1678912.30,
            'physical': 1110211.15
          },
          previous: {
            'ecommerce': 1543210.80,
            'physical': 1091680.40
          }
        }
      },
      
      converted_customers_by_gender: {
        merchant: {
          current: {
            'male': 45.2,     // Percentage
            'female': 54.8    // Percentage
          },
          previous: {
            'male': 47.1,
            'female': 52.9
          }
        },
        competitor: {
          current: {
            'male': 48.5,
            'female': 51.5
          },
          previous: {
            'male': 49.2,
            'female': 50.8
          }
        }
      },
      
      converted_customers_by_age: {
        merchant: {
          current: {
            '18-24': 15.5,
            '25-40': 35.2,
            '41-56': 28.8,
            '57-75': 18.3,
            '76-96': 2.2
          },
          previous: {
            '18-24': 16.1,
            '25-40': 34.8,
            '41-56': 27.9,
            '57-75': 19.0,
            '76-96': 2.2
          }
        },
        competitor: {
          current: {
            '18-24': 18.2,
            '25-40': 32.1,
            '41-56': 30.5,
            '57-75': 17.8,
            '76-96': 1.4
          },
          previous: {
            '18-24': 17.8,
            '25-40': 31.9,
            '41-56': 31.1,
            '57-75': 17.9,
            '76-96': 1.3
          }
        }
      },
      
      converted_customers_by_interest: {
        merchant: {
          current: {
            'SHOPINT1': 12.5,   // Shopping & Fashion
            'SHOPINT2': 8.3,    // Electronics & Technology
            'SHOPINT3': 15.2,   // Food & Dining
            'SHOPINT4': 6.8,    // Health & Beauty
            'SHOPINT5': 9.4,    // Home & Garden
            'SHOPINT6': 7.1,    // Sports & Fitness
            'SHOPINT7': 4.9,    // Books & Education
            'SHOPINT8': 11.3,   // Travel & Tourism
            'SHOPINT9': 5.2,    // Entertainment
            'SHOPINT10': 3.8,   // Automotive
            'SHOPINT11': 6.7,   // Financial Services
            'SHOPINT12': 2.1,   // Real Estate
            'SHOPINT13': 4.5,   // Professional Services
            'SHOPINT14': 1.8,   // Insurance
            'SHOPINT15': 0.4    // Other
          },
          previous: {
            'SHOPINT1': 11.8,
            'SHOPINT2': 8.1,
            'SHOPINT3': 14.9,
            'SHOPINT4': 6.5,
            'SHOPINT5': 9.8,
            'SHOPINT6': 7.3,
            'SHOPINT7': 5.1,
            'SHOPINT8': 10.9,
            'SHOPINT9': 5.4,
            'SHOPINT10': 4.0,
            'SHOPINT11': 6.9,
            'SHOPINT12': 2.3,
            'SHOPINT13': 4.7,
            'SHOPINT14': 1.9,
            'SHOPINT15': 0.4
          }
        },
        competitor: {
          current: {
            'SHOPINT1': 14.2,
            'SHOPINT2': 9.1,
            'SHOPINT3': 13.8,
            'SHOPINT4': 7.5,
            'SHOPINT5': 8.9,
            'SHOPINT6': 6.8,
            'SHOPINT7': 4.2,
            'SHOPINT8': 10.1,
            'SHOPINT9': 6.3,
            'SHOPINT10': 4.1,
            'SHOPINT11': 6.2,
            'SHOPINT12': 2.5,
            'SHOPINT13': 4.1,
            'SHOPINT14': 1.7,
            'SHOPINT15': 0.5
          },
          previous: {
            'SHOPINT1': 13.9,
            'SHOPINT2': 8.8,
            'SHOPINT3': 14.1,
            'SHOPINT4': 7.2,
            'SHOPINT5': 9.2,
            'SHOPINT6': 6.9,
            'SHOPINT7': 4.4,
            'SHOPINT8': 9.8,
            'SHOPINT9': 6.1,
            'SHOPINT10': 4.3,
            'SHOPINT11': 6.4,
            'SHOPINT12': 2.4,
            'SHOPINT13': 4.3,
            'SHOPINT14': 1.8,
            'SHOPINT15': 0.4
          }
        }
      },
      
      transactions_by_geo: {
        merchant: {
          current: {
            'ΑΤΤΙΚΗ': 35.2,
            'ΚΕΝΤΡΙΚΗ ΜΑΚΕΔΟΝΙΑ': 18.4,
            'ΘΕΣΣΑΛΙΑ': 8.9,
            'ΚΕΝΤΡΙΚΗ ΕΛΛΑΔΑ': 7.3,
            'ΔΥΤΙΚΗ ΕΛΛΑΔΑ': 6.1,
            'ΠΕΛΟΠΟΝΝΗΣΟΣ': 5.8,
            'ΑΝΑΤΟΛΙΚΗ ΜΑΚΕΔΟΝΙΑ ΚΑΙ ΘΡΑΚΗ': 4.9,
            'ΚΡΗΤΗ': 4.2,
            'ΗΠΕΙΡΟΣ': 3.5,
            'ΔΥΤΙΚΗ ΜΑΚΕΔΟΝΙΑ': 2.8,
            'ΝΟΤΙΟ ΑΙΓΑΙΟ': 1.9,
            'ΒΟΡΕΙΟ ΑΙΓΑΙΟ': 0.8,
            'ΝΗΣΙΑ ΙΟΝΙΟΥ': 0.2
          },
          previous: {
            'ΑΤΤΙΚΗ': 34.8,
            'ΚΕΝΤΡΙΚΗ ΜΑΚΕΔΟΝΙΑ': 18.9,
            'ΘΕΣΣΑΛΙΑ': 8.7,
            'ΚΕΝΤΡΙΚΗ ΕΛΛΑΔΑ': 7.1,
            'ΔΥΤΙΚΗ ΕΛΛΑΔΑ': 6.3,
            'ΠΕΛΟΠΟΝΝΗΣΟΣ': 5.9,
            'ΑΝΑΤΟΛΙΚΗ ΜΑΚΕΔΟΝΙΑ ΚΑΙ ΘΡΑΚΗ': 5.1,
            'ΚΡΗΤΗ': 4.0,
            'ΗΠΕΙΡΟΣ': 3.7,
            'ΔΥΤΙΚΗ ΜΑΚΕΔΟΝΙΑ': 2.9,
            'ΝΟΤΙΟ ΑΙΓΑΙΟ': 2.0,
            'ΒΟΡΕΙΟ ΑΙΓΑΙΟ': 0.9,
            'ΝΗΣΙΑ ΙΟΝΙΟΥ': 0.2
          }
        },
        competitor: {
          current: {
            'ΑΤΤΙΚΗ': 42.1,
            'ΚΕΝΤΡΙΚΗ ΜΑΚΕΔΟΝΙΑ': 15.8,
            'ΘΕΣΣΑΛΙΑ': 7.9,
            'ΚΕΝΤΡΙΚΗ ΕΛΛΑΔΑ': 6.8,
            'ΔΥΤΙΚΗ ΕΛΛΑΔΑ': 5.5,
            'ΠΕΛΟΠΟΝΝΗΣΟΣ': 5.2,
            'ΑΝΑΤΟΛΙΚΗ ΜΑΚΕΔΟΝΙΑ ΚΑΙ ΘΡΑΚΗ': 4.1,
            'ΚΡΗΤΗ': 3.8,
            'ΗΠΕΙΡΟΣ': 3.2,
            'ΔΥΤΙΚΗ ΜΑΚΕΔΟΝΙΑ': 2.5,
            'ΝΟΤΙΟ ΑΙΓΑΙΟ': 1.8,
            'ΒΟΡΕΙΟ ΑΙΓΑΙΟ': 0.9,
            'ΝΗΣΙΑ ΙΟΝΙΟΥ': 0.4
          },
          previous: {
            'ΑΤΤΙΚΗ': 41.8,
            'ΚΕΝΤΡΙΚΗ ΜΑΚΕΔΟΝΙΑ': 16.1,
            'ΘΕΣΣΑΛΙΑ': 8.1,
            'ΚΕΝΤΡΙΚΗ ΕΛΛΑΔΑ': 6.9,
            'ΔΥΤΙΚΗ ΕΛΛΑΔΑ': 5.7,
            'ΠΕΛΟΠΟΝΝΗΣΟΣ': 5.0,
            'ΑΝΑΤΟΛΙΚΗ ΜΑΚΕΔΟΝΙΑ ΚΑΙ ΘΡΑΚΗ': 4.3,
            'ΚΡΗΤΗ': 3.6,
            'ΗΠΕΙΡΟΣ': 3.4,
            'ΔΥΤΙΚΗ ΜΑΚΕΔΟΝΙΑ': 2.6,
            'ΝΟΤΙΟ ΑΙΓΑΙΟ': 1.9,
            'ΒΟΡΕΙΟ ΑΙΓΑΙΟ': 0.8,
            'ΝΗΣΙΑ ΙΟΝΙΟΥ': 0.3
          }
        }
      }
    },
    
    // Data metadata and management
    meta: {
      // Last update timestamps per metric
      lastUpdated: {
        revenue_per_day: '2025-01-01T10:00:00Z',
        total_revenue: '2025-01-01T10:00:00Z'
        // ... timestamp for each metric
      },
      
      // Data freshness indicators
      freshness: {
        revenue_per_day: 'fresh', // 'fresh' | 'stale' | 'error'
        total_revenue: 'fresh'
        // ... freshness for each metric
      },
      
      // Data source tracking
      sources: {
        revenue_per_day: 'api', // 'api' | 'cache' | 'mock'
        total_revenue: 'api'
        // ... source for each metric
      },
      
      // Year-over-year date ranges
      dateRanges: {
        current: {
          start: '2025-01-01',
          end: '2025-01-31'
        },
        previous: {
          start: '2024-01-01',
          end: '2024-01-31'
        }
      },
      
      // Data validation status
      validation: {
        hasValidCurrentData: true,
        hasValidPreviousData: true,
        missingMetrics: [], // Array of metric IDs that failed to load
        incompletePeriods: [] // Array of date periods with missing data
      }
    }
  }
}
```

## Key Design Principles

### 1. Normalization
- Each metric stored once, referenced by metric ID
- Eliminates duplication across tabs
- Consistent structure for all metric types

### 2. Time Comparison Built-in
- Every metric has `current` and `previous` year data
- Enables automatic year-over-year calculations
- Supports period-over-period analysis

### 3. Entity Separation
- Clear separation between `merchant` and `competitor` data
- Handles merchant-only metrics (Go For More, customer data)
- Compliance-friendly structure

### 4. Data Type Patterns

#### Time Series Metrics
```javascript
metricId: {
  merchant: {
    current: { 'date': value },
    previous: { 'date': value }
  },
  competitor: {
    current: { 'date': value }, 
    previous: { 'date': value }
  }
}
```

#### Scalar Metrics
```javascript
metricId: {
  merchant: {
    current: singleValue,
    previous: singleValue
  },
  competitor: {
    current: singleValue,
    previous: singleValue
  }
}
```

#### Categorical Metrics
```javascript
metricId: {
  merchant: {
    current: { 'category': value },
    previous: { 'category': value }
  },
  competitor: {
    current: { 'category': value },
    previous: { 'category': value }
  }
}
```

### 5. UI State Organization
- Separated by concern (loading, errors, preferences, modals)
- Chart preferences stored per-component
- Global UI state for app-wide settings

### 6. Filter State Management
- Dual state: UI-friendly and API-ready formats
- Change tracking and validation
- Saved filter sets support

## Benefits of This Structure

1. **Performance**: Data fetched once, used by multiple tabs
2. **Consistency**: Same structure for all metrics
3. **Maintainability**: Clear separation of concerns
4. **Scalability**: Easy to add new metrics and UI states
5. **Type Safety**: Predictable data structures for TypeScript
6. **Caching**: Efficient cache management per metric
7. **Time Analysis**: Built-in support for period comparisons