Merchant Insights UI - Project Handover Documentation
👋 Welcome to the Merchant Insights UI Project!
Hey there! You're taking over a React-based business intelligence dashboard for NBG (National Bank of Greece). The project is in a solid state with most core infrastructure complete, but there are some key issues to resolve and features to implement.

🎯 PROJECT OVERVIEW
This is a merchant analytics dashboard that displays:

Key Metrics: Transaction volumes, revenue, customer data
Interactive Charts: Multiple visualization types with filtering
Competitive Analysis: Merchant performance vs competitors
Multi-language Support: English/Greek localization
Mobile-First Design: Responsive across all devices
Tech Stack: React + Vite, Tailwind CSS, Recharts, React Select, React i18next

✅ WHAT'S BEEN COMPLETED
1. Core Infrastructure (100% Done)
✅ JSON Configuration System: All metrics configurable via src/data/tabConfigs.json
✅ Component Architecture: Modular, reusable components
✅ Internationalization: Full English/Greek support
✅ Icon System: 12+ SVG icons with color mapping in src/utils/configHelpers.jsx
2. Dashboard Tab (95% Done)
✅ Unified Metric Cards: Single container showing merchant vs competitor
✅ Interactive Charts: Transactions, Revenue, Customers with dropdown controls
✅ Responsive Design: Works on desktop and mobile
✅ Table Overflow Fix: Tables stay within allocated space
3. Mobile Experience (90% Done)
✅ Floating Filter Button: Left when closed, right when open
✅ Smooth Animations: Filter sidebar slides from left
✅ No Horizontal Scroll: Fixed filter width issues
✅ Desktop/Mobile UX: Different interaction patterns
4. Layout & Styling (95% Done)
✅ Width Alignment: Tabs and content use consistent containers
✅ Professional Design: Compact, clean appearance
✅ Visual Hierarchy: Proper spacing and typography
🚨 CRITICAL ISSUE - FIX FIRST!
Mobile Metric Cards Are Too Cramped
Problem: On phone screens, the side-by-side merchant/competitor layout is unreadable:

Currency values like "2.345.679 €" barely fit
Percentage changes are squeezed
Touch targets too small
Location: src/components/dashboard/ComparisonMetricCard.jsx

Current Code:

<div className="grid grid-cols-2 gap-3">
  <div className="p-2.5 bg-blue-50/40 rounded-lg">
    <p className="text-xs font-medium text-gray-700">Έμπορος</p>
    <h2 className="text-xl font-bold text-gray-900">{merchantValue}</h2>
  </div>
  <div className="p-2.5 bg-gray-50/60 rounded-lg">
    <p className="text-xs font-medium text-gray-700">Ανταγωνισμός</p>

Suggested Solutions:

Stack vertically on mobile: Change to grid-cols-1 md:grid-cols-2
Reduce font sizes: Use text-lg instead of text-xl on mobile
Adjust padding: More breathing room for content
Responsive typography: Different sizes per breakpoint
Test on: iPhone 14 Pro (390px width) or similar modern phone

📋 REMAINING WORK (Priority Order)
1. Fix Mobile Layout (URGENT - 1-2 hours)
Resolve cramped metric cards on mobile
Ensure proper readability and touch targets
Test on actual mobile devices
2. Complete Revenue Tab (HIGH - 4-6 hours)
Copy Dashboard structure
Create revenue-specific metrics in tabConfigs.json
Implement revenue charts (similar to existing)
Files to modify:
src/data/tabConfigs.json
src/components/revenue/ (new folder)
src/App.jsx (add tab routing)
3. Demographics Tab (MEDIUM - 6-8 hours)
Customer-focused metrics and visualizations
Age groups, gender, location analytics
New charts needed: Pie charts, demographic breakdowns
4. Competition Tab (MEDIUM - 6-8 hours)
Market comparison features
Competitive positioning charts
Market share visualizations
5. Filter Integration (HIGH - 4-6 hours)
Make charts respond to sidebar filters
Update chart data based on selected filters
Key files: All chart components in src/components/charts/
6. Real Data Integration (LOW - 8-12 hours)
Replace mock data with API calls
Add loading states and error handling
Files: src/data/mockData.js → API service
🏗️ ARCHITECTURE GUIDE
Key Files You'll Work With:
src/
├── data/
│   ├── tabConfigs.json          # 🔥 METRIC CONFIGURATIONS
│   └── mockData.js              # Sample data
├── utils/
│   └── configHelpers.jsx        # Icons, formatting, config helpers
├── components/
│   ├── dashboard/

How to Add New Metrics:
Add to config (src/data/tabConfigs.json):
{
  "revenue": {
    "metrics": [
      {
        "id": "totalRevenue",
        "name": "revenue.totalRevenue",
        "supportsCompetition": true,
        "icon": "dollar-sign",
        "color": "green",
        "valueType": "currency",

Add translations (src/locales/en.json):
Use in component:
🛠️ DEVELOPMENT SETUP
Getting Started:
npm install
npm run dev
# Opens on http://localhost:5174
Key Commands:
Testing Mobile:
Use Chrome DevTools mobile simulation
Test on actual devices (iPhone/Android)
Pay attention to touch targets and readability
🎨 DESIGN SYSTEM
Colors:
Primary: Blue (bg-blue-600, text-blue-500)
Success: Green (text-green-600)
Error: Red (text-red-600)
Neutral: Gray shades
Spacing:
Container: max-w-7xl mx-auto px-4
Cards: p-3 (compact), p-4 (normal)
Gaps: gap-3 (tight), gap-4 (normal), gap-6 (loose)
Typography:
Titles: text-lg font-medium
Values: text-xl font-bold (desktop), text-lg font-bold (mobile)
Labels: text-xs font-medium text-gray-700
🐛 KNOWN ISSUES & GOTCHAS
1. File Extensions
Use .jsx for all React components
Import with .jsx extension: import './Component.jsx'
2. Mobile Testing
Always test on actual mobile devices
Chrome DevTools mobile simulation is good but not perfect
Pay attention to touch target sizes (minimum 44px)
3. Configuration System
All metrics come from tabConfigs.json
Icons must be defined in configHelpers.jsx
Translations required in both en.json and gr.json
4. Responsive Breakpoints
md: = 768px and up (tablet/desktop)
Mobile-first approach: base styles are mobile, add md: for larger screens
📞 NEED HELP?
Common Tasks:
Adding a new metric:

Add to tabConfigs.json
Add translation keys
Component automatically renders it
Creating a new chart:

Copy existing chart component
Modify data and chart type
Add dropdown controls for interactivity
Fixing mobile issues:

Test on actual mobile device first
Use responsive classes (grid-cols-1 md:grid-cols-2)
Adjust font sizes and padding for mobile
Resources:
Tailwind CSS: https://tailwindcss.com/docs
Recharts: https://recharts.org/en-US/
React Select: https://react-select.com/home
🎯 SUCCESS CRITERIA
Phase 1 (Immediate):
Mobile metric cards are readable and usable
No horizontal scrolling on any mobile screen
Touch targets are appropriately sized
Phase 2 (Short-term):
Revenue tab fully functional
Demographics tab implemented
Filters affect chart data
Phase 3 (Long-term):
Competition tab complete
Real API integration
Performance optimized
Good luck! The foundation is solid, and the configuration system makes adding new features straightforward. Focus on the mobile issue first, then build out the remaining tabs. The architecture is designed to scale, so each new tab should be faster to implement than the last.

Questions? Check the existing code patterns - they're consistent and well-structured. When in doubt, follow the Dashboard tab implementation as your template.

🚀 Happy coding!