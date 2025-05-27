import React from 'react';

const CustomerDemographics = () => {
  return (
    <div className="grid grid-cols-1 gap-4 mb-4">
      {/* Gender Demographics Card */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Φύλο</h4>
        <div>
          {/* Single bar showing both genders */}
          <div className="w-full h-12 bg-gray-100 rounded-md overflow-hidden mb-3">
            <div className="flex h-full">
              <div className="h-full bg-blue-600" style={{ width: '55%' }}></div>
              <div className="h-full bg-pink-300" style={{ width: '45%' }}></div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex justify-center space-x-8 mt-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-600 rounded-sm mr-2"></div>
              <span className="text-sm">Άνδρες (55%)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-pink-300 rounded-sm mr-2"></div>
              <span className="text-sm">Γυναίκες (45%)</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Age Demographics Card */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Ηλικία</h4>
        <div>
          {/* Vertical bar chart similar to interests */}
          <div className="flex flex-col space-y-3">
            <div className="flex items-center">
              <div className="w-24 text-sm font-medium">18-24</div>
              <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
                <div className="h-full bg-teal-500" style={{ width: '15%' }}></div>
              </div>
              <div className="w-12 text-sm font-medium text-right">15%</div>
            </div>
            <div className="flex items-center">
              <div className="w-24 text-sm font-medium">25-34</div>
              <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
                <div className="h-full bg-teal-500" style={{ width: '30%' }}></div>
              </div>
              <div className="w-12 text-sm font-medium text-right">30%</div>
            </div>
            <div className="flex items-center">
              <div className="w-24 text-sm font-medium">35-44</div>
              <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
                <div className="h-full bg-teal-500" style={{ width: '25%' }}></div>
              </div>
              <div className="w-12 text-sm font-medium text-right">25%</div>
            </div>
            <div className="flex items-center">
              <div className="w-24 text-sm font-medium">45-54</div>
              <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
                <div className="h-full bg-teal-500" style={{ width: '20%' }}></div>
              </div>
              <div className="w-12 text-sm font-medium text-right">20%</div>
            </div>
            <div className="flex items-center">
              <div className="w-24 text-sm font-medium">55+</div>
              <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
                <div className="h-full bg-teal-500" style={{ width: '10%' }}></div>
              </div>
              <div className="w-12 text-sm font-medium text-right">10%</div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex justify-center mt-4 border-t border-gray-100 pt-3">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-teal-500 rounded-sm mr-2"></div>
              <span className="text-sm">Ποσοστό πελατών</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Interests Demographics Card */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Ενδιαφέροντα πελατών</h4>
        <div className="flex flex-col space-y-3">
          <div className="flex items-center">
            <div className="w-24 text-sm font-medium">Ηλεκτρονικά</div>
            <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
              <div className="h-full bg-teal-500" style={{ width: '28%' }}></div>
            </div>
            <div className="w-12 text-sm font-medium text-right">28%</div>
          </div>
          <div className="flex items-center">
            <div className="w-24 text-sm font-medium">Ταξίδια</div>
            <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: '22%' }}></div>
            </div>
            <div className="w-12 text-sm font-medium text-right">22%</div>
          </div>
          <div className="flex items-center">
            <div className="w-24 text-sm font-medium">Εστίαση</div>
            <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
              <div className="h-full bg-green-500" style={{ width: '18%' }}></div>
            </div>
            <div className="w-12 text-sm font-medium text-right">18%</div>
          </div>
          <div className="flex items-center">
            <div className="w-24 text-sm font-medium">Ένδυση</div>
            <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
              <div className="h-full bg-amber-700" style={{ width: '12%' }}></div>
            </div>
            <div className="w-12 text-sm font-medium text-right">12%</div>
          </div>
          <div className="flex items-center">
            <div className="w-24 text-sm font-medium">Άλλα</div>
            <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
              <div className="h-full bg-gray-500" style={{ width: '20%' }}></div>
            </div>
            <div className="w-12 text-sm font-medium text-right">20%</div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 justify-center border-t border-gray-100 pt-3">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-teal-500 rounded-sm mr-2"></div>
            <span className="text-sm">Ηλεκτρονικά</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-sm mr-2"></div>
            <span className="text-sm">Ταξίδια</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-sm mr-2"></div>
            <span className="text-sm">Εστίαση</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-amber-700 rounded-sm mr-2"></div>
            <span className="text-sm">Ένδυση</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-500 rounded-sm mr-2"></div>
            <span className="text-sm">Άλλα</span>
          </div>
        </div>
      </div>
      
      <div className="text-sm text-gray-500 mt-4">
        <p>Οι πελάτες σας ενδιαφέρονται περισσότερο για <span className="font-medium text-teal-500">ηλεκτρονικά</span> (28%) και <span className="font-medium text-blue-500">ταξίδια</span> (22%), ενώ ακολουθούν <span className="font-medium text-green-500">εστίαση</span> (18%) και <span className="font-medium text-amber-700">ένδυση</span> (12%).</p>
      </div>
    </div>
  );
};

export default CustomerDemographics;
