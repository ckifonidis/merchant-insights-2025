import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 mt-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-500">© 2025 Εθνική Τράπεζα της Ελλάδος</p>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Όροι Χρήσης</a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Πολιτική Απορρήτου</a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Επικοινωνία</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
