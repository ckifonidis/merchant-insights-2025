import React from 'react';
import { useTranslation } from 'react-i18next';

const LoadingPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center">
      {/* NBG Logo */}
      <div className="mb-8">
        <img
          className="h-16 w-auto"
          src="/nbg-logo.png"
          alt="NBG Logo"
        />
      </div>

      {/* Loading Spinner */}
      <div className="mb-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      {/* Loading Text */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {t('loading.title')}
        </h2>
        <p className="text-sm text-gray-600">
          {t('loading.message')}
        </p>
      </div>

      {/* Progress Dots */}
      <div className="flex space-x-1 mt-8">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-75"></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-150"></div>
      </div>
    </div>
  );
};

export default LoadingPage;