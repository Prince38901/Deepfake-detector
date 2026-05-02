// backend/middleware/errorHandler.js - Error Handling Middleware
const logger = require('../utils/logger');

/**
 * Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error({
    status,
    message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  res.status(status).json({
    error: message,
    status,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  errorHandler
};
