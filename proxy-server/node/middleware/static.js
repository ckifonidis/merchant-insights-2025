const express = require('express');
const path = require('path');
const fs = require('fs');

/**
 * Create static file serving middleware with SPA fallback
 */
function createStaticMiddleware() {
  const distPath = path.join(__dirname, '../../../dist');
  
  // Check if dist directory exists
  if (!fs.existsSync(distPath)) {
    console.warn(`Warning: React build directory not found at ${distPath}`);
    console.warn('Please run "npm run build" in the main project directory first.');
  }

  // Serve static files with caching
  const staticMiddleware = express.static(distPath, {
    maxAge: '1y', // Cache static assets for 1 year
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      // Set different cache headers for different file types
      if (path.endsWith('.html')) {
        // Don't cache HTML files (they might change with deployments)
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      } else if (path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
        // Cache static assets for 1 year
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
      
      // Security headers for all static files
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
    }
  });

  return staticMiddleware;
}

/**
 * SPA fallback middleware - serves index.html for client-side routes
 */
function createSpaFallback() {
  return (req, res, next) => {
    // Skip API routes and other non-SPA routes
    if (req.path.startsWith('/api') || 
        req.path.startsWith('/login') || 
        req.path.startsWith('/signin-nbg') ||
        req.path.startsWith('/logout') ||
        req.path.startsWith('/auth/')) {
      return next();
    }

    // Check if it's a request for a static file that exists
    const distPath = path.join(__dirname, '../../../dist');
    const filePath = path.join(distPath, req.path);
    
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return next();
    }

    // Serve index.html for SPA routes
    const indexPath = path.join(distPath, 'index.html');
    
    if (!fs.existsSync(indexPath)) {
      return res.status(404).json({
        error: 'Application not built',
        message: 'Please run "npm run build" to build the React application'
      });
    }

    // Set headers for index.html
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Content Security Policy
    res.setHeader('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self' data:; " +
      "connect-src 'self' https://my.nbg.gr; " +
      "frame-ancestors 'none';"
    );

    res.sendFile(indexPath);
  };
}

/**
 * Health check endpoint
 */
function createHealthCheck() {
  return (req, res) => {
    const distPath = path.join(__dirname, '../../../dist');
    const indexExists = fs.existsSync(path.join(distPath, 'index.html'));
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      buildReady: indexExists,
      uptime: process.uptime()
    });
  };
}

module.exports = {
  createStaticMiddleware,
  createSpaFallback,
  createHealthCheck
};