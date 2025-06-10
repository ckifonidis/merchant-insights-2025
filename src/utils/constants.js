/**
 * Application constants for consistent styling and configuration
 */

// Brand colors
export const COLORS = {
  // NBG Brand Colors
  primary: '#007B85',
  secondary: '#73AA3C',
  
  // Chart colors
  merchant: '#007B85',
  competition: '#73AA3C',
  
  // Status colors
  positive: '#16a34a', // green-600
  negative: '#dc2626', // red-600
  neutral: '#6b7280', // gray-500
  
  // Background colors
  success: '#f0fdf4', // green-50
  error: '#fef2f2', // red-50
  warning: '#fffbeb', // amber-50
  info: '#eff6ff', // blue-50
};

// Chart configuration
export const CHART_CONFIG = {
  // Default margins for Recharts
  margins: {
    top: 5,
    right: 30,
    left: 20,
    bottom: 5
  },
  
  // Common chart heights
  heights: {
    small: 200,
    medium: 300,
    large: 400,
    default: 320
  },
  
  // Chart type options
  types: [
    { value: 'bars', labelKey: 'chartOptions.bars' },
    { value: 'line', labelKey: 'chartOptions.line' },
    { value: 'table', labelKey: 'chartOptions.table' }
  ],
  
  // Timeline options
  timelines: [
    { value: 'daily', labelKey: 'chartOptions.daily' },
    { value: 'weekly', labelKey: 'chartOptions.weekly' },
    { value: 'monthly', labelKey: 'chartOptions.monthly' },
    { value: 'yearly', labelKey: 'chartOptions.yearly' }
  ]
};

// Metric card variants
export const METRIC_VARIANTS = {
  single: 'single',
  comparison: 'comparison',
  detailed: 'detailed',
  competition: 'competition'
};

// Icon sizes
export const ICON_SIZES = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8'
};

// Common CSS classes
export const CSS_CLASSES = {
  // Card styles
  card: 'bg-white rounded-lg border border-gray-200 shadow-sm',
  cardPadding: 'p-4',
  
  // Button styles
  button: {
    primary: 'bg-nbg-primary hover:bg-nbg-primary/90 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    ghost: 'hover:bg-gray-100 text-gray-700'
  },
  
  // Text styles
  text: {
    title: 'text-lg font-semibold text-gray-900',
    subtitle: 'text-sm font-medium text-gray-600',
    value: 'text-2xl font-bold text-gray-900',
    change: 'text-sm font-medium',
    label: 'text-xs font-medium text-gray-500 uppercase tracking-wider'
  },
  
  // Layout
  flexCenter: 'flex items-center justify-center',
  flexBetween: 'flex items-center justify-between',
  grid2: 'grid grid-cols-1 md:grid-cols-2 gap-4',
  
  // Responsive
  stackOnMobile: 'flex flex-col sm:flex-row',
  hideOnMobile: 'hidden sm:block',
  showOnMobile: 'block sm:hidden'
};

// Filter options
export const FILTER_OPTIONS = {
  channels: [
    { value: 'all', labelKey: 'channels.all' },
    { value: 'physical', labelKey: 'channels.physical' },
    { value: 'ecommerce', labelKey: 'channels.ecommerce' }
  ],
  
  genders: [
    { value: 'all', labelKey: 'genders.all' },
    { value: 'male', labelKey: 'genders.male' },
    { value: 'female', labelKey: 'genders.female' }
  ],
  
  ageGroups: [
    { value: 'all', labelKey: 'ageGroups.all' },
    { value: 'genZ', labelKey: 'ageGroups.genZ' },
    { value: 'millennials', labelKey: 'ageGroups.millennials' },
    { value: 'genX', labelKey: 'ageGroups.genX' },
    { value: 'boomers', labelKey: 'ageGroups.boomers' },
    { value: 'silent', labelKey: 'ageGroups.silent' }
  ]
};

// Animation durations (in ms)
export const ANIMATIONS = {
  fast: 150,
  normal: 300,
  slow: 500
};

// Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};