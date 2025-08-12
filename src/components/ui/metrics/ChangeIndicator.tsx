import React from 'react';
import { formatChange } from '../../../utils/formatters';
import { COLORS, ICON_SIZES } from '../../../utils/constants';

// TypeScript interfaces
export type ChangeType = 'percentage' | 'currency' | 'number';
export type ChangeSize = 'xs' | 'sm' | 'md' | 'lg';
export type ChangeVariant = 'inline' | 'badge' | 'full';

export interface ChangeIndicatorProps {
  value: number | null | undefined;
  type?: ChangeType;
  size?: ChangeSize;
  variant?: ChangeVariant;
  showIcon?: boolean;
  showSign?: boolean;
  precision?: number;
  className?: string;
}

/**
 * Reusable component for displaying change indicators with arrows
 * Consolidates all the duplicate arrow/change logic across components
 */
const ChangeIndicator: React.FC<ChangeIndicatorProps> = ({
  value,
  type = 'percentage',
  size = 'sm',
  variant = 'inline',
  showIcon = true,
  showSign = true,
  precision = 1,
  className = ''
}) => {
  // Handle null/undefined values
  if (value === null || value === undefined || isNaN(value)) {
    return (
      <span className={`text-gray-400 text-sm ${className}`}>
        -
      </span>
    );
  }

  const changeData = formatChange(value, { type, showSign, precision });
  const { formatted, isPositive, isNegative } = changeData;

  // Color classes based on change direction
  const colorClass = isPositive 
    ? 'text-green-600' 
    : isNegative 
    ? 'text-red-600' 
    : 'text-gray-500';

  // Icon size classes
  const iconSizeClass = ICON_SIZES[size] || ICON_SIZES.sm;

  // Variant-specific styling
  const getVariantClasses = (): string => {
    switch (variant) {
      case 'badge':
        return `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          isPositive 
            ? 'bg-green-100 text-green-800' 
            : isNegative 
            ? 'bg-red-100 text-red-800' 
            : 'bg-gray-100 text-gray-800'
        }`;
      case 'full':
        return `flex items-center justify-center p-2 rounded-lg ${
          isPositive 
            ? 'bg-green-50 text-green-700' 
            : isNegative 
            ? 'bg-red-50 text-red-700' 
            : 'bg-gray-50 text-gray-700'
        }`;
      default: // inline
        return `inline-flex items-center text-sm font-medium ${colorClass}`;
    }
  };

  // Arrow icons
  const UpArrow: React.FC = () => (
    <svg 
      className={`${iconSizeClass} ${showIcon ? 'mr-1' : ''}`} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M7 17l9.2-9.2M17 17V7H7" 
      />
    </svg>
  );

  const DownArrow: React.FC = () => (
    <svg 
      className={`${iconSizeClass} ${showIcon ? 'mr-1' : ''}`} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M17 7l-9.2 9.2M7 7v10h10" 
      />
    </svg>
  );

  const NoChangeIcon: React.FC = () => (
    <svg 
      className={`${iconSizeClass} ${showIcon ? 'mr-1' : ''}`} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M20 12H4" 
      />
    </svg>
  );

  return (
    <span className={`${getVariantClasses()} ${className}`}>
      {showIcon && (
        <>
          {isPositive && <UpArrow />}
          {isNegative && <DownArrow />}
          {!isPositive && !isNegative && <NoChangeIcon />}
        </>
      )}
      {formatted}
    </span>
  );
};

export default ChangeIndicator;