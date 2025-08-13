import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useResponsive } from '../../hooks/useResponsive';

const TabNavigation = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation();
  const { isMobile } = useResponsive();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const tabs = [
    { id: 'dashboard', label: t('navigation.dashboard'), icon: '📊' },
    { id: 'revenue', label: t('navigation.revenue'), icon: '💰' },
    { id: 'demographics', label: t('navigation.demographics'), icon: '👥' },
    { id: 'competition', label: t('navigation.competition'), icon: '🏆' }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  const handleTabSelect = (tabId) => {
    onTabChange(tabId);
    setIsDropdownOpen(false); // Auto-close dropdown after selection
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  if (isMobile) {
    return (
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative" ref={dropdownRef}>
            {/* Mobile Dropdown Button */}
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-4 text-sm font-medium text-blue-600 bg-white border-b-2 border-blue-500"
            >
              <div className="flex items-center">
                <span className="mr-2 text-base leading-none">{activeTabData?.icon}</span>
                <span>{activeTabData?.label}</span>
              </div>
              <svg
                className={`w-5 h-5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Mobile Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 border-t-0 shadow-lg z-50">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabSelect(tab.id)}
                    className={`
                      w-full flex items-center px-3 py-4 text-sm font-medium transition-colors duration-200
                      ${activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <span className="mr-2 text-base leading-none">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>
    );
  }

  // Desktop version (unchanged)
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors duration-200
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default TabNavigation;
