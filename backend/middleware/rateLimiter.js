/**
 * Rate Limiting Middleware
 * Prevents abuse and protects against DDoS attacks
 * More permissive in development
 */
const rateLimit = require('express-rate-limit');

const isDev = process.env.NODE_ENV !== 'production';

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: isDev ? 1000 : 100, // Very permissive in dev
    message: {
        error: 'Too many requests, please try again later.',
        retryAfter: '1 minute'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => isDev // Skip in development
});

// Stricter limiter for trading operations
const tradeLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: isDev ? 100 : 10, // More permissive in dev
    message: {
        error: 'Too many trade requests. Please wait before trying again.',
        retryAfter: '1 minute'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => isDev // Skip in development
});

// Limiter for search/autocomplete (more permissive)
const searchLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: isDev ? 500 : 60, // More permissive in dev
    message: {
        error: 'Search rate limit exceeded. Please slow down.',
        retryAfter: '1 minute'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => isDev // Skip in development
});

// Limiter for external API calls
const externalApiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: isDev ? 200 : 30, // More permissive in dev
    message: {
        error: 'External API rate limit exceeded. Please try again shortly.',
        retryAfter: '1 minute'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => isDev // Skip in development
});

module.exports = {
    apiLimiter,
    tradeLimiter,
    searchLimiter,
    externalApiLimiter
};
