import { useState } from 'react';
import { subDays } from 'date-fns';

export const useFilters = () => {
  // Default date range: latest month to yesterday
  const defaultEndDate = subDays(new Date(), 1);
  const defaultStartDate = subDays(defaultEndDate, 30);

  const [filters, setFilters] = useState({
    dateRange: {
      start: defaultStartDate,
      end: defaultEndDate
    },
    channel: 'all',
    gender: 'all',
    ageGroups: [],
    customerLocation: [],
    goForMore: null,
    shoppingInterests: [],
    stores: []
  });

  const updateFilters = (newFilters) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
  };

  const resetFilters = () => {
    setFilters({
      dateRange: {
        start: defaultStartDate,
        end: defaultEndDate
      },
      channel: 'all',
      gender: 'all',
      ageGroups: [],
      customerLocation: [],
      goForMore: null,
      shoppingInterests: [],
      stores: []
    });
  };

  return {
    filters,
    updateFilters,
    resetFilters
  };
};
