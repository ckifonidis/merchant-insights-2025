import { useTranslation } from 'react-i18next';

const MonthlyTurnoverHeatmap = ({ filters }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-500 mb-2 w-full text-center">Μάιος 2025</div>
        <div className="flex flex-col items-center">
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {/* Calendar Header */}
            <div className="heatmap-cell empty">Κυρ</div>
            <div className="heatmap-cell empty">Δευ</div>
            <div className="heatmap-cell empty">Τρι</div>
            <div className="heatmap-cell empty">Τετ</div>
            <div className="heatmap-cell empty">Πεμ</div>
            <div className="heatmap-cell empty">Παρ</div>
            <div className="heatmap-cell empty">Σαβ</div>
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {/* Week 1 */}
            <div className="heatmap-cell empty"></div>
            <div className="heatmap-cell empty"></div>
            <div className="heatmap-cell empty"></div>
            <div className="heatmap-cell empty"></div>
            <div className="heatmap-cell medium">1</div>
            <div className="heatmap-cell high">2</div>
            <div className="heatmap-cell high">3</div>

            {/* Week 2 */}
            <div className="heatmap-cell low">4</div>
            <div className="heatmap-cell medium">5</div>
            <div className="heatmap-cell medium">6</div>
            <div className="heatmap-cell low">7</div>
            <div className="heatmap-cell medium">8</div>
            <div className="heatmap-cell high">9</div>
            <div className="heatmap-cell high">10</div>

            {/* Week 3 */}
            <div className="heatmap-cell low">11</div>
            <div className="heatmap-cell medium">12</div>
            <div className="heatmap-cell medium">13</div>
            <div className="heatmap-cell medium">14</div>
            <div className="heatmap-cell future">15</div>
            <div className="heatmap-cell future">16</div>
            <div className="heatmap-cell future">17</div>

            {/* Week 4 */}
            <div className="heatmap-cell future">18</div>
            <div className="heatmap-cell future">19</div>
            <div className="heatmap-cell future">20</div>
            <div className="heatmap-cell future">21</div>
            <div className="heatmap-cell future">22</div>
            <div className="heatmap-cell future">23</div>
            <div className="heatmap-cell future">24</div>

            {/* Week 5 */}
            <div className="heatmap-cell future">25</div>
            <div className="heatmap-cell future">26</div>
            <div className="heatmap-cell future">27</div>
            <div className="heatmap-cell future">28</div>
            <div className="heatmap-cell future">29</div>
            <div className="heatmap-cell future">30</div>
            <div className="heatmap-cell future">31</div>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center text-xs text-gray-500 mt-4">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-sm mr-1" style={{ backgroundColor: '#A0052D' }}></div>
          <span>Χαμηλός</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-sm mr-1" style={{ backgroundColor: '#F5F8F6' }}></div>
          <span>Μέτριος</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-sm mr-1" style={{ backgroundColor: '#73AA3C' }}></div>
          <span>Υψηλός</span>
        </div>
      </div>
      <div className="mt-4 text-sm text-gray-500">
        <p>Οι <span className="font-medium text-green-500">Παρασκευές και Σάββατα</span> είναι οι ημέρες με τον υψηλότερο τζίρο.</p>
      </div>
    </>
  );
};

export default MonthlyTurnoverHeatmap;
