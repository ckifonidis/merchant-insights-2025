import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import GenericMetricContainer from './containers/GenericMetricContainer';
import GenericTimeSeriesChartContainer from './containers/GenericTimeSeriesChartContainer';
import GenericCalendarHeatmapContainer from './containers/GenericCalendarHeatmapContainer';
import SignupFormContainer from './containers/SignupFormContainer';
import { formatCurrency } from '../utils/formatters';
import { selectRevenuePerDay } from '../store/selectors/dataSelectors';
import { selectUserInfo, selectNeedsSignup } from '../store/slices/authSlice';
import type { RootState } from '../store/index';

interface FirstPageProps {
  onInterestClick: () => void;
}

const FirstPage: React.FC<FirstPageProps> = ({ onInterestClick }) => {
  const { t } = useTranslation();
  
  // Redux state
  const userInfo = useSelector(selectUserInfo);
  const needsSignup = useSelector(selectNeedsSignup);
  
  // Local state for signup form
  const [showSignupForm, setShowSignupForm] = useState(false);

  // Icons for metrics
  const RevenueIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
      <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
    </svg>
  );

  const TransactionsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
      <path d="M3 6h18"></path>
      <path d="M16 10a4 4 0 0 1-8 0"></path>
    </svg>
  );

  const AvgTransactionIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
      <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );

  // Revenue chart selector function
  const revenueSelector = (state: RootState) => selectRevenuePerDay(state);

  // Signup flow handlers
  const handleInterestClick = () => {
    if (needsSignup) {
      // User needs signup, show signup form
      setShowSignupForm(true);
    } else {
      // User is already signed up, use original behavior
      onInterestClick();
    }
  };

  const handleSignupSuccess = () => {
    setShowSignupForm(false);
    // Note: User status will be updated on next app reload when backend processes the signup
    // For now, just show success and close the form
  };

  const handleSignupCancel = () => {
    setShowSignupForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                NBG Business Insights
              </h1>
              <p className="text-lg text-gray-600">
                Discover the power of data-driven business intelligence
              </p>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={handleInterestClick}
                className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg"
              >
                I'm Interested
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Preview Introduction */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Get a glimpse of what we offer
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Below is a small preview of the valuable insights we provide. Sign up to unlock comprehensive analytics, 
            competitor benchmarking, customer demographics, and much more to drive your business forward.
          </p>
        </div>

        {/* Competition Metrics Preview */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Competition Analysis Preview
          </h3>
          <div className="space-y-4">
            {/* Revenue Metric */}
            <GenericMetricContainer
              title={t('competition.revenue')}
              metricId="total_revenue"
              valueType="currency"
              variant="competition"
              icon={<RevenueIcon />}
            />

            {/* Transactions Metric */}
            <GenericMetricContainer
              title={t('competition.transactions')}
              metricId="total_transactions"
              valueType="number"
              variant="competition"
              icon={<TransactionsIcon />}
            />

            {/* Average Transaction Amount Metric */}
            <GenericMetricContainer
              title={t('competition.avgTransactionAmount')}
              metricId="avg_ticket_per_user"
              valueType="currency"
              variant="competition"
              icon={<AvgTransactionIcon />}
            />
          </div>
        </div>

        {/* Revenue Chart Preview */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Revenue Trends Preview
          </h3>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <GenericTimeSeriesChartContainer
              title={t('dashboard.revenue')}
              metricId="revenue_per_day"
              selector={revenueSelector}
              formatValue={formatCurrency}
              showCompetitor={false}
              merchantLabel="Your Business"
              hasCompetitorData={false}
            />
          </div>
        </div>

        {/* Monthly Turnover Heatmap Preview */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Monthly Turnover Heatmap Preview
          </h3>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <GenericCalendarHeatmapContainer
              metricId="revenue_per_day"
              title={t('competition.monthlyTurnover')}
              valueLabel="Turnover"
            />
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to unlock your business potential?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            This is just a taste of what NBG Business Insights can offer. Get access to comprehensive analytics, 
            detailed customer demographics, competitive benchmarking, and actionable insights to grow your business.
          </p>
          <button
            onClick={handleInterestClick}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg"
          >
            I'm Interested - Show Me More
          </button>
        </div>
      </div>

      {/* Signup Form Modal */}
      {showSignupForm && userInfo?.preferred_username && (
        <SignupFormContainer
          userID={userInfo.preferred_username}
          onSuccess={handleSignupSuccess}
          onCancel={handleSignupCancel}
        />
      )}
    </div>
  );
};

export default FirstPage;