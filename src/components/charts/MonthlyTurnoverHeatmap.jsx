import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const MonthlyTurnoverHeatmap = ({ filters }) => {
  const { t } = useTranslation();
  const [currentMonth, setCurrentMonth] = useState(new Date(2024, 4, 1)); // May 2024

  // Mock data for demonstration - in real app this would come from API
  const generateMockData = () => {
    const data = {};
    const startDate = new Date(2024, 0, 1); // January 1, 2024
    const endDate = new Date(2024, 11, 31); // December 31, 2024

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      // Generate random revenue values
      data[dateKey] = {
        merchant: Math.random() * 10000 + 1000,
        competition: Math.random() * 12000 + 1200
      };
    }
    return data;
  };

  const mockData = generateMockData();

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

  // Get all revenue values for median calculation
  const allMerchantValues = Object.values(mockData).map(d => d.merchant);
  const allCompetitionValues = Object.values(mockData).map(d => d.competition);
  const merchantMedian = calculateMedian([...allMerchantValues]);
  const competitionMedian = calculateMedian([...allCompetitionValues]);

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
      const dayData = mockData[dateKey];
      const value = dayData ? dayData[dataType] : null;
      const colorClass = getColorClass(value, median);

      calendarDays.push(
        <div key={day} className={`heatmap-cell ${colorClass}`}>
          {day}
        </div>
      );
    }

    return (
      <div className="flex-1">
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

      <div className="flex justify-center">
        <CalendarHeatmap title={t('dashboard.merchant')} dataType="merchant" />
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

export default MonthlyTurnoverHeatmap;