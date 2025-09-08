import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useUserInfo } from '../../hooks/useAuthState';
import { 
  selectPrimaryMerchant, 
  selectMerchantsLoading, 
  selectUserId 
} from '../../store/slices/userConfigSlice';

interface ApplicationHeaderProps {
  className?: string;
}

const ApplicationHeader: React.FC<ApplicationHeaderProps> = ({ 
  className = ''
}) => {
  const { t, i18n } = useTranslation();
  const userInfo = useUserInfo();
  
  // Get user configuration data from Redux
  const primaryMerchant = useSelector(selectPrimaryMerchant);
  const merchantsLoading = useSelector(selectMerchantsLoading);
  const userId = useSelector(selectUserId);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'gr' : 'en';
    i18n.changeLanguage(newLang);
  };

  // Get display values with fallbacks
  const displayUserId = userInfo?.preferred_username || userId || 'User';
  
  // Check if we have a valid merchant available
  const hasMerchant = !merchantsLoading && primaryMerchant?.name;
  
  const displayMerchantName = (() => {
    if (merchantsLoading) return t('header.loading_merchant', 'Loading...');
    if (primaryMerchant?.name) return primaryMerchant.name;
    return t('header.no_merchant', 'No Merchant');
  })();
  
  // Generate avatar initials - use merchant name if available, otherwise username
  const getAvatarInitials = (): string => {
    if (hasMerchant && primaryMerchant?.name) {
      // Use merchant name for initials when merchant is available
      return primaryMerchant.name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
    } else {
      // Use username for initials when no merchant
      const nameToUse = displayUserId;
      if (!nameToUse || nameToUse === 'User') {
        return 'U'; // Default fallback
      }
      return nameToUse.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
    }
  };

  // Handle loading state for avatar
  const avatarClass = merchantsLoading 
    ? "w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium animate-pulse"
    : "w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium";
  
  // Handle loading state for text
  const merchantNameClass = merchantsLoading
    ? "text-sm font-medium text-gray-500"
    : "text-sm font-medium text-gray-700";

  // Standard header styling
  const headerClass = `bg-white border-b border-gray-200 sticky top-0 z-10 ${className}`;
  const containerClass = "container mx-auto px-4 py-3";

  return (
    <header className={headerClass}>
      <div className={containerClass}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="mr-2">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="20" fill="#007B85" />
                <path d="M12 20C12 15.5817 15.5817 12 20 12C24.4183 12 28 15.5817 28 20C28 24.4183 24.4183 28 20 28C15.5817 28 12 24.4183 12 20Z" fill="#00DEF8" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-800">
              {t('header.title')}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" x2="22" y1="12" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              {i18n.language === 'en' ? 'EN' : 'ΕΛ'}
            </button>

            {/* Notifications */}
            <button className="p-2 text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bell">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
              </svg>
            </button>

            {/* User Info */}
            <div className="flex items-center">
              <div className={avatarClass}>
                {getAvatarInitials()}
              </div>
              <div className={`ml-2 ${hasMerchant || merchantsLoading ? 'flex flex-col' : 'flex items-center h-8'}`}>
                {hasMerchant ? (
                  // Two-line layout: username + merchant name
                  <>
                    <span className="text-xs text-gray-500">{displayUserId}</span>
                    <span className={merchantNameClass}>{displayMerchantName}</span>
                  </>
                ) : merchantsLoading ? (
                  // Loading state: username + loading
                  <>
                    <span className="text-xs text-gray-500">{displayUserId}</span>
                    <span className="text-sm font-medium text-gray-500">{displayMerchantName}</span>
                  </>
                ) : (
                  // Single-line layout: username only (centered)
                  <span className="text-sm font-medium text-gray-700">{displayUserId}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ApplicationHeader;