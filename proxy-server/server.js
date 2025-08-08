const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// Import configuration and utilities
const { config, validateConfig } = require('./utils/config');

// Import middleware
const { extractAuthToken, requireAuth, handle401 } = require('./middleware/auth');
const { createApiProxy, handle401Response } = require('./middleware/proxy');
const { createStaticMiddleware, createSpaFallback, createHealthCheck } = require('./middleware/static');

// Import routes
const oauthRoutes = require('./routes/oauth');

// Validate configuration
try {
  validateConfig();
} catch (error) {
  console.error('❌ Configuration validation failed:', error.message);
  process.exit(1);
}

// Create Express app
const app = express();

// Trust proxy headers (if behind a reverse proxy)
app.set('trust proxy', 1);

// Basic middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// CORS configuration
app.use(cors({
  origin: [config.PROXY_URL],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
}));

// Request logging middleware
app.use((req, res, next) => {
  const requestId = req.headers['x-request-id'] || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  
  console.log(`[${requestId}] ${req.method} ${req.url} - ${req.ip}`);
  next();
});

// Auth middleware - extract and validate tokens
app.use(extractAuthToken);

// Health check endpoint
app.get('/health', createHealthCheck());

// OAuth2 routes
app.use('/', oauthRoutes);

// API proxy routes with authentication
app.use('/api/*', requireAuth, createApiProxy(), handle401Response);

// Static file serving
app.use(createStaticMiddleware());

// SPA fallback for client-side routing
app.use(createSpaFallback());

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    requestId: req.requestId
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error(`[${req.requestId || 'unknown'}] Error:`, error);
  
  // Handle 401 errors
  if (error.status === 401) {
    return handle401(error, req, res, next);
  }
  
  // Don't expose internal errors in production
  const isDevelopment = config.NODE_ENV === 'development';
  
  res.status(error.status || 500).json({
    error: error.name || 'Internal Server Error',
    message: isDevelopment ? error.message : 'An internal error occurred',
    requestId: req.requestId,
    ...(isDevelopment && { stack: error.stack })
  });
});

// Start HTTPS server
function startServer() {
  try {
    // Load SSL certificates
    const keyPath = path.resolve(config.SSL_KEY_PATH);
    const certPath = path.resolve(config.SSL_CERT_PATH);
    
    if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
      console.error('❌ SSL certificates not found!');
      console.log('Please run: npm run generate-certs');
      process.exit(1);
    }
    
    const httpsOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    };
    
    const server = https.createServer(httpsOptions, app);
    
    server.listen(config.PROXY_PORT, () => {
      console.log('🚀 NBG Merchant Insights Proxy Server Started');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📍 Server URL: ${config.PROXY_URL}`);
      console.log(`🔒 SSL: Enabled (${config.NODE_ENV} certificates)`);
      console.log(`🔐 OAuth2: ${config.NBG_OAUTH_ENABLED ? 'Enabled' : 'Disabled'}`);
      console.log(`🎯 Backend API: ${config.BACKEND_API_URL}`);
      console.log(`🌍 Environment: ${config.NODE_ENV}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
      console.log('Available endpoints:');
      console.log(`  🏠 Application: ${config.PROXY_URL}/`);
      console.log(`  🔑 Login:       ${config.PROXY_URL}/login`);
      console.log(`  📊 Health:      ${config.PROXY_URL}/health`);
      console.log(`  🔌 API Proxy:   ${config.PROXY_URL}/api/*`);
      console.log('');
      
      if (config.NODE_ENV === 'development') {
        console.log('⚠️  Development Mode: Self-signed certificates in use');
        console.log('   You may need to accept the security warning in your browser');
        console.log('');
      }
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('📤 Received SIGTERM, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });
    
    process.on('SIGINT', () => {
      console.log('📤 Received SIGINT, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Start the server
startServer();