/**
 * Watchlist Controller
 * Handles favorites/watchlist operations
 */
const Fav = require('../Wishlistschema');

/**
 * Get all watchlist items
 */
const getWatchlist = async (req, res) => {
    const list = await Fav.find();
    res.json(list);
};

/**
 * Add stock to watchlist
 */
const addToWatchlist = async (req, res) => {
    const { stockName, symbol, price, change } = req.validatedData;

    // Check if already exists
    const existing = await Fav.findOne({ symbol });
    if (existing) {
        return res.json({ message: 'Already in watchlist', item: existing });
    }

    const newFav = new Fav({ stockName, symbol, price, change });
    await newFav.save();

    console.log(`Added to watchlist: ${symbol}`);
    res.status(201).json(newFav);
};

/**
 * Remove stock from watchlist
 */
const removeFromWatchlist = async (req, res) => {
    const { symbol } = req.body;

    if (!symbol) {
        return res.status(400).json({ error: 'Symbol is required' });
    }

    const result = await Fav.deleteOne({ symbol: symbol.toUpperCase() });

    if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Stock not found in watchlist' });
    }

    console.log(`Removed from watchlist: ${symbol}`);
    res.json({ message: 'Removed from watchlist' });
};

/**
 * Check if stock is in watchlist
 */
const checkWatchlistStatus = async (req, res) => {
    const { stockName } = req.body;

    if (!stockName) {
        return res.status(400).json({ error: 'Stock name is required' });
    }

    const item = await Fav.findOne({ stockName });
    res.json({ starstate: !!item });
};

module.exports = {
    getWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    checkWatchlistStatus
};
