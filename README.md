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
- **OAuth2 Integration** - Production-ready authentication via proxy server

### **Tech Stack**
- **Frontend**: React 19 + TypeScript, Vite 6, Tailwind CSS, Recharts
- **State Management**: Redux Toolkit with persistence
- **Charts**: Recharts with custom responsive components
- **Internationalization**: React i18next
- **Development**: Mock server with filter-aware data generation
- **Production**: HTTPS proxy server with OAuth2 authentication

## 🚀 Quick Start

Choose your setup based on your needs:

### 🔧 Development Mode (Frontend + Mock Server)
For frontend development with simulated data:

```bash
# Install all dependencies
npm install
npm run setup:mock-server

# Start development (frontend + mock server)
npm run dev
# Opens at http://localhost:5176 (app) + http://localhost:3001 (mock API)
```

### 🔒 Production Mode (Frontend + Proxy + Real API)
For production deployment with OAuth2 authentication:

```bash
# 1. Build the frontend application
npm run build

# 2. Setup proxy server
npm run proxy:setup

# 3. Configure environment (see Environment Setup below)
cp proxy-server/.env.example proxy-server/.env
# Edit proxy-server/.env with your configuration

# 4. Start proxy server
npm run proxy
# Opens at https://localhost:5443 (secure HTTPS with OAuth2)
```

### 🛠️ Development with Proxy (Optional)
For testing OAuth2 flow in development:

```bash
# Build frontend and start proxy in dev mode
npm run build
npm run proxy:dev
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

## 🏗️ Architecture & Setup

This project consists of three main components:

### **1. Frontend Application** (React + TypeScript)
- **Location**: `/src`
- **Port**: 5176 (development)
- **Build Output**: `/dist`

### **2. Mock Server** (Node.js + Express)
- **Location**: `/mock-server`
- **Port**: 3001
- **Purpose**: Development API with filter-aware data generation

### **3. Proxy Server** (Node.js + Express + OAuth2)
- **Location**: `/proxy-server`
- **Port**: 5443 (HTTPS)
- **Purpose**: Production authentication and API proxying

## 📁 Project Structure

```
merchant-insights-2025/
├── src/                 # Frontend React application
│   ├── components/      # UI components organized by feature
│   │   ├── dashboard/   # Dashboard tab components
│   │   ├── revenue/     # Revenue tab components  
│   │   ├── demographics/# Demographics tab components
│   │   ├── competition/ # Competition tab components
│   │   ├── layout/      # Navigation, header, filter sidebar
│   │   └── ui/          # Reusable UI components and charts
│   ├── store/           # Redux store with analytics and filters
│   ├── services/        # API service layer with transformations
│   ├── hooks/           # Custom hooks for data fetching
│   ├── locales/         # English and Greek translations
│   └── types/           # TypeScript type definitions
├── mock-server/         # Development API server
│   ├── routes/          # API endpoint handlers
│   ├── utils/           # Mock data generation with filter support
│   └── server.js        # Express server with CORS and middleware
├── proxy-server/        # Production OAuth2 proxy
│   ├── routes/          # OAuth2 endpoints
│   ├── middleware/      # Authentication and proxy middleware
│   ├── utils/           # SSL certificates and crypto utilities
│   └── server.js        # HTTPS server with OAuth2 flow
└── dist/                # Built frontend (generated by npm run build)
```

## ⚙️ Environment Setup

### Frontend Environment Variables

Create `.env` in the project root (optional - has defaults):

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api
VITE_USE_MOCK_SERVER=true

# Development Settings
VITE_DEV_MODE=true
```

### Proxy Server Environment Variables

**Required**: Copy and configure the proxy server environment:

```bash
cp proxy-server/.env.example proxy-server/.env
```

Edit `proxy-server/.env`:

```env
# Server Configuration
NODE_ENV=development
PROXY_PORT=5443
PROXY_URL=https://localhost:5443

# Backend API Configuration
BACKEND_API_URL=http://localhost:3001/api

# OAuth2 Configuration (Required for production)
OAUTH_AUTHORITY_URL=https://my.nbg.gr/identity
OAUTH_CLIENT_ID=your-client-id-from-nbg
OAUTH_CLIENT_SECRET=your-client-secret-from-nbg
OAUTH_REDIRECT_URI=https://localhost:5443/signin-nbg/

# Security Configuration (Generate secure keys for production)
COOKIE_ENCRYPTION_KEY=your-32-character-encryption-key-here
SESSION_SECRET=your-session-secret-here

# SSL Configuration
SSL_KEY_PATH=./certs/localhost-key.pem
SSL_CERT_PATH=./certs/localhost.pem

# Feature Flags
NBG_OAUTH_ENABLED=true  # Set to false to disable OAuth for testing
```

