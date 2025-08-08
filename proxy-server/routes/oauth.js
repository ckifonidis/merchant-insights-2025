const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { generateSecureNonce, generateSecureState } = require('../utils/crypto');
const { setAuthCookie, clearAuthCookie } = require('../middleware/auth');
const { config } = require('../utils/config');

const router = express.Router();

// Temporary storage for OAuth state/nonce (in production, use Redis or similar)
const oauthSessions = new Map();

/**
 * GET /login - Start OAuth2 authorization code flow
 */
router.get('/login', (req, res) => {
  try {
    if (!config.NBG_OAUTH_ENABLED) {
      return res.status(503).json({ 
        error: 'OAuth disabled',
        message: 'OAuth2 authentication is currently disabled' 
      });
    }

    const state = generateSecureState();
    const nonce = generateSecureNonce();
    const sessionId = uuidv4();

    // Store state and nonce temporarily
    oauthSessions.set(sessionId, {
      state,
      nonce,
      createdAt: Date.now(),
      originalUrl: req.query.returnUrl || '/'
    });

    // Clean up old sessions (older than 10 minutes)
    for (const [key, session] of oauthSessions.entries()) {
      if (Date.now() - session.createdAt > 10 * 60 * 1000) {
        oauthSessions.delete(key);
      }
    }

    // Build authorization URL
    const authUrl = new URL(config.OAUTH_AUTH_URL);
    authUrl.searchParams.set('client_id', config.OAUTH_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', config.OAUTH_REDIRECT_URI);
    authUrl.searchParams.set('response_type', 'code id_token');
    authUrl.searchParams.set('scope', 'promotion-engine-api-v1 openid');
    authUrl.searchParams.set('state', `${sessionId}:${state}`);
    authUrl.searchParams.set('nonce', nonce);

    console.log(`Redirecting to OAuth provider: ${authUrl.toString()}`);
    res.redirect(authUrl.toString());

  } catch (error) {
    console.error('Login initiation failed:', error);
    res.status(500).json({ 
      error: 'Login failed',
      message: 'Failed to initiate OAuth2 flow' 
    });
  }
});

/**
 * GET /signin-nbg/ - OAuth2 callback handler
 * Handles both query parameters and URL fragments
 */
router.get('/signin-nbg/', async (req, res) => {
  try {
    if (!config.NBG_OAUTH_ENABLED) {
      return res.status(503).json({ 
        error: 'OAuth disabled',
        message: 'OAuth2 authentication is currently disabled' 
      });
    }

    // Check if we have query parameters (traditional flow)
    let { code, state: stateParam, id_token, error: oauthError } = req.query;

    console.log('OAuth callback received:', {
      hasCode: !!code,
      hasState: !!stateParam,
      hasIdToken: !!id_token,
      hasError: !!oauthError,
      url: req.url,
      referer: req.get('referer')
    });
    
    // If no query parameters, serve a page that handles URL fragments
    if (!code && !stateParam && !oauthError) {
      console.log('No query parameters found, serving fragment handler page');
      // Serve a page that will extract parameters from URL fragment and resubmit
      return res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Processing OAuth Response...</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        .spinner { display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #007B85; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <h2>Processing OAuth Response...</h2>
    <div class="spinner"></div>
    <p>Please wait while we complete your authentication.</p>
    
    <script>
        // Extract parameters from URL fragment
        const fragment = window.location.hash.substring(1);
        
        console.log('Fragment handler:', {
            fullUrl: window.location.href,
            fragment: fragment,
            hasFragment: !!fragment
        });
        
        if (fragment && fragment.length > 0) {
            // Parse fragment to ensure we have required parameters
            const params = new URLSearchParams(fragment);
            const code = params.get('code');
            const state = params.get('state');
            
            console.log('Parsed fragment parameters:', {
                hasCode: !!code,
                hasState: !!state,
                codeLength: code ? code.length : 0
            });
            
            if (code && state) {
                // Convert fragment to query string and redirect
                const newUrl = window.location.pathname + '?' + fragment;
                console.log('Redirecting to:', newUrl);
                window.location.replace(newUrl);
            } else {
                console.error('Missing required OAuth parameters in fragment');
                setTimeout(() => {
                    window.location.href = '/login?error=missing_oauth_params';
                }, 2000);
            }
        } else {
            // No fragment found, might be an error
            console.error('No OAuth response data found in URL fragment');
            setTimeout(() => {
                window.location.href = '/login?error=no_response_data';
            }, 2000);
        }
    </script>
</body>
</html>
      `);
    }

    // Handle OAuth errors
    if (oauthError) {
      console.error('OAuth callback error:', oauthError);
      return res.redirect('/login?error=oauth_error');
    }

    if (!code || !stateParam) {
      console.error('Missing code or state in OAuth callback');
      return res.redirect('/login?error=invalid_callback');
    }

    // Parse state
    const [sessionId, expectedState] = stateParam.split(':');
    if (!sessionId || !expectedState) {
      console.error('Invalid state format');
      return res.redirect('/login?error=invalid_state');
    }

    // Validate state and nonce
    const session = oauthSessions.get(sessionId);
    if (!session) {
      console.error('OAuth session not found or expired');
      return res.redirect('/login?error=session_expired');
    }

    if (session.state !== expectedState) {
      console.error('State mismatch in OAuth callback');
      oauthSessions.delete(sessionId);
      return res.redirect('/login?error=state_mismatch');
    }

    // Exchange authorization code for access token
    console.log('🔄 Exchanging authorization code for access token...');
    console.log('📤 Token request details:', {
      url: config.OAUTH_TOKEN_URL,
      grant_type: 'authorization_code',
      client_id: config.OAUTH_CLIENT_ID,
      client_secret_present: !!config.OAUTH_CLIENT_SECRET,
      code_length: code ? code.length : 0,
      code_preview: code ? `${code.substring(0, 20)}...` : 'MISSING',
      redirect_uri: config.OAUTH_REDIRECT_URI
    });
    
    const tokenResponse = await axios.post(config.OAUTH_TOKEN_URL, {
      grant_type: 'authorization_code',
      client_id: config.OAUTH_CLIENT_ID,
      client_secret: config.OAUTH_CLIENT_SECRET,
      code: code,
      redirect_uri: config.OAUTH_REDIRECT_URI
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 10000
    });

    console.log('✅ Token exchange response received!');
    console.log('📈 Response status:', tokenResponse.status);
    console.log('📋 Response headers:', {
      'content-type': tokenResponse.headers['content-type'],
      'set-cookie': tokenResponse.headers['set-cookie'] ? 'present' : 'none'
    });
    
    const tokenData = tokenResponse.data;
    console.log('🎫 Token data analysis:', {
      has_access_token: !!tokenData.access_token,
      access_token_length: tokenData.access_token ? tokenData.access_token.length : 0,
      access_token_preview: tokenData.access_token ? `${tokenData.access_token.substring(0, 30)}...` : 'MISSING',
      has_refresh_token: !!tokenData.refresh_token,
      has_id_token: !!tokenData.id_token,
      id_token_length: tokenData.id_token ? tokenData.id_token.length : 0,
      expires_in: tokenData.expires_in,
      scope: tokenData.scope,
      token_type: tokenData.token_type,
      full_response_keys: Object.keys(tokenData)
    });
    
    if (!tokenData.access_token) {
      console.error('❌ No access token received from OAuth provider');
      console.error('🔍 Full token response for debugging:', tokenData);
      return res.redirect('/login?error=no_token');
    }

    // Prepare token data for storage
    const authData = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || null,
      id_token: tokenData.id_token || id_token,
      expires_at: tokenData.expires_in ? Math.floor(Date.now() / 1000) + tokenData.expires_in : null,
      scope: tokenData.scope || 'promotion-engine-api-v1 openid'
    };

    console.log('🔐 Preparing auth data for cookie storage:', {
      has_access_token: !!authData.access_token,
      access_token_length: authData.access_token ? authData.access_token.length : 0,
      has_refresh_token: !!authData.refresh_token,
      has_id_token: !!authData.id_token,
      expires_at: authData.expires_at,
      expires_at_date: authData.expires_at ? new Date(authData.expires_at * 1000).toISOString() : 'never',
      scope: authData.scope
    });

    // Store encrypted token in cookie
    console.log('🍪 Attempting to set authentication cookie...');
    const cookieSet = setAuthCookie(res, authData);
    console.log('🍪 Cookie setting result:', cookieSet ? 'SUCCESS' : 'FAILED');
    
    if (!cookieSet) {
      console.error('❌ Failed to set authentication cookie');
      return res.redirect('/login?error=cookie_error');
    }

    // Clean up OAuth session
    const originalUrl = session.originalUrl;
    oauthSessions.delete(sessionId);

    console.log('🎉 OAuth authentication successful!');
    console.log('🔄 Redirecting to original URL:', originalUrl);
    console.log('📋 Final response headers before redirect:');
    console.log('   Set-Cookie:', res.getHeaders()['set-cookie'] || 'NOT SET');
    
    res.redirect(originalUrl);

  } catch (error) {
    console.error('OAuth callback processing failed:', error);
    
    if (error.response) {
      console.error('Token exchange error:', error.response.status, error.response.data);
    }
    
    res.redirect('/login?error=callback_failed');
  }
});

/**
 * POST/GET /logout - Clear auth cookie and redirect
 */
router.all('/logout', (req, res) => {
  clearAuthCookie(res);
  
  const logoutUrl = req.query.returnUrl || '/login';
  console.log('User logged out, redirecting to:', logoutUrl);
  res.redirect(logoutUrl);
});

/**
 * GET /auth/status - Check authentication status
 */
router.get('/auth/status', (req, res) => {
  if (req.isAuthenticated) {
    res.json({
      authenticated: true,
      expires_at: req.tokenData?.expires_at || null,
      scope: req.tokenData?.scope || null
    });
  } else {
    res.json({
      authenticated: false
    });
  }
});

module.exports = router;