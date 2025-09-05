import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  selectSignupLoading,
  selectSignupError,
  selectUserEmail,
  selectSubmissionStatus,
  selectCanSubmitSignup,
  setSignupLoading,
  setSignupError,
  setSignupSuccess,
  setUserEmail,
  setSubmissionStatus,
  setSignupStep,
  resetSignupState
} from '../../store/slices/authSlice';
import { getUserEmail, submitSignupForm, checkSubmissionStatus, validateEmail, validateMerchantIDs } from '../../services/onboardingService';
import PresentationalSignupForm from '../ui/forms/PresentationalSignupForm';
import type { SignupFormContainerProps } from '../../types/onboarding';

/**
 * Smart Container for Signup Form
 * Handles Redux state management, API calls, validation, and business logic
 * Uses the simplified signup flow with loading/error states from auth slice
 */
const SignupFormContainer: React.FC<SignupFormContainerProps> = ({
  userID,
  onSuccess,
  onCancel
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  // Redux state
  const isLoading = useSelector(selectSignupLoading);
  const error = useSelector(selectSignupError);
  const userEmail = useSelector(selectUserEmail);
  const submissionStatus = useSelector(selectSubmissionStatus);
  const canSubmit = useSelector(selectCanSubmitSignup);
  
  // Local form state
  const [formEmail, setFormEmail] = useState('');
  const [otherBankMIDs, setOtherBankMIDs] = useState<string[]>([]);
  const [formInitialized, setFormInitialized] = useState(false);

  /**
   * Initialize signup form on mount
   * Check submission status and fetch user email if can proceed
   */
  useEffect(() => {
    const initializeSignup = async () => {
      if (formInitialized) return;
      
      dispatch(setSignupLoading(true));
      dispatch(setSignupError(null));

      try {
        console.log('🔍 Initializing signup form for user:', userID);

        // Step 1: Check if user has already submitted
        const status = await checkSubmissionStatus(userID);
        dispatch(setSubmissionStatus(status));

        if (!status.canProceed) {
          if (status.submittedBySameUserId) {
            dispatch(setSignupError(t('signup.status.alreadySubmitted')));
          } else if (status.submittedByOtherUserId) {
            dispatch(setSignupError(t('signup.status.submittedByOther')));
          }
          dispatch(setSignupLoading(false));
          return;
        }

        // Step 2: Fetch user email
        const { emailAddress } = await getUserEmail(userID);
        dispatch(setUserEmail(emailAddress));
        setFormEmail(emailAddress);
        
        dispatch(setSignupStep('form'));
        setFormInitialized(true);

        console.log('✅ Signup form initialized successfully');

      } catch (error) {
        console.error('❌ Failed to initialize signup form:', error);
        dispatch(setSignupError(error instanceof Error ? error.message : 'Failed to load signup form. Please try again.'));
      } finally {
        dispatch(setSignupLoading(false));
      }
    };

    initializeSignup();
  }, [userID, dispatch, formInitialized]);

  /**
   * Handle form submission
   */
  const handleSubmit = async () => {
    if (!canSubmit || isLoading) return;

    // Validate form data
    if (!validateEmail(formEmail)) {
      dispatch(setSignupError(t('signup.validation.emailInvalid')));
      return;
    }

    if (!validateMerchantIDs(otherBankMIDs)) {
      dispatch(setSignupError(t('signup.validation.merchantIdsInvalid')));
      return;
    }

    dispatch(setSignupLoading(true));
    dispatch(setSignupError(null));

    try {
      console.log('📝 Submitting signup form for user:', userID);

      await submitSignupForm({
        userID,
        merchantEmail: formEmail,
        otherBankMIDs,
        extraData: null
      });

      dispatch(setSignupSuccess(true));
      dispatch(setSignupStep('submitted'));
      
      console.log('✅ Signup form submitted successfully');
      
      // Call success callback after a brief delay to show success state
      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (error) {
      console.error('❌ Signup form submission failed:', error);
      dispatch(setSignupError(error instanceof Error ? error.message : 'Failed to submit application. Please try again.'));
    } finally {
      dispatch(setSignupLoading(false));
    }
  };

  /**
   * Handle form cancellation
   */
  const handleCancel = () => {
    dispatch(resetSignupState());
    onCancel();
  };

  /**
   * Handle email change (validation)
   */
  const handleEmailChange = (email: string) => {
    setFormEmail(email);
    
    // Clear email-related errors when user starts typing
    if (error && error.includes('email')) {
      dispatch(setSignupError(null));
    }
  };

  /**
   * Handle merchant IDs change (validation)
   */
  const handleMerchantIDsChange = (ids: string[]) => {
    setOtherBankMIDs(ids);
    
    // Clear merchant ID-related errors when user starts typing
    if (error && error.includes('merchant')) {
      dispatch(setSignupError(null));
    }
  };

  // Show loading state during initialization
  if (!formInitialized && isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('signup.status.loadingInfo')}</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if initialization failed
  if (!formInitialized && error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('signup.status.cannotLoad')}</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              {t('signup.status.closeButton')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show success state
  if (formInitialized && submissionStatus?.submittedBySameUserId) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('signup.status.alreadySubmitted')}</h3>
            <p className="text-gray-600 mb-4">
              {t('signup.status.alreadySubmittedNote')}
            </p>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {t('signup.status.closeButton')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render the main signup form
  return (
    <PresentationalSignupForm
      email={formEmail}
      otherBankMIDs={otherBankMIDs}
      isLoading={isLoading}
      error={error}
      canSubmit={canSubmit && formInitialized}
      onEmailChange={handleEmailChange}
      onMerchantIDsChange={handleMerchantIDsChange}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
};

export default SignupFormContainer;