import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { createMetricSelector } from '../../../store/selectors/dataSelectors.js';

const UniversalCalendarHeatmap = ({ 
  metricId,
  title,
  initialMonth = null, // Will be calculated from data
  valueLabel = 'Revenue',
  formatTooltip = (value) => value?.toLocaleString(),
  filters,
  showMerchantAndCompetition = true
}) => {
  const { t } = useTranslation();

  // ALWAYS require metricId - no fallback to mock data
  if (!metricId) {
    const errorMessage = `UniversalCalendarHeatmap: metricId is required. Component title: "${title || 'Unknown'}"`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  // Connect to store using metricId
  const storeData = useSelector(createMetricSelector(metricId));

  // Transform store data to heatmap format - MEMOIZED to prevent infinite loops
  const heatmapData = useMemo(() => {
    if (!storeData) return {};
    
    const transformedData = {};
    
    // Process merchant data
    if (storeData.merchant?.current) {
      Object.entries(storeData.merchant.current).forEach(([dateKey, value]) => {
        if (!transformedData[dateKey]) transformedData[dateKey] = {};
        transformedData[dateKey].merchant = value;
      });
    }
    
    // Process competitor data
    if (storeData.competitor?.current) {
      Object.entries(storeData.competitor.current).forEach(([dateKey, value]) => {
        if (!transformedData[dateKey]) transformedData[dateKey] = {};
        transformedData[dateKey].competition = value;
      });
    }
    
    return transformedData;
  }, [storeData]);

  // Initialize currentMonth state
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (initialMonth) return initialMonth;
    // Default fallback - will be updated when data loads
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // Update currentMonth when data becomes available
  useEffect(() => {
    if (!initialMonth && Object.keys(heatmapData).length > 0) {
      const availableDates = Object.keys(heatmapData).sort();
      const firstDate = new Date(availableDates[0]);
      const dataMonth = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
      setCurrentMonth(dataMonth);
    }
  }, [heatmapData, initialMonth]);

  // Get color class based on revenue value
  const getColorClass = (value, median) => {
    if (!value) return 'out-of-period';

    const ratio = value / median;
    if (ratio >= 1.5) return 'high';
    if (ratio >= 1.2) return 'good';
    if (ratio >= 0.8) return 'medium';
    return 'low';
  };

  // Calculate median for color scaling
  const calculateMedian = (values) => {
    const sorted = values.sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  // Show loading state if data is being fetched
  if (storeData?.isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if no store connection
  if (!storeData) {
    return (
      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <div className="text-red-800">Error: Unable to connect to metric data store for metricId: {metricId}</div>
      </div>
    );
  }

  // Show message if no data available at all
  if (Object.keys(heatmapData).length === 0) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <div className="text-yellow-800">No data available for the selected period</div>
      </div>
    );
  }

  // Filter data to current month only
  const monthlyHeatmapData = useMemo(() => {
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    const monthStartKey = monthStart.toISOString().split('T')[0];
    const monthEndKey = monthEnd.toISOString().split('T')[0];
    
    return Object.fromEntries(
      Object.entries(heatmapData).filter(([dateKey]) => 
        dateKey >= monthStartKey && dateKey <= monthEndKey
      )
    );
  }, [heatmapData, currentMonth]);

  // Get all revenue values for median calculation (filter out null/undefined values)
  // Use ALL data (not just current month) for consistent color scaling across months
  const allMerchantValues = Object.values(heatmapData)
    .map(d => d.merchant)
    .filter(v => v != null && !isNaN(v));
  const allCompetitionValues = Object.values(heatmapData)
    .map(d => d.competition)
    .filter(v => v != null && !isNaN(v));
  
  // Only calculate medians if we have valid data
  const merchantMedian = allMerchantValues.length > 0 ? calculateMedian([...allMerchantValues]) : 0;
  const competitionMedian = allCompetitionValues.length > 0 ? calculateMedian([...allCompetitionValues]) : 0;

  // Calendar component for merchant or competition
  const CalendarHeatmap = ({ title, dataType }) => {
    const median = dataType === 'merchant' ? merchantMedian : competitionMedian;

    // Get first day of month and number of days
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Start week with Monday (1) instead of Sunday (0)
    const startDayOfWeek = (firstDay.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0

    const monthName = currentMonth.toLocaleDateString('el-GR', { month: 'long', year: 'numeric' });

    // Generate calendar days
    const calendarDays = [];

    // Empty cells before first day
    for (let i = 0; i < startDayOfWeek; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="heatmap-cell empty"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateKey = date.toISOString().split('T')[0];
      const dayData = monthlyHeatmapData[dateKey]; // Use filtered monthly data
      const value = dayData ? dayData[dataType] : null;
      const colorClass = getColorClass(value, median);

      calendarDays.push(
        <div key={day} className={`heatmap-cell ${colorClass}`}>
          {day}
        </div>
      );
    }

    return (
      <div className="w-full min-w-0">
        <div className="text-sm font-medium text-gray-500 mb-2 text-center">{title}</div>
        <div className="text-xs font-medium text-gray-400 mb-3 text-center">{monthName}</div>
        <div className="flex flex-col items-center">
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            <div className="heatmap-cell empty">ΔΕΥ</div>
            <div className="heatmap-cell empty">ΤΡΙ</div>
            <div className="heatmap-cell empty">ΤΕΤ</div>
            <div className="heatmap-cell empty">ΠΕΜ</div>
            <div className="heatmap-cell empty">ΠΑΡ</div>
            <div className="heatmap-cell empty">ΣΑΒ</div>
            <div className="heatmap-cell empty">ΚΥΡ</div>
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {calendarDays}
          </div>
        </div>
      </div>
    );
  };

  // Navigation functions
  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    setCurrentMonth(newMonth);
  };

  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    setCurrentMonth(newMonth);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center items-center space-x-4">
        <button
          onClick={goToPreviousMonth}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-lg font-medium text-gray-700">
          {currentMonth.toLocaleDateString('el-GR', { month: 'long', year: 'numeric' })}
        </span>
        <button
          onClick={goToNextMonth}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="w-full overflow-hidden">
        <div className={`grid gap-6 ${
          showMerchantAndCompetition && allCompetitionValues.length > 0 
            ? 'grid-cols-1 lg:grid-cols-2' 
            : 'grid-cols-1 justify-center'
        }`}>
          {/* Always show merchant calendar (will show empty/gray if no data for current month) */}
          <CalendarHeatmap title={t('dashboard.merchant')} dataType="merchant" />
          
          {/* Show competition calendar if requested and we have any competition data */}
          {showMerchantAndCompetition && allCompetitionValues.length > 0 && (
            <CalendarHeatmap title={t('dashboard.competition')} dataType="competition" />
          )}
        </div>
      </div>

      <div className="flex justify-center items-center space-x-6 text-xs text-gray-500 mt-6">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: '#dc2626' }}></div>
          <span>Χαμηλός</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: '#fca5a5' }}></div>
          <span>Μέτριος</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: '#f3f4f6' }}></div>
          <span>Εκτός Περιόδου</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: '#16a34a' }}></div>
          <span>Καλός</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: '#166534' }}></div>
          <span>Υψηλός</span>
        </div>
      </div>
    </div>
  );
};

export default UniversalCalendarHeatmap;