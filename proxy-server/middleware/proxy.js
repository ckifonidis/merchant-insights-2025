const { createProxyMiddleware } = require('http-proxy-middleware');
const { config } = require('../utils/config');

/**
 * Create API proxy middleware with authentication injection
 */
function createApiProxy() {
  return createProxyMiddleware({
    target: config.BACKEND_API_URL,
    changeOrigin: true,
    secure: false, // Set to true in production with valid certs
    timeout: 30000,
    proxyTimeout: 30000,
    
    // Inject Authorization header for authenticated requests
    onProxyReq: (proxyReq, req, res) => {
      // Add Authorization header if user is authenticated
      if (req.isAuthenticated && req.authToken) {
        proxyReq.setHeader('Authorization', `Bearer ${req.authToken}`);
      }

      // Add request ID for tracing
      const requestId = req.headers['x-request-id'] || `proxy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      proxyReq.setHeader('X-Request-ID', requestId);

      // Log the proxied request
      console.log(`[${requestId}] Proxying ${req.method} ${req.url} to ${config.BACKEND_API_URL}${req.url.replace('/api', '')}`);
      
      // Handle request body for POST/PUT/PATCH
      if (req.body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },

    // Handle responses from backend
    onProxyRes: (proxyRes, req, res) => {
      const requestId = req.headers['x-request-id'] || 'unknown';
      
      console.log(`[${requestId}] Backend responded with ${proxyRes.statusCode}`);

      // Handle 401 Unauthorized responses
      if (proxyRes.statusCode === 401) {
        console.log(`[${requestId}] Received 401 from backend, will trigger auth flow`);
        
        // Set a custom header to indicate auth failure
        res.setHeader('X-Auth-Required', 'true');
      }

      // Add security headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
    },

    // Handle proxy errors
    onError: (err, req, res) => {
      const requestId = req.headers['x-request-id'] || 'unknown';
      console.error(`[${requestId}] Proxy error:`, err.message);
      
      if (!res.headersSent) {
        res.status(502).json({
          error: 'Bad Gateway',
          message: 'Failed to connect to backend service',
          requestId: requestId
        });
      }
    },

    // Custom error handling
    onProxyReqWs: (proxyReq, req, socket) => {
      // Handle WebSocket proxying if needed
      console.log('WebSocket proxying:', req.url);
    }
  });
}

/**
 * Middleware to handle 401 responses after proxy
 */
function handle401Response(req, res, next) {
  // Check if the response indicates auth is required
  if (res.getHeader('X-Auth-Required') === 'true') {
    // Clear auth cookie and redirect or return 401
    res.clearCookie('nbg_auth', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict'
    });

    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      // API request - return JSON response
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
        redirect: '/login'
      });
    } else {
      // Browser request - redirect to login
      return res.redirect('/login');
    }
  }
  
  next();
}

module.exports = {
  createApiProxy,
  handle401Response
};