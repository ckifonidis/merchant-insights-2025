# NBG Merchant Insights Dashboard

**React-based business intelligence dashboard for NBG (National Bank of Greece)**

## ✅ Project Status: FEATURE COMPLETE

### **Implemented Features (100%)**
- **Dashboard Tab** - Transaction volumes, revenue metrics, customer analytics
- **Revenue Tab** - Revenue breakdown, Go For More metrics, channel analysis  
- **Demographics Tab** - Customer demographics, shopping interests, behavioral analytics
- **Competition Tab** - Competitive analysis with dual calendar heatmaps
- **Filter Integration** - Complete filtering system with persistence
- **Mobile Experience** - Fully responsive design across all devices
- **Internationalization** - English/Greek localization

### **Tech Stack**
- **Frontend**: React 19, Vite 6, Tailwind CSS, Recharts
- **State Management**: Redux Toolkit with persistence
- **Charts**: Recharts with custom responsive components
- **Internationalization**: React i18next
- **Development**: Mock server with filter-aware data generation

## 🚀 Quick Start

### Development Setup
```bash
# Install dependencies
npm install

# Start development (app + mock server)
npm run dev
# Opens at http://localhost:5176 (app) + http://localhost:3001 (API)

# Start app only
npm run dev:app-only

# Start mock server only
npm run dev:api-only
```

### Mock Server Setup
```bash
# Install mock server dependencies
npm run setup:mock-server

# Test mock server endpoints
npm run test:mock-server
```

## 🎯 Filter Integration

### **Supported Filters**
- **Gender**: Male/Female selection  
- **Age Groups**: Generation-based filtering (Gen Z, Millennials, Gen X, Boomers)
- **Shopping Interests**: Multiple interest selection (SHOPINT1-15)
- **Geographic Location**: Municipality and region-based filtering
- **Channel**: Physical stores vs E-commerce
- **Date Range**: Integrated timeline functionality

### **Filter Features**
- **Persistence**: Filters saved across browser sessions
- **Smart Refresh**: Only active tab refreshes when filters change
- **Combined Filtering**: All filters applied together
- **Insufficient Data Handling**: Graceful fallback for highly filtered data
- **Competition Data**: Same filters applied to both merchant and competition

## 📁 Project Structure

```
src/
├── components/           # UI components organized by feature
│   ├── dashboard/       # Dashboard tab components
│   ├── revenue/         # Revenue tab components  
│   ├── demographics/    # Demographics tab components
│   ├── competition/     # Competition tab components
│   ├── layout/          # Navigation, header, filter sidebar
│   └── ui/              # Reusable UI components and charts
├── store/               # Redux store with analytics and filters
├── services/            # API service layer with transformations
├── hooks/               # Custom hooks for data fetching
├── locales/             # English and Greek translations
└── data/                # Configurations and mock data

mock-server/
├── routes/              # API endpoint handlers
└── utils/               # Mock data generation with filter support
```

## 📊 Key Features

### **Advanced Analytics**
- Revenue trends and breakdowns
- Customer demographic analysis
- Shopping behavior insights
- Competitive benchmarking
- Geographic performance mapping

### **Interactive Visualizations**
- Responsive bar charts, line charts, pie charts
- Calendar heatmaps for temporal analysis
- Interactive table views with sorting
- Hover tooltips with detailed information

### **Mobile-First Design**
- Optimized for mobile devices (390px+)
- Responsive grid layouts
- Touch-friendly interactions
- Collapsible filter sidebar

## 🔧 Development

### **Key Files**
- `CLAUDE.md` - Comprehensive project documentation
- `ARCHITECTURE.md` - Technical implementation details
- `API_PLANNING.md` - API integration specifications
- `src/store/slices/filtersSlice.js` - Filter state management
- `src/services/filterMappingService.js` - Filter transformations
- `mock-server/utils/filterAwareDataGenerator.js` - Mock data with filters

### **Next Steps**
- **Real API Integration** - Replace mock server with production endpoints

The project is ready for production deployment with complete filter integration and responsive design.
