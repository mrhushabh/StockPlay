/**
 * Logging Middleware
 * Request logging and error handling
 */

/**
 * Request logger middleware
 */
const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
};

/**
 * Error handler middleware
 */
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);

    // Don't leak error details in production
    const isDev = process.env.NODE_ENV !== 'production';

    res.status(err.status || 500).json({
        error: isDev ? err.message : 'An unexpected error occurred',
        ...(isDev && { stack: err.stack })
    });
};

/**
 * Not found handler
 */
const notFoundHandler = (req, res, next) => {
    res.status(404).json({ error: 'Route not found' });
};

/**
 * Async handler wrapper - catches errors in async routes
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
    requestLogger,
    errorHandler,
    notFoundHandler,
    asyncHandler
};
