const { CookieEncryption } = require('../utils/crypto');
const { config } = require('../utils/config');

const cookieEncryption = new CookieEncryption(config.COOKIE_ENCRYPTION_KEY);

/**
 * Middleware to extract and decrypt auth token from cookie
 */
function extractAuthToken(req, res, next) {
  try {
    const authCookie = req.cookies['nbg_auth'];
    
    if (!authCookie) {
      req.authToken = null;
      req.isAuthenticated = false;
      return next();
    }

    const decryptedData = cookieEncryption.decrypt(authCookie);
    
    // Check if token is expired
    if (decryptedData.expires_at && Date.now() > decryptedData.expires_at * 1000) {
      // Clear expired cookie
      res.clearCookie('nbg_auth', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict'
      });
      req.authToken = null;
      req.isAuthenticated = false;
      return next();
    }

    req.authToken = decryptedData.access_token;
    req.tokenData = decryptedData;
    req.isAuthenticated = true;
    
    next();
  } catch (error) {
    console.error('Auth token extraction failed:', error.message);
    
    // Clear invalid cookie
    res.clearCookie('nbg_auth', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict'
    });
    
    req.authToken = null;
    req.isAuthenticated = false;
    next();
  }
}

/**
 * Middleware to require authentication
 */
function requireAuth(req, res, next) {
  if (!config.NBG_OAUTH_ENABLED) {
    return next(); // Skip auth if OAuth is disabled
  }

  if (!req.isAuthenticated) {
    console.log("Is Authenticated: " + req.isAuthenticated);
    console.log("Request Path: " + req.path);
    console.log("Original URL: " + req.originalUrl);
    console.log("Request URL: " + req.url);
    
    // For API requests, return 401 instead of redirect
    // Use originalUrl to check the original request path before any rewriting
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
        requiresLogin: true
      });
    }
    
    // For browser requests, redirect to login
    return res.redirect('/login');
  }
  
  next();
}

/**
 * Store encrypted auth token in cookie
 */
function setAuthCookie(res, tokenData) {
  try {
    console.log('🔐 setAuthCookie: Starting cookie encryption process...');
    console.log('📝 Input token data:', {
      has_access_token: !!tokenData.access_token,
      access_token_length: tokenData.access_token ? tokenData.access_token.length : 0,
      has_refresh_token: !!tokenData.refresh_token,
      has_id_token: !!tokenData.id_token,
      expires_at: tokenData.expires_at,
      scope: tokenData.scope
    });
    
    // Optimize cookie data - store only essential information
    const optimizedData = {
      access_token: tokenData.access_token,
      expires_at: tokenData.expires_at
      // Remove refresh_token, id_token, and scope to reduce size
      // If needed later, these can be stored separately or retrieved from the access token
    };
    
    console.log('🔒 Attempting to encrypt optimized token data...');
    const encryptedToken = cookieEncryption.encrypt(optimizedData);
    console.log('✅ Token encryption successful!');
    console.log('📏 Encrypted token length:', encryptedToken.length);
    console.log('🔍 Encrypted token preview:', encryptedToken.substring(0, 50) + '...');
    
    // Check if cookie is still too large
    if (encryptedToken.length > 4000) {
      console.warn('⚠️ Cookie is still large:', encryptedToken.length, 'characters');
      throw new Error(`Cookie too large: ${encryptedToken.length} characters (max 4096)`);
    }
    
    console.log('🍪 Setting cookie with options:', {
      name: 'nbg_auth',
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: '24 hours (86400000ms)'
    });
    
    res.cookie('nbg_auth', encryptedToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    console.log('✅ Cookie set successfully!');
    console.log('📋 Response headers after setting cookie:');
    const headers = res.getHeaders();
    console.log('   Set-Cookie header:', headers['set-cookie'] || 'NOT FOUND');
    
    return true;
  } catch (error) {
    console.error('❌ Failed to set auth cookie:', error.message);
    console.error('🔍 Full error:', error);
    console.error('📋 Error stack:', error.stack);
    return false;
  }
}

/**
 * Clear auth cookie
 */
function clearAuthCookie(res) {
  res.clearCookie('nbg_auth', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
  });
}

/**
 * Handle 401 responses from backend
 */
function handle401(error, req, res, next) {
  if (error && error.status === 401) {
    console.log('Received 401 from backend, clearing auth and redirecting to login');
    clearAuthCookie(res);
    
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Authentication required',
        redirect: '/login'
      });
    }
    
    return res.redirect('/login');
  }
  
  next(error);
}

module.exports = {
  extractAuthToken,
  requireAuth,
  setAuthCookie,
  clearAuthCookie,
  handle401
};