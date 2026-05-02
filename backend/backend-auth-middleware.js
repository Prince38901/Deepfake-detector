// backend/middleware/auth.js - JWT & RBAC Authentication
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const logger = require('../utils/logger');

/**
 * JWT Token Verification Middleware
 */
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No authentication token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key');
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Auth error:', error.message);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Role-Based Access Control (RBAC)
 * @param {string|string[]} requiredRoles - Role(s) required to access
 */
const rbacMiddleware = (requiredRoles) => {
  return (req, res, next) => {
    const userRoles = req.user?.roles || [];
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    
    const hasRole = roles.some(role => userRoles.includes(role));
    
    if (!hasRole) {
      logger.warn(`Access denied for user ${req.user?.id}. Required: ${roles.join(', ')}`);
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

/**
 * Multi-Factor Authentication (MFA) Verification
 * @param {string} mfaToken - MFA token from user
 * @param {string} mfaSecret - Stored MFA secret
 */
const verifyMFA = (mfaToken, mfaSecret) => {
  try {
    return speakeasy.totp.verify({
      secret: mfaSecret,
      encoding: 'base32',
      token: mfaToken,
      window: 2
    });
  } catch (error) {
    logger.error('MFA verification error:', error.message);
    return false;
  }
};

/**
 * Generate MFA Secret for User
 */
const generateMFASecret = () => {
  return speakeasy.generateSecret({
    name: 'Deepfake Detection System',
    issuer: 'DD-System',
    length: 32
  });
};

/**
 * Rate Limiting Middleware (per user)
 */
const rateLimitMiddleware = (req, res, next) => {
  const userId = req.user?.id;
  const key = `rate_${userId}_${Math.floor(Date.now() / 60000)}`;
  
  // Simple in-memory rate limiting (use Redis in production)
  if (!global.rateLimitStore) {
    global.rateLimitStore = {};
  }
  
  global.rateLimitStore[key] = (global.rateLimitStore[key] || 0) + 1;
  
  if (global.rateLimitStore[key] > 100) { // 100 requests per minute
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }
  
  next();
};

/**
 * Input Validation Middleware
 */
const validateInput = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.details.map(d => ({ field: d.path[0], message: d.message }))
      });
    }
    
    req.body = value;
    next();
  };
};

/**
 * Audit Logging Middleware
 */
const auditLog = (action) => {
  return (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
      // Log after response is sent
      setImmediate(() => {
        logger.info({
          action,
          userId: req.user?.id,
          endpoint: req.path,
          method: req.method,
          statusCode: res.statusCode,
          timestamp: new Date().toISOString(),
          userAgent: req.headers['user-agent']
        });
      });
      
      return originalJson.call(this, data);
    };
    
    next();
  };
};

module.exports = {
  authMiddleware,
  rbacMiddleware,
  verifyMFA,
  generateMFASecret,
  rateLimitMiddleware,
  validateInput,
  auditLog
};
