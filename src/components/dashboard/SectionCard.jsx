import React from 'react';

const SectionCard = ({ title, icon, children }) => {
  return (
    <div className="section-card">
      <div className="section-header">
        <div className="flex items-center">
          {icon}
          <h3 className="font-bold text-gray-800">{title}</h3>
        </div>
        <button className="text-gray-400 hover:text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </button>
      </div>
      <div className="section-content">
        {children}
      </div>
    </div>
  );
};

export default SectionCard;
