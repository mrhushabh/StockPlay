/**
 * Trade Routes v1
 * RESTful API with versioning for portfolio and trading operations
 */
const express = require('express');
const router = express.Router();
const tradeController = require('../controllers/tradeController');
const { validateTradeRequest } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/logging');
const { tradeLimiter } = require('../middleware/rateLimiter');

// ===== RESTful v1 Routes =====

// GET /api/v1/wallet - Get wallet balance
router.get('/wallet', asyncHandler(tradeController.getBalance));

// GET /api/v1/portfolio - Get all holdings
router.get('/portfolio', asyncHandler(tradeController.getPortfolio));

// GET /api/v1/portfolio/:stockName - Get specific holding
router.get('/portfolio/:stockName', asyncHandler(tradeController.getStockHolding));

// POST /api/v1/trade/buy - Buy stock (atomic, rate limited)
router.post('/trade/buy', tradeLimiter, validateTradeRequest, asyncHandler(tradeController.buyStock));

// POST /api/v1/trade/sell - Sell stock (atomic, rate limited)
router.post('/trade/sell', tradeLimiter, validateTradeRequest, asyncHandler(tradeController.sellStock));

// ===== Legacy Routes (backward compatibility with /api prefix) =====
router.post('/Money', asyncHandler(tradeController.getBalance));
router.post('/portfolio', asyncHandler(tradeController.getPortfolio));
router.post('/portfoliostock', asyncHandler(tradeController.getStockHolding));
router.post('/buy', tradeLimiter, validateTradeRequest, asyncHandler(tradeController.buyStock));
router.post('/sell', tradeLimiter, validateTradeRequest, asyncHandler(tradeController.sellStock));

module.exports = router;
