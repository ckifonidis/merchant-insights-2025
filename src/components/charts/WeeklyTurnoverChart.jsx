import React from 'react';

const WeeklyTurnoverChart = () => {
  return (
    <>
      <div className="bg-white p-4 rounded-lg border border-gray-200" style={{ height: '450px' }}>
        <svg id="weekly-chart" width="100%" height="100%" viewBox="0 0 800 400">
          {/* White background */}
          <rect x="0" y="0" width="800" height="400" fill="#FFFFFF" />
          
          {/* SVG Area Chart representation with different gradients for positive/negative */}
          <defs>
            <linearGradient id="positive-area-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#73AA3C" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#73AA3C" stopOpacity="0.05"/>
            </linearGradient>
            <linearGradient id="negative-area-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#A0052D" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#A0052D" stopOpacity="0.05"/>
            </linearGradient>
          </defs>
          
          {/* Axes */}
          <line x1="75" y1="200" x2="750" y2="200" stroke="#666" strokeWidth="1.5" />
          <line x1="75" y1="350" x2="75" y2="50" stroke="#666" strokeWidth="1.5" />
          
          {/* Y-axis labels */}
          <text x="70" y="50" textAnchor="end" fontSize="12" fill="#666" fontWeight="500">+15%</text>
          <text x="70" y="100" textAnchor="end" fontSize="12" fill="#666" fontWeight="500">+10%</text>
          <text x="70" y="150" textAnchor="end" fontSize="12" fill="#666" fontWeight="500">+5%</text>
          <text x="70" y="200" textAnchor="end" fontSize="12" fill="#666" fontWeight="500">0%</text>
          <text x="70" y="250" textAnchor="end" fontSize="12" fill="#666" fontWeight="500">-5%</text>
          <text x="70" y="300" textAnchor="end" fontSize="12" fill="#666" fontWeight="500">-10%</text>
          <text x="70" y="350" textAnchor="end" fontSize="12" fill="#666" fontWeight="500">-15%</text>
          
          {/* Horizontal grid lines */}
          <line x1="75" y1="50" x2="750" y2="50" stroke="#EEE" strokeWidth="1" />
          <line x1="75" y1="100" x2="750" y2="100" stroke="#EEE" strokeWidth="1" />
          <line x1="75" y1="150" x2="750" y2="150" stroke="#EEE" strokeWidth="1" />
          <line x1="75" y1="200" x2="750" y2="200" stroke="#EEE" strokeWidth="1" strokeDasharray="4,2" />
          <line x1="75" y1="250" x2="750" y2="250" stroke="#EEE" strokeWidth="1" />
          <line x1="75" y1="300" x2="750" y2="300" stroke="#EEE" strokeWidth="1" />
          
          {/* Week markers - showing 13 major ticks (quarterly) */}
          <line x1="100" y1="198" x2="100" y2="202" stroke="#666" strokeWidth="1.5" />
          <line x1="150" y1="198" x2="150" y2="202" stroke="#666" strokeWidth="1.5" />
          <line x1="200" y1="198" x2="200" y2="202" stroke="#666" strokeWidth="1.5" />
          <line x1="250" y1="198" x2="250" y2="202" stroke="#666" strokeWidth="1.5" />
          <line x1="300" y1="198" x2="300" y2="202" stroke="#666" strokeWidth="1.5" />
          <line x1="350" y1="198" x2="350" y2="202" stroke="#666" strokeWidth="1.5" />
          <line x1="400" y1="198" x2="400" y2="202" stroke="#666" strokeWidth="1.5" />
          <line x1="450" y1="198" x2="450" y2="202" stroke="#666" strokeWidth="1.5" />
          <line x1="500" y1="198" x2="500" y2="202" stroke="#666" strokeWidth="1.5" />
          <line x1="550" y1="198" x2="550" y2="202" stroke="#666" strokeWidth="1.5" />
          <line x1="600" y1="198" x2="600" y2="202" stroke="#666" strokeWidth="1.5" />
          <line x1="650" y1="198" x2="650" y2="202" stroke="#666" strokeWidth="1.5" />
          <line x1="700" y1="198" x2="700" y2="202" stroke="#666" strokeWidth="1.5" />
          
          {/* Month labels for x-axis */}
          <text x="100" y="370" textAnchor="middle" fontSize="13" fill="#666">Μάιος '24</text>
          <text x="250" y="370" textAnchor="middle" fontSize="13" fill="#666">Αύγουστος '24</text>
          <text x="400" y="370" textAnchor="middle" fontSize="13" fill="#666">Νοέμβριος '24</text>
          <text x="550" y="370" textAnchor="middle" fontSize="13" fill="#666">Φεβρουάριος '25</text>
          <text x="700" y="370" textAnchor="middle" fontSize="13" fill="#666">Μάιος '25</text>
          
          {/* X-axis label */}
          <text x="400" y="400" textAnchor="middle" fontSize="14" fill="#666" fontWeight="bold">Μήνες</text>
          
          {/* Vertical grid lines (every 4 weeks) */}
          <line x1="100" y1="50" x2="100" y2="350" stroke="#EEE" strokeWidth="1" />
          <line x1="150" y1="50" x2="150" y2="350" stroke="#EEE" strokeWidth="1" />
          <line x1="200" y1="50" x2="200" y2="350" stroke="#EEE" strokeWidth="1" />
          <line x1="250" y1="50" x2="250" y2="350" stroke="#EEE" strokeWidth="1" />
          <line x1="300" y1="50" x2="300" y2="350" stroke="#EEE" strokeWidth="1" />
          <line x1="350" y1="50" x2="350" y2="350" stroke="#EEE" strokeWidth="1" />
          <line x1="400" y1="50" x2="400" y2="350" stroke="#EEE" strokeWidth="1" />
          <line x1="450" y1="50" x2="450" y2="350" stroke="#EEE" strokeWidth="1" />
          <line x1="500" y1="50" x2="500" y2="350" stroke="#EEE" strokeWidth="1" />
          <line x1="550" y1="50" x2="550" y2="350" stroke="#EEE" strokeWidth="1" />
          <line x1="600" y1="50" x2="600" y2="350" stroke="#EEE" strokeWidth="1" />
          <line x1="650" y1="50" x2="650" y2="350" stroke="#EEE" strokeWidth="1" />
          <line x1="700" y1="50" x2="700" y2="350" stroke="#EEE" strokeWidth="1" />
          
          {/* Positive area (above zero line) */}
          <path d="M100,160 L112,155 L124,150 L136,145 
                L148,140 L160,135 L172,130 L184,125 
                L196,120 L208,115 L220,110 L232,120 
                L244,130 L256,135 L268,140 L280,145 
                L292,160 L304,200 L316,200 L328,200 
                L340,200 L352,200 L364,200 L376,200 
                L388,200 L400,200 L412,200 L424,200
                L436,200 L448,200 L460,200 L472,200
                L484,200 L496,200 L508,200 L520,200
                L532,130 L544,140 L556,145 L568,150 
                L580,155 L592,160 L604,170 L616,180 
                L628,170 L640,160 L652,165 L664,170 
                L676,165 L688,160 L700,155 L700,200 
                L100,200 Z" 
                fill="url(#positive-area-gradient)" />
          
          {/* Negative area (below zero line) */}
          <path d="M292,200 L304,230 L316,235 L328,225 
                L340,215 L352,220 L364,230 L376,240 
                L388,245 L400,255 L412,260 L424,270 
                L436,240 L448,230 L460,220 L472,230 
                L484,240 L496,230 L508,220 L520,205
                L532,200 L532,200 L520,200 L508,200 
                L496,200 L484,200 L472,200 L460,200 
                L448,200 L436,200 L424,200 L412,200 
                L400,200 L388,200 L376,200 L364,200 
                L352,200 L340,200 L328,200 L316,200 
                L304,200 L292,200 Z" 
                fill="url(#negative-area-gradient)" />
                
          {/* Data line for the 52 weeks - with percentage changes from same week last year */}
          <path d="M100,160 L112,155 L124,150 L136,145 
                L148,140 L160,135 L172,130 L184,125 
                L196,120 L208,115 L220,110 L232,120 
                L244,130 L256,135 L268,140 L280,145 
                L292,160 L304,230 L316,235 L328,225 
                L340,215 L352,220 L364,230 L376,240 
                L388,245 L400,255 L412,260 L424,270 
                L436,240 L448,230 L460,220 L472,230 
                L484,240 L496,230 L508,220 L520,205 
                L532,130 L544,140 L556,145 L568,150 
                L580,155 L592,160 L604,170 L616,180 
                L628,170 L640,160 L652,165 L664,170 
                L676,165 L688,160 L700,155" 
                fill="none" stroke="#007B85" strokeWidth="3" />
        </svg>
      </div>
      <div className="mt-4 text-sm text-gray-500">
        <p>Το γράφημα δείχνει το ποσοστό μεταβολής του τζίρου σε σχέση με την αντίστοιχη εβδομάδα του προηγούμενου έτους. Παρατηρείται <span className="font-medium text-green-500">θετική τάση (+5% έως +15%)</span> τους περισσότερους μήνες, με αρνητικές επιδόσεις κυρίως τον <span className="font-medium text-red-500">Οκτώβριο-Δεκέμβριο (-5% έως -10%)</span>.</p>
      </div>
    </>
  );
};

export default WeeklyTurnoverChart;
