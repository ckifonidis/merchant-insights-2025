/**
 * React Component Prop Type Definitions
 */

import React from 'react';
import { MetricId } from './analytics';
import { ChartType, TimelineAggregation, ChartColors } from './charts';

// Base component props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Loading component props
export interface LoadingProps extends BaseComponentProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

// Error component props
export interface ErrorPageProps extends BaseComponentProps {
  error: string | Error | null;
  onRetry?: () => void;
  title?: string;
}

// Protected route props
export interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Metric card props
export interface MetricCardProps {
  metricId: MetricId;
  title: string;
  icon?: React.ComponentType<any>;
  variant?: 'single' | 'detailed' | 'comparison' | 'competition';
  className?: string;
}

// Universal metric card props
export interface UniversalMetricCardProps extends MetricCardProps {
  loading?: boolean;
  error?: string | null;
}

// Change indicator props
export interface ChangeIndicatorProps {
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  showPercentage?: boolean;
  size?: 'small' | 'medium' | 'large';
}

// Tab navigation props
export interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

// Filter sidebar props
export interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

// Header props
export interface HeaderProps {
  onLogout?: () => void;
}

// Dashboard props
export interface DashboardProps {
  filters?: Record<string, any>;
}

// Revenue props
export interface RevenueProps {
  filters?: Record<string, any>;
}

// Demographics props
export interface DemographicsProps {
  filters?: Record<string, any>;
}

// Competition props
export interface CompetitionProps {
  filters?: Record<string, any>;
}

// Chart component base props
export interface BaseChartProps {
  title?: string;
  loading?: boolean;
  error?: string | null;
  className?: string;
}

// Bespoke chart component props (tab-specific)
export interface BespokeChartProps extends BaseChartProps {
  metricId: MetricId;
  colors?: ChartColors;
  formatValue?: (value: number) => string;
  formatTooltipValue?: (value: number) => string;
}