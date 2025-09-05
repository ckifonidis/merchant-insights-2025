const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const analyticsRoutes = require('./routes/analytics');
const authRoutes = require('./routes/authorization');
const configRoutes = require('./routes/configuration');
const merchantRoutes = require('./routes/merchant');
const onboardingRoutes = require('./routes/onboarding');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));

// CORS configuration for development
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, postman, etc.)
    if (!origin) return callback(null, true);
    
    // Allow localhost on any port for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    console.log('CORS blocked origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs
});
app.use(limiter);

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`🔍 ${new Date().toISOString()} - ${req.method} ${req.path} from ${req.get('origin') || 'no-origin'}`);
  next();
});

// Add delay to simulate real API
app.use((req, res, next) => {
  const delay = Math.random() * 1000 + 500; // 500-1500ms delay
  setTimeout(next, delay);
});

// Routes
app.use('/api/ANALYTICS', analyticsRoutes);
app.use('/api/authorization', authRoutes);
app.use('/api/CONFIGURATION', configRoutes);
app.use('/api/merchant', merchantRoutes);
app.use('/api/onboarding', onboardingRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    endpoints: [
      '/api/ANALYTICS/QUERY',
      '/api/authorization/checkUserStatus',
      '/api/CONFIGURATION/ADMIN/GET',
      '/api/CONFIGURATION/MERCHANT/GET',
      '/api/configuration/user/get',
      '/api/merchant/get',
      '/api/onboarding/get-email',
      '/api/onboarding/submitSignupForm',
      '/api/onboarding/checkIfSubmitted'
    ]
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    exception: {
      message: 'Internal server error',
      code: 'MOCK_SERVER_ERROR'
    },
    executionTime: Math.random() * 1000
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    exception: {
      message: `Endpoint not found: ${req.method} ${req.originalUrl}`,
      code: 'NOT_FOUND'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Mock server running on http://localhost:${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
  console.log(`📈 Analytics endpoint: http://localhost:${PORT}/ANALYTICS/QUERY`);
});

module.exports = app;