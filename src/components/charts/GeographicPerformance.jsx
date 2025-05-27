import { useTranslation } from 'react-i18next';

const GeographicPerformance = ({ filters }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="bg-white p-4 rounded-lg border border-gray-200" style={{ height: '400px' }}>
        <svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg" className="max-h-full max-w-full">
          {/* More accurate Greece map with improved regions */}
          <g transform="translate(100, 80) scale(1.2)">
            {/* Thrace */}
            <path d="M478,58 L498,52 L518,48 L535,53 L545,44 L554,40 L558,50 L550,60 L538,67 L525,71 L511,74 L500,78 L490,70 L478,68 L478,58 Z"
              fill="#73AA3C" stroke="#ffffff" strokeWidth="2"/>
            <text x="520" y="60" fontSize="10" fill="#ffffff" textAnchor="middle" fontWeight="bold">ΘΡΑΚΗ</text>

            {/* Macedonia */}
            <path d="M384,58 L404,52 L424,48 L444,50 L460,54 L478,58 L478,68 L476,80 L466,93 L445,102 L424,108 L403,110 L382,117 L365,113 L350,104 L339,90 L335,76 L342,65 L356,59 L370,57 L384,58 Z"
              fill="#73AA3C" stroke="#ffffff" strokeWidth="2"/>
            <text x="425" y="85" fontSize="11" fill="#ffffff" textAnchor="middle" fontWeight="bold">ΜΑΚΕΔΟΝΙΑ</text>

            {/* Epirus */}
            <path d="M322,95 L338,90 L350,104 L365,113 L368,125 L362,138 L350,150 L338,156 L325,159 L312,162 L300,158 L290,150 L282,138 L280,125 L285,110 L295,100 L310,95 L322,95 Z"
              fill="#F5F8F6" stroke="#ffffff" strokeWidth="2"/>
            <text x="325" y="135" fontSize="11" fill="#333333" textAnchor="middle" fontWeight="bold">ΗΠΕΙΡΟΣ</text>

            {/* Thessaly */}
            <path d="M368,125 L382,117 L403,110 L424,108 L440,112 L452,122 L456,136 L450,150 L438,160 L422,166 L405,168 L390,165 L375,158 L368,145 L368,125 Z"
              fill="#F5F8F6" stroke="#ffffff" strokeWidth="2"/>
            <text x="412" y="145" fontSize="11" fill="#333333" textAnchor="middle" fontWeight="bold">ΘΕΣΣΑΛΙΑ</text>

            {/* Central Greece */}
            <path d="M325,159 L350,165 L375,172 L390,175 L405,174 L422,166 L438,160 L450,165 L455,180 L450,195 L438,205 L422,210 L405,212 L390,208 L375,202 L360,198 L344,195 L328,198 L312,198 L300,196 L290,190 L285,178 L290,166 L305,160 L325,159 Z"
              fill="#F5F8F6" stroke="#ffffff" strokeWidth="2"/>
            <text x="372" y="190" fontSize="11" fill="#333333" textAnchor="middle" fontWeight="bold">ΣΤΕΡΕΑ ΕΛΛΑΔΑ</text>

            {/* Peloponnese (South) */}
            <path d="M302,213 L318,208 L332,210 L345,212 L358,215 L372,220 L382,227 L387,237 L390,250 L387,262 L375,272 L360,278 L345,280 L330,276 L318,270 L307,262 L298,250 L296,238 L298,225 L302,213 Z"
              fill="#73AA3C" stroke="#ffffff" strokeWidth="2"/>
            <text x="344" y="245" fontSize="11" fill="#ffffff" textAnchor="middle" fontWeight="bold">ΠΕΛΟΠΟΝΝΗΣΟΣ</text>

            {/* Ionian Islands with more detail */}
            {/* Corfu */}
            <path d="M270,120 L277,115 L285,118 L288,125 L285,132 L277,135 L270,132 L267,125 L270,120 Z"
              fill="#F5F8F6" stroke="#ffffff" strokeWidth="1.5"/>
            {/* Lefkada */}
            <path d="M280,165 L284,162 L288,165 L288,170 L284,173 L280,170 L280,165 Z"
              fill="#F5F8F6" stroke="#ffffff" strokeWidth="1.5"/>
            {/* Kefalonia */}
            <path d="M270,185 L277,182 L284,185 L286,192 L284,200 L277,203 L270,200 L268,192 L270,185 Z"
              fill="#F5F8F6" stroke="#ffffff" strokeWidth="1.5"/>
            {/* Zakynthos */}
            <path d="M275,222 L280,220 L285,222 L287,227 L285,232 L280,234 L275,232 L273,227 L275,222 Z"
              fill="#F5F8F6" stroke="#ffffff" strokeWidth="1.5"/>
            <text x="250" y="155" fontSize="10" fill="#333333" textAnchor="middle">ΙΟΝΙΑ ΝΗΣΙΑ</text>

            {/* Aegean Islands with more detail */}
            {/* Northern Aegean */}
            <path d="M485,110 L490,108 L495,110 L495,115 L490,117 L485,115 L485,110 Z"
              fill="#A0052D" stroke="#ffffff" strokeWidth="1.5"/>
            {/* Lesvos */}
            <path d="M510,90 L518,87 L526,90 L528,97 L526,104 L518,107 L510,104 L508,97 L510,90 Z"
              fill="#A0052D" stroke="#ffffff" strokeWidth="1.5"/>
            {/* Chios */}
            <path d="M515,130 L519,128 L523,130 L524,134 L523,138 L519,140 L515,138 L514,134 L515,130 Z"
              fill="#A0052D" stroke="#ffffff" strokeWidth="1.5"/>
            {/* Cyclades */}
            <path d="M455,180 L465,176 L475,180 L478,190 L475,200 L465,204 L455,200 L452,190 L455,180 Z"
              fill="#A0052D" stroke="#ffffff" strokeWidth="1.5"/>
            {/* Dodecanese */}
            <path d="M490,210 L496,208 L502,210 L504,215 L502,220 L496,222 L490,220 L488,215 L490,210 Z"
              fill="#A0052D" stroke="#ffffff" strokeWidth="1.5"/>
            {/* Rhodes */}
            <path d="M510,240 L515,238 L520,240 L521,245 L520,250 L515,252 L510,250 L509,245 L510,240 Z"
              fill="#A0052D" stroke="#ffffff" strokeWidth="1.5"/>
            <text x="490" y="165" fontSize="10" fill="#333333" textAnchor="middle">ΝΗΣΙΑ ΑΙΓΑΙΟΥ</text>

            {/* Crete with more detail */}
            <path d="M340,290 L360,286 L380,283 L400,282 L420,283 L440,286 L460,290 L475,295 L460,300 L440,304 L420,305 L400,304 L380,305 L360,304 L340,300 L325,295 L340,290 Z"
              fill="#A0052D" stroke="#ffffff" strokeWidth="2"/>
            <text x="400" y="295" fontSize="11" fill="#ffffff" textAnchor="middle" fontWeight="bold">ΚΡΗΤΗ</text>

            {/* Legend moved to bottom */}
            <g transform="translate(260, 360)">
              <rect x="0" y="0" width="18" height="18" fill="#73AA3C" stroke="#ffffff" strokeWidth="0.5"/>
              <text x="25" y="13" fontSize="10" fill="#333333">Υψηλός τζίρος</text>

              <rect x="100" y="0" width="18" height="18" fill="#F5F8F6" stroke="#ffffff" strokeWidth="0.5"/>
              <text x="125" y="13" fontSize="10" fill="#333333">Μέτριος τζίρος</text>

              <rect x="200" y="0" width="18" height="18" fill="#A0052D" stroke="#ffffff" strokeWidth="0.5"/>
              <text x="225" y="13" fontSize="10" fill="#333333">Χαμηλός τζίρος</text>
            </g>
          </g>
        </svg>
      </div>
      <div className="mt-4 text-sm text-gray-500">
        <p>H <span className="font-medium text-green-500">Μακεδονία & Θράκη</span> και η <span className="font-medium text-green-500">Πελοπόννησος</span> έχουν τον υψηλότερο τζίρο αυτό το μήνα. Τα νησιά του Αιγαίου και η Κρήτη παρουσιάζουν χαμηλότερη απόδοση.</p>
      </div>
    </>
  );
};

export default GeographicPerformance;
