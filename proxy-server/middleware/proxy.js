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

      // Store request start time
      req.proxyStartTime = Date.now();

      const targetUrl = `${config.BACKEND_API_URL}${req.url.replace('/api', '')}`;
      
      // Enhanced request logging
      console.log('');
      console.log('🚀 ==================== PROXY REQUEST ====================');
      console.log(`[${requestId}] ${req.method} ${req.url}`);
      console.log(`[${requestId}] Target: ${targetUrl}`);
      console.log(`[${requestId}] Auth: ${req.isAuthenticated ? 'Authenticated' : 'Not authenticated'}`);
      
      // Log request headers (excluding sensitive ones)
      const sanitizedHeaders = { ...req.headers };
      delete sanitizedHeaders.authorization;
      delete sanitizedHeaders.cookie;
      console.log(`[${requestId}] Headers:`, JSON.stringify(sanitizedHeaders, null, 2));
      
      // Handle and log request body for POST/PUT/PATCH
      if (req.body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
        const bodyData = JSON.stringify(req.body);
        console.log(`[${requestId}] Request Body:`, JSON.stringify(req.body, null, 2));
        
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      } else {
        console.log(`[${requestId}] Request Body: [No body]`);
      }
      
      console.log('========================================================');
    },

    // Handle responses from backend
    onProxyRes: (proxyRes, req, res) => {
      const requestId = req.headers['x-request-id'] || 'unknown';
      const duration = req.proxyStartTime ? Date.now() - req.proxyStartTime : 'unknown';
      
      // Enhanced response logging
      console.log('');
      console.log('📥 ==================== PROXY RESPONSE ===================');
      console.log(`[${requestId}] Status: ${proxyRes.statusCode} ${proxyRes.statusMessage}`);
      console.log(`[${requestId}] Duration: ${duration}ms`);
      
      // Log response headers (excluding sensitive ones)
      const sanitizedResponseHeaders = { ...proxyRes.headers };
      delete sanitizedResponseHeaders['set-cookie'];
      console.log(`[${requestId}] Response Headers:`, JSON.stringify(sanitizedResponseHeaders, null, 2));

      // Capture response body for logging
      let responseBody = '';
      const originalWrite = res.write;
      const originalEnd = res.end;

      proxyRes.on('data', (chunk) => {
        responseBody += chunk.toString();
      });

      proxyRes.on('end', () => {
        try {
          // Try to parse and pretty-print JSON responses
          if (proxyRes.headers['content-type']?.includes('application/json') && responseBody) {
            const parsedBody = JSON.parse(responseBody);
            console.log(`[${requestId}] Response Body:`, JSON.stringify(parsedBody, null, 2));
          } else if (responseBody) {
            // Log first 500 characters for non-JSON responses
            const truncatedBody = responseBody.length > 500 ? 
              responseBody.substring(0, 500) + '... [truncated]' : 
              responseBody;
            console.log(`[${requestId}] Response Body:`, truncatedBody);
          } else {
            console.log(`[${requestId}] Response Body: [Empty]`);
          }
        } catch (error) {
          // If JSON parsing fails, log raw response (truncated)
          const truncatedBody = responseBody.length > 500 ? 
            responseBody.substring(0, 500) + '... [truncated]' : 
            responseBody;
          console.log(`[${requestId}] Response Body (raw):`, truncatedBody);
        }
        
        console.log('========================================================');
        console.log('');
      });

      // Handle 401 Unauthorized responses
      if (proxyRes.statusCode === 401) {
        console.log(`[${requestId}] ⚠️  Received 401 from backend, will trigger auth flow`);
        
        // Set a custom header to indicate auth failure
        res.setHeader('X-Auth-Required', 'true');
      }

      // Log other error status codes
      if (proxyRes.statusCode >= 400) {
        console.log(`[${requestId}] ❌ Error response: ${proxyRes.statusCode} ${proxyRes.statusMessage}`);
      } else {
        console.log(`[${requestId}] ✅ Success response: ${proxyRes.statusCode}`);
      }

      // Add security headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
    },

    // Handle proxy errors
    onError: (err, req, res) => {
      const requestId = req.headers['x-request-id'] || 'unknown';
      const duration = req.proxyStartTime ? Date.now() - req.proxyStartTime : 'unknown';
      
      // Enhanced error logging
      console.log('');
      console.log('💥 ===================== PROXY ERROR =====================');
      console.log(`[${requestId}] Error: ${err.message}`);
      console.log(`[${requestId}] Duration: ${duration}ms`);
      console.log(`[${requestId}] Error Code: ${err.code || 'Unknown'}`);
      console.log(`[${requestId}] Target: ${config.BACKEND_API_URL}${req.url.replace('/api', '')}`);
      console.log(`[${requestId}] Stack:`, err.stack);
      console.log('========================================================');
      console.log('');
      
      if (!res.headersSent) {
        res.status(502).json({
          error: 'Bad Gateway',
          message: 'Failed to connect to backend service',
          requestId: requestId,
          details: process.env.NODE_ENV === 'development' ? err.message : undefined
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