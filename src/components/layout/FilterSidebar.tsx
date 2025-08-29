import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import { subDays, startOfYear } from 'date-fns';
import { 
  selectFilters,
  selectChannelValues,
  selectGenderValues,
  selectAgeGroupOptions,
  selectRegionOptions,
  selectShoppingInterestValues,
    selectGoForMoreAvailable,
  setCustomDateRange,
  setChannel,
  setGender,
  setAgeGroups,
  setRegions,
  setMunicipalities,
  setGoForMore,
  setShoppingInterests,
  setStores,
  applyFilters,
  resetFilters
} from '../../store/slices/filtersSlice.js';
import 'react-datepicker/dist/react-datepicker.css';

const FilterSidebar = ({ isOpen, onClose, isMobile }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  // Get filters from Redux (single source of truth)
  const filters = useSelector(selectFilters);
  
  // Get static values and create translated options
  const channelValues = useSelector(selectChannelValues);
  const genderValues = useSelector(selectGenderValues);
  const ageGroupOptions = useSelector(selectAgeGroupOptions);
  const regionOptions = useSelector(selectRegionOptions);
  const shoppingInterestValues = useSelector(selectShoppingInterestValues);

  // Create translated options
  const channelOptions = channelValues.map(value => ({
    value,
    label: value === 'all' ? t('channels.all') : t(`channels.${value}`)
  }));

  const genderOptions = genderValues.map(value => ({
    value,
    label: value === 'a' ? t('genders.all') : t(`genders.${value === 'm' ? 'male' : 'female'}`)
  }));

  const shoppingInterestOptions = shoppingInterestValues.map(value => ({
    value,
    label: t(`shoppingInterests.${value}`)
  }));
  
  // Get dynamic options
  const goForMoreAvailable = useSelector(selectGoForMoreAvailable);

  // Local state for date pickers only
  const [startDate, setStartDate] = useState(
    filters?.dateRange?.start ? new Date(filters.dateRange.start) : subDays(new Date(), 31)
  );
  const [endDate, setEndDate] = useState(
    filters?.dateRange?.end ? new Date(filters.dateRange.end) : subDays(new Date(), 1)
  );

  // Create Go For More options
  const goForMoreOptions = [
    { value: true, label: t('goForMoreOptions.yes') },
    { value: false, label: t('goForMoreOptions.no') }
  ];

  const handleFilterChange = (filterKey, value) => {
    switch (filterKey) {
      case 'channel':
        dispatch(setChannel(value));
        break;
      case 'gender':
        dispatch(setGender(value));
        break;
      case 'ageGroups':
        dispatch(setAgeGroups(value));
        break;
      case 'regions':
        dispatch(setRegions(value));
        break;
      case 'municipalities':
        dispatch(setMunicipalities(value));
        break;
      case 'goForMore':
        dispatch(setGoForMore(value));
        break;
      case 'shoppingInterests':
        dispatch(setShoppingInterests(value));
        break;
      case 'stores':
        dispatch(setStores(value));
        break;
      default:
        console.warn('Unknown filter key:', filterKey);
    }
  };

  const handleDateChange = (dateKey, date) => {
    if (dateKey === 'start') {
      setStartDate(date);
    } else {
      setEndDate(date);
    }
    
    const newStartDate = dateKey === 'start' ? date : startDate;
    const newEndDate = dateKey === 'end' ? date : endDate;
    
    dispatch(setCustomDateRange({
      start: newStartDate.toISOString(),
      end: newEndDate.toISOString()
    }));
  };

  const handleApplyFilters = () => {
    // Update with final date range
    dispatch(setCustomDateRange({
      start: startDate.toISOString(),
      end: endDate.toISOString()
    }));
    
    dispatch(applyFilters());
    
    if (isMobile) {
      onClose();
    }
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
    const defaultEndDate = subDays(new Date(), 1);
    const defaultStartDate = subDays(defaultEndDate, 30);
    setStartDate(defaultStartDate);
    setEndDate(defaultEndDate);
  };

  const sidebarClasses = `
    ${isMobile
      ? `fixed inset-0 z-50 bg-white transform transition-transform duration-300 w-full ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`
      : `w-80 bg-white border-r border-gray-200 ${isOpen ? 'block' : 'hidden'}`
    }
  `;

  return (
    <div className={sidebarClasses}>
      {/* Mobile header */}
      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">{t('filters.title')}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className={`${isMobile ? 'p-4 w-full max-w-full' : 'p-4'} h-full overflow-y-auto overflow-x-visible`}>
        {!isMobile && (
          <h2 className="text-lg font-semibold mb-4">{t('filters.title')}</h2>
        )}

        {/* Date Range */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('filters.dateRange')}
          </label>
          <div className="space-y-2">
            <DatePicker
              selected={startDate}
              onChange={(date) => handleDateChange('start', date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              minDate={startOfYear(new Date(2023, 0, 1))}
              maxDate={subDays(new Date(), 1)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
              placeholderText="Start Date"
              popperPlacement="bottom-start"
            />
            <DatePicker
              selected={endDate}
              onChange={(date) => handleDateChange('end', date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              maxDate={subDays(new Date(), 1)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
              placeholderText="End Date"
              popperPlacement="bottom-start"
            />
          </div>
        </div>

        {/* Channel */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('filters.channel')}
          </label>
          <Select
            options={channelOptions}
            value={channelOptions.find(option => option.value === filters?.channel)}
            onChange={(option) => handleFilterChange('channel', option.value)}
            className="text-sm"
            styles={{
              container: (provided) => ({
                ...provided,
                width: '100%'
              }),
              control: (provided) => ({
                ...provided,
                minHeight: '38px'
              })
            }}
          />
        </div>

        {/* Demographics Section */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">{t('filters.demographics')}</h3>

          {/* Gender */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {t('filters.gender')}
            </label>
            <Select
              options={genderOptions}
              value={genderOptions.find(option => option.value === filters?.gender)}
              onChange={(option) => handleFilterChange('gender', option.value)}
              className="text-sm"
              styles={{
                container: (provided) => ({
                  ...provided,
                  width: '100%'
                }),
                control: (provided) => ({
                  ...provided,
                  minHeight: '38px'
                })
              }}
            />
          </div>

          {/* Age Group */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {t('filters.ageGroup')}
            </label>
            <Select
              isMulti
              options={ageGroupOptions}
              value={ageGroupOptions.filter(option => filters?.ageGroups?.includes(option.value))}
              onChange={(options) => handleFilterChange('ageGroups', options ? options.map(opt => opt.value) : [])}
              className="text-sm"
            />
          </div>

          {/* Regions */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {t('filters.regions')}
            </label>
            <Select
              isMulti
              options={regionOptions}
              value={regionOptions.filter(option => filters?.regions?.includes(option.value))}
              onChange={(options) => handleFilterChange('regions', options ? options.map(opt => opt.value) : [])}
              className="text-sm"
            />
          </div>
        </div>

        {/* Go For More (conditional) */}
        {goForMoreAvailable && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('filters.goForMore')}
            </label>
            <Select
              options={goForMoreOptions}
              value={goForMoreOptions.find(option => option.value === filters?.goForMore)}
              onChange={(option) => handleFilterChange('goForMore', option?.value)}
              isClearable
              className="text-sm"
            />
          </div>
        )}

        {/* Shopping Interests */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('filters.shoppingInterests')}
          </label>
          <Select
            isMulti
            options={shoppingInterestOptions}
            value={shoppingInterestOptions.filter(option => filters?.shoppingInterests?.includes(option.value))}
            onChange={(options) => handleFilterChange('shoppingInterests', options ? options.map(opt => opt.value) : [])}
            className="text-sm"
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleApplyFilters}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            {t('filters.apply')}
          </button>
          <button
            onClick={handleResetFilters}
            className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors text-sm"
          >
            {t('filters.reset')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;