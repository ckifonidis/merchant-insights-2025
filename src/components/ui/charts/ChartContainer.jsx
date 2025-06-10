import React from 'react';
import { CSS_CLASSES, CHART_CONFIG } from '../../../utils/constants';

/**
 * Standard chart container with consistent layout and styling
 * Consolidates the repeated chart wrapper pattern
 */
const ChartContainer = ({
  title,
  children,
  controls,
  className = '',
  height = CHART_CONFIG.heights.default,
  showHeader = true,
  headerClassName = '',
  contentClassName = ''
}) => {
  return (
    <div className={`${CSS_CLASSES.card} ${CSS_CLASSES.cardPadding} ${className}`}>
      {showHeader && (
        <div className={`${CSS_CLASSES.flexBetween} mb-4 flex-wrap gap-4 ${headerClassName}`}>
          <h3 className={CSS_CLASSES.text.title}>
            {title}
          </h3>
          
          {controls && (
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              {controls}
            </div>
          )}
        </div>
      )}
      
      <div 
        className={`${contentClassName}`}
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
      >
        {children}
      </div>
    </div>
  );
};

export default ChartContainer;