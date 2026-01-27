/**
 * Recommendation Controller
 * Handles AI-powered daily insights
 */
const recommendationService = require('../services/recommendationService');

/**
 * Get Daily Recommendations
 * GET /api/v1/recommendations/daily
 */
const getDailyRecommendations = async (req, res) => {
    try {
        const insights = await recommendationService.generateDailyInsights();
        res.json(insights);
    } catch (error) {
        console.error('Controller Error:', error);
        res.status(500).json({ error: 'Failed to generate recommendations' });
    }
};

module.exports = {
    getDailyRecommendations
};
