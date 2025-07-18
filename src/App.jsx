import React, { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store/index.js';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import TabNavigation from './components/layout/TabNavigation';
import FilterSidebar from './components/layout/FilterSidebar';
import Dashboard from './components/dashboard/Dashboard';
import Revenue from './components/revenue/Revenue';
import Demographics from './components/demographics/Demographics';
import Competition from './components/competition/Competition';
import FirstPage from './components/FirstPage';
import LoadingPage from './components/LoadingPage';
import ErrorPage from './components/ErrorPage';
import NoAccessPage from './components/NoAccessPage';
import { useResponsive } from './hooks/useResponsive';
import { selectUIFilters, setSelectedTab } from './store/slices/filtersSlice.js';
import { useSelector, useDispatch } from 'react-redux';
import { checkUserStatus } from './services/analyticsService.js';
import './i18n';
import './styles/dashboard.css';

function AppContent() {
  const [showMainApp, setShowMainApp] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userStatus, setUserStatus] = useState(null); // 'signedup', 'notsignedup', 'noaccess'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const filters = useSelector(selectUIFilters);
  const { isMobile } = useResponsive();
  const dispatch = useDispatch();
  
  // Check user status on application startup
  useEffect(() => {
    const checkStatus = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await checkUserStatus();
        
        if (response && response.payload && response.payload.status) {
          setUserStatus(response.payload.status);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('User status check failed:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, []);

  // Update Redux with active tab
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    dispatch(setSelectedTab(newTab));
  };

  // Close sidebar on mobile by default
  React.useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleInterestClick = () => {
    setShowMainApp(true);
  };

  const handleRetry = async () => {
    setError(null);
    setLoading(true);
    
    try {
      const response = await checkUserStatus();
      
      if (response && response.payload && response.payload.status) {
        setUserStatus(response.payload.status);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('User status check failed:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard filters={filters} />;
      case 'revenue':
        return <Revenue filters={filters} />;
      case 'demographics':
        return <Demographics filters={filters} />;
      case 'competition':
        return <Competition filters={filters} />;
      default:
        return <Dashboard filters={filters} />;
    }
  };

  // Show loading page while checking user status
  if (loading) {
    return <LoadingPage />;
  }

  // Show error page if user status check failed
  if (error) {
    return <ErrorPage error={error} onRetry={handleRetry} />;
  }

  // Handle different user statuses
  if (userStatus === 'noaccess') {
    return <NoAccessPage />;
  }

  if (userStatus === 'notsignedup') {
    return <FirstPage onInterestClick={handleInterestClick} />;
  }

  // userStatus === 'signedup' - show main dashboard app
  // (Also handles the case where user clicks interest on FirstPage)

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />

      <div className="flex flex-1">
        {/* Filter Sidebar */}
        <FilterSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isMobile={isMobile}
        />

        {/* Mobile overlay */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Mobile Filter Toggle Button - Floating */}
        {isMobile && (
          <button
            onClick={toggleSidebar}
            className={`fixed top-1/2 transform -translate-y-1/2 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 ${
              sidebarOpen ? 'right-4' : 'left-4'
            }`}
          >
            {sidebarOpen ? (
              // Close icon
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" x2="6" y1="6" y2="18"/>
                <line x1="6" x2="18" y1="6" y2="18"/>
              </svg>
            ) : (
              // Filter icon
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
            )}
          </button>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Desktop Filter Toggle Button */}
          {!isMobile && (
            <div className="bg-white border-b border-gray-200 px-4 py-2">
              <button
                onClick={toggleSidebar}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <line x1="3" x2="21" y1="6" y2="6"/>
                  <line x1="3" x2="21" y1="12" y2="12"/>
                  <line x1="3" x2="21" y1="18" y2="18"/>
                </svg>
                {sidebarOpen ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>
          )}

          {/* Tab Content */}
          <main className="flex-1 bg-gray-50">
            {renderTabContent()}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// Wrap the app with Redux Provider
function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