### Mock Server Environment

The mock server requires no additional configuration and runs on port 3001 by default.

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

## 🚀 Deployment Guide

### **Development Deployment**
```bash
# Start development environment (frontend + mock server)
npm run dev
```
- Frontend: http://localhost:5176
- Mock API: http://localhost:3001
- No authentication required

### **Production Deployment**
```bash
# 1. Install all dependencies
npm install
npm run setup:mock-server
npm run proxy:setup

# 2. Build frontend
npm run build

# 3. Configure proxy server environment
cp proxy-server/.env.example proxy-server/.env
# Edit proxy-server/.env with production OAuth2 credentials

# 4. Start production server
npm run proxy
```
- Production App: https://localhost:5443
- OAuth2 authentication enabled
- HTTPS with SSL certificates
- API proxying to backend

### **Available Scripts**

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend + mock server |
| `npm run dev:app-only` | Start frontend only |
| `npm run dev:api-only` | Start mock server only |
| `npm run build` | Build frontend for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript checks |
| `npm run check` | Run both lint and typecheck |
| `npm run setup:mock-server` | Install mock server dependencies |
| `npm run test:mock-server` | Test mock server endpoints |
| `npm run proxy:setup` | Setup proxy server + generate SSL certs |
| `npm run proxy` | Start production proxy server |
| `npm run proxy:dev` | Start proxy server in dev mode |
| `npm run proxy:test` | Test proxy server functionality |

## 🔧 Development

### **Documentation Structure**
- **`README.md`** - 📋 **Main setup and deployment guide** (this file)
- **`CLAUDE.md`** - 📋 **Complete architecture and implementation guide**
  - Project overview and implementation status
  - Complete metric mapping with API integration status
  - Competition tab technical specifications  
  - Original UI requirements reference
  - Architecture patterns and guidelines
- **`mock-server/CLAUDE.md`** - Mock server comprehensive documentation
- **`proxy-server/README.md`** - Proxy server detailed setup guide
- **`archive/`** - Historical documentation (planning docs, implemented fixes)

### **Key Technical Files**
- `src/store/slices/filtersSlice.ts` - Filter state management (TypeScript)
- `src/services/filterService.ts` - Filter transformations (TypeScript)
- `src/hooks/useNormalizedData.ts` - Data fetching hooks (TypeScript)
- `mock-server/utils/filterAwareDataGenerator.js` - Mock data with filters
- `proxy-server/server.js` - OAuth2 proxy with authentication

### **Environment Configurations**

#### Development
- **Frontend**: Vite dev server with HMR
- **API**: Mock server with realistic delays
- **No Authentication**: Direct access for development
- **Hot Reload**: Auto-restart on file changes

#### Production
- **Frontend**: Static files served via HTTPS proxy
- **API**: Real backend APIs via proxy
- **OAuth2 Authentication**: NBG Identity Server integration
- **HTTPS**: SSL certificates for secure communication

### **Testing & Quality**
```bash
# Code quality checks
npm run check          # TypeScript + ESLint
npm run typecheck      # TypeScript only
npm run lint          # ESLint only

# Component testing
npm run test:mock-server    # Mock API endpoints
npm run proxy:test          # Proxy server functionality
```

## 🔐 Security Features

### **Development Security**
- CORS configuration for localhost
- Rate limiting (1000 requests/15min)
- Request logging and monitoring
- Helmet.js security headers

### **Production Security**
- OAuth2 authorization code flow
- AES-256-GCM encrypted cookies
- CSRF protection with state/nonce validation
- Comprehensive security headers
- Automatic token injection for API calls
- Session management with expiration

### **SSL/TLS**
- Self-signed certificates for development
- Certificate generation utility included
- Production-ready certificate support
- HTTPS enforced in production mode

The project is ready for both development and production deployment with complete authentication, filtering, and responsive design.
