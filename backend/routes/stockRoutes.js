/**
 * Stock Routes v1
 * External stock data API routes with rate limiting
 */
const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const { validateSymbolQuery } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/logging');
const { searchLimiter, externalApiLimiter } = require('../middleware/rateLimiter');

// Search (more permissive rate limit)
router.get('/stocks', searchLimiter, asyncHandler(stockController.searchStocks));

// Company data (require symbol validation + external API rate limit)
router.get('/company', externalApiLimiter, validateSymbolQuery, asyncHandler(stockController.getCompany));
router.get('/quote', externalApiLimiter, validateSymbolQuery, asyncHandler(stockController.getQuote));
router.get('/peers', externalApiLimiter, validateSymbolQuery, asyncHandler(stockController.getPeers));
router.get('/Sentiments', externalApiLimiter, validateSymbolQuery, asyncHandler(stockController.getSentiments));
router.get('/News', externalApiLimiter, validateSymbolQuery, asyncHandler(stockController.getNews));

// Chart data
router.get('/Chart1', externalApiLimiter, validateSymbolQuery, asyncHandler(stockController.getChart1));
router.get('/Chart2', externalApiLimiter, validateSymbolQuery, asyncHandler(stockController.getChart2));
router.get('/Chart4', externalApiLimiter, validateSymbolQuery, asyncHandler(stockController.getChart4));
router.get('/historical_data', externalApiLimiter, validateSymbolQuery, asyncHandler(stockController.getHistoricalData));

module.exports = router;
