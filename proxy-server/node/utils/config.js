require('dotenv').config();

const config = {
  // Server Configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  PROXY_PORT: parseInt(process.env.PROXY_PORT) || 5443,
  PROXY_URL: process.env.PROXY_URL || 'https://localhost:5443',

  // Backend API Configuration
  BACKEND_API_URL: process.env.BACKEND_API_URL || 'http://localhost:3001',

  // OAuth2 Configuration
  OAUTH_AUTHORITY_URL: process.env.OAUTH_AUTHORITY_URL || 'https://my.nbg.gr/identity',
  OAUTH_CLIENT_ID: process.env.OAUTH_CLIENT_ID || 'E650063E-5086-4D97-93F0-414B6B581C82',
  OAUTH_CLIENT_SECRET: process.env.OAUTH_CLIENT_SECRET || '31514F5B-D0E2-440B-80AF-7C37E13AEA9A',
  OAUTH_REDIRECT_URI: process.env.OAUTH_REDIRECT_URI || 'https://localhost:5443/signin-nbg/',

  // Security Configuration
  COOKIE_ENCRYPTION_KEY: process.env.COOKIE_ENCRYPTION_KEY || 'default-dev-key-change-in-production-123',
  SESSION_SECRET: process.env.SESSION_SECRET || 'default-session-secret-change-in-production',

  // SSL Configuration
  SSL_KEY_PATH: process.env.SSL_KEY_PATH || './certs/localhost-key.pem',
  SSL_CERT_PATH: process.env.SSL_CERT_PATH || './certs/localhost.pem',

  // Feature Flags
  NBG_OAUTH_ENABLED: process.env.NBG_OAUTH_ENABLED === 'true' || true,

  // Derived URLs
  get OAUTH_TOKEN_URL() {
    return `${this.OAUTH_AUTHORITY_URL}/connect/token`;
  },
  
  get OAUTH_AUTH_URL() {
    return `${this.OAUTH_AUTHORITY_URL}/connect/authorize`;
  },

  get OAUTH_LOGOUT_URL() {
    return `${this.OAUTH_AUTHORITY_URL}/connect/endsession`;
  }
};

// Validation
function validateConfig() {
  const required = [
    'PROXY_PORT',
    'BACKEND_API_URL',
    'COOKIE_ENCRYPTION_KEY'
  ];

  const missing = required.filter(key => !config[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (config.COOKIE_ENCRYPTION_KEY.length < 32) {
    throw new Error('COOKIE_ENCRYPTION_KEY must be at least 32 characters long');
  }

  if (config.NBG_OAUTH_ENABLED) {
    const oauthRequired = [
      'OAUTH_AUTHORITY_URL',
      'OAUTH_CLIENT_ID', 
      'OAUTH_CLIENT_SECRET',
      'OAUTH_REDIRECT_URI'
    ];

    const missingOauth = oauthRequired.filter(key => !config[key]);
    if (missingOauth.length > 0) {
      throw new Error(`Missing required OAuth configuration: ${missingOauth.join(', ')}`);
    }
  }
}

module.exports = { config, validateConfig };