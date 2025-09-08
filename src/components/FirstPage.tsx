import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import ApplicationHeader from './layout/ApplicationHeader';
import { useResponsive } from '../hooks/useResponsive';
import GenericMetricContainer from './containers/GenericMetricContainer';
import GenericTimeSeriesChartContainer from './containers/GenericTimeSeriesChartContainer';
import GenericCalendarHeatmapContainer from './containers/GenericCalendarHeatmapContainer';
import SignupFormContainer from './containers/SignupFormContainer';
import { formatCurrency } from '../utils/formatters';
import { selectRevenuePerDay } from '../store/selectors/dataSelectors';
import { 
  selectUserInfo, 
  selectNeedsSignup, 
  selectSubmissionStatus,
  setSubmissionStatus,
  setSignupError
} from '../store/slices/authSlice';
import { checkSubmissionStatus } from '../services/onboardingService';
import type { RootState } from '../store/index';

interface FirstPageProps {
  onInterestClick: () => void;
}

const FirstPage: React.FC<FirstPageProps> = ({ onInterestClick }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  // Responsive design integration
  const { isMobile, isTablet, width } = useResponsive();
  
  // Redux state
  const userInfo = useSelector(selectUserInfo);
  const needsSignup = useSelector(selectNeedsSignup);
  const submissionStatus = useSelector(selectSubmissionStatus);
  
  // Local state for signup form and status checking
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

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

  // Check submission status on component mount
  useEffect(() => {
    const initializeSubmissionCheck = async () => {
      // Only check if user is authenticated and needs signup
      if (!userInfo?.preferred_username || !needsSignup) {
        return;
      }

      // Skip if already checked
      if (submissionStatus !== null) {
        return;
      }

      setIsCheckingStatus(true);
      dispatch(setSignupError(null));

      try {
        console.log('🔍 Checking submission status for FirstPage:', userInfo.preferred_username);
        
        const status = await checkSubmissionStatus(userInfo.preferred_username);
        dispatch(setSubmissionStatus(status));
        
        console.log('✅ Submission status check completed:', status);
      } catch (error) {
        console.error('❌ Failed to check submission status:', error);
        dispatch(setSignupError(error instanceof Error ? error.message : 'Failed to check application status'));
      } finally {
        setIsCheckingStatus(false);
      }
    };

    void initializeSubmissionCheck();
  }, [userInfo?.preferred_username, needsSignup, submissionStatus, dispatch]);

  // Signup flow handlers
  const handleInterestClick = () => {
    // If user already submitted, don't open modal (banner shows status)
    if (submissionStatus?.submittedBySameUserId) {
      return;
    }
    
    if (needsSignup) {
      // User needs signup, show signup form
      setShowSignupForm(true);
    } else {
      // User is already signed up, use original behavior
      onInterestClick();
    }
  };

  const handleSignupSuccess = () => {
    // Immediately update submission status to show pending state
    dispatch(setSubmissionStatus({
      submittedBySameUserId: true,
      submittedByOtherUserId: false,
      canProceed: false
    }));
    
    setShowSignupForm(false);
  };

  const handleSignupCancel = () => {
    setShowSignupForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Standard Header */}
      <ApplicationHeader />

      {/* Application Status Banner - Show when user has already submitted */}
      {submissionStatus?.submittedBySameUserId && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  {t('signup.banner.applicationSubmittedTitle')}
                </h3>
                <p className="text-blue-800 leading-relaxed">
                  {t('signup.banner.applicationSubmittedMessage')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section with Preview Introduction */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
          <div className="text-center">
            {/* Marketing-Focused Hero Title - Mobile-first responsive */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
              {t('firstPage.heroTitle')}
            </h1>
            
            {/* Comprehensive Hero Description - Mobile-optimized */}
            <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-3xl lg:max-w-4xl mx-auto leading-relaxed">
              {t('firstPage.heroDescription')}
            </p>
            
            {/* Show button only if user hasn't submitted - Touch-optimized */}
            {!submissionStatus?.submittedBySameUserId && !isCheckingStatus && (
              <button
                onClick={handleInterestClick}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 sm:py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg text-base sm:text-lg min-h-[44px]"
              >
                {t('firstPage.interestedButton')}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">

        {/* Competition Metrics Preview */}
        <div className="mb-8 sm:mb-12">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
            {t('firstPage.preview.competitionAnalysis')}
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
        <div className="mb-8 sm:mb-12">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
            {t('firstPage.preview.revenueTrends')}
          </h3>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <GenericTimeSeriesChartContainer
              title={t('dashboard.revenue')}
              metricId="revenue_per_day"
              selector={revenueSelector}
              formatValue={formatCurrency}
              showCompetitor={false}
              merchantLabel={t('firstPage.preview.yourBusiness')}
              hasCompetitorData={false}
            />
          </div>
        </div>

        {/* Monthly Turnover Heatmap Preview */}
        <div className="mb-8 sm:mb-12">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
            {t('firstPage.preview.monthlyTurnoverHeatmap')}
          </h3>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <GenericCalendarHeatmapContainer
              metricId="revenue_per_day"
              title={t('competition.monthlyTurnover')}
              valueLabel={t('firstPage.preview.turnover')}
            />
          </div>
        </div>

        {/* Call to Action - Only show if user hasn't submitted */}
        {!submissionStatus?.submittedBySameUserId && (
          <div className="text-center bg-white p-6 sm:p-8 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              {t('firstPage.callToAction.title')}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-2xl mx-auto">
              {t('firstPage.callToAction.description')}
            </p>
            <button
              onClick={handleInterestClick}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 sm:py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg text-base sm:text-lg min-h-[44px]"
            >
              {t('firstPage.callToAction.button')}
            </button>
          </div>
        )}
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