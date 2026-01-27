/**
 * Recommendation Routes
 */
const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const { asyncHandler } = require('../middleware/logging');

// GET /api/v1/recommendations/daily
router.get('/daily', asyncHandler(recommendationController.getDailyRecommendations));

module.exports = router;
