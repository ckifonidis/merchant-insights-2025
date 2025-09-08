import React from 'react';
import { useTranslation } from 'react-i18next';
import type { PresentationalSignupFormProps } from '../../../types/onboarding';

/**
 * Presentational Signup Form Component
 * Pure UI component with no Redux dependencies or business logic
 * Handles form display, validation feedback, and user interactions
 */
const PresentationalSignupForm: React.FC<PresentationalSignupFormProps> = ({
  email,
  otherBankMIDs,
  isLoading,
  error,
  canSubmit,
  onEmailChange,
  onMerchantIDsChange,
  onSubmit,
  onCancel
}) => {
  const { t } = useTranslation();
  
  const handleMerchantIDsChange = (value: string) => {
    // Split by newlines and filter out empty strings
    const ids = value.split('\n').filter(id => id.trim().length > 0);
    onMerchantIDsChange(ids);
  };

  const merchantIDsValue = otherBankMIDs.join('\n');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 lg:p-8 max-w-sm sm:max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            {t('signup.title')}
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            {t('signup.subtitle')}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
          {/* Email Field */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              {t('signup.form.emailLabel')}
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-base min-h-[44px]"
              placeholder={t('signup.form.emailPlaceholder')}
              required
              disabled={isLoading}
              readOnly // Email is pre-filled from API and shouldn't be editable
            />
            <p className="text-xs text-gray-500 mt-1">
              {t('signup.form.emailNote')}
            </p>
          </div>

          {/* Other Bank Merchant IDs Field */}
          <div className="mb-6">
            <label htmlFor="merchantIds" className="block text-sm font-medium text-gray-700 mb-2">
              {t('signup.form.merchantIdsLabel')}
              <span className="text-gray-500 font-normal ml-1">{t('signup.form.merchantIdsOptional')}</span>
            </label>
            <textarea
              id="merchantIds"
              value={merchantIDsValue}
              onChange={(e) => handleMerchantIDsChange(e.target.value)}
              className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base"
              placeholder={t('signup.form.merchantIdsPlaceholder')}
              rows={3}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              {t('signup.form.merchantIdsNote')}
            </p>
          </div>

          {/* Form Actions - Mobile-optimized button layout */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="w-full sm:flex-1 px-4 py-3 sm:py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 min-h-[44px]"
            >
              {t('signup.form.cancelButton')}
            </button>
            <button
              type="submit"
              disabled={!canSubmit || isLoading}
              className="w-full sm:flex-1 px-4 py-3 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center min-h-[44px]"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('signup.form.submitting')}
                </>
              ) : (
                t('signup.form.submitButton')
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            {t('signup.footer')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PresentationalSignupForm;