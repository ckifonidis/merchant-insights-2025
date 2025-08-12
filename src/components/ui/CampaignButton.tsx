import React from 'react';

const CampaignButton: React.FC = () => {
  return (
    <div className="mt-8 text-center">
      <button className="bg-gradient-to-r from-teal-500 to-blue-500 text-white py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 font-medium flex items-center justify-center mx-auto">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
        </svg>
        Σχεδίασε μια καμπάνια για πελάτες Εθνικής
      </button>
    </div>
  );
};

export default CampaignButton;
