/**
 * Rate Limiting Middleware
 * Prevents abuse and protects against DDoS attacks
 */
const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: {
        error: 'Too many requests, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false, // Disable X-RateLimit-* headers
});

// Stricter limiter for trading operations
const tradeLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 10 trades per minute
    message: {
        error: 'Too many trade requests. Please wait before trying again.',
        retryAfter: '1 minute'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Limiter for search/autocomplete (more permissive)
const searchLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute for search
    message: {
        error: 'Search rate limit exceeded. Please slow down.',
        retryAfter: '1 minute'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Limiter for external API calls (Finnhub/Polygon have their own limits)
const externalApiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // 30 external API calls per minute
    message: {
        error: 'External API rate limit exceeded. Please try again shortly.',
        retryAfter: '1 minute'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    apiLimiter,
    tradeLimiter,
    searchLimiter,
    externalApiLimiter
};
