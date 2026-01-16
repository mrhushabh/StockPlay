/**
 * Watchlist Routes
 */
const express = require('express');
const router = express.Router();
const watchlistController = require('../controllers/watchlistController');
const { validateWatchlistAdd } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/logging');

// RESTful routes
router.get('/', asyncHandler(watchlistController.getWatchlist));
router.post('/', validateWatchlistAdd, asyncHandler(watchlistController.addToWatchlist));
router.delete('/:symbol', asyncHandler(watchlistController.removeFromWatchlist));

// Legacy routes (for backward compatibility)
router.get('/watchlist', asyncHandler(watchlistController.getWatchlist));
router.post('/watchlist', asyncHandler(watchlistController.getWatchlist));
router.post('/addfav', validateWatchlistAdd, asyncHandler(watchlistController.addToWatchlist));
router.post('/removefav', asyncHandler(watchlistController.removeFromWatchlist));
router.post('/star', asyncHandler(watchlistController.checkWatchlistStatus));

module.exports = router;
