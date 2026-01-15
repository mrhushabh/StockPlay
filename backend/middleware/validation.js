/**
 * Validation Middleware
 * Input validation and sanitization
 */

const sanitizeString = (str) => {
    if (typeof str !== 'string') return '';
    return str.replace(/[<>'"&]/g, '').trim();
};

const validateNumber = (num) => {
    const parsed = parseFloat(num);
    return !isNaN(parsed) && isFinite(parsed) && parsed >= 0 ? parsed : null;
};

const validatePositiveInteger = (num) => {
    const parsed = parseInt(num, 10);
    return !isNaN(parsed) && parsed > 0 ? parsed : null;
};

const validateStockSymbol = (symbol) => {
    if (typeof symbol !== 'string') return null;
    const cleaned = symbol.toUpperCase().replace(/[^A-Z]/g, '');
    return cleaned.length >= 1 && cleaned.length <= 5 ? cleaned : null;
};

/**
 * Middleware: Validate trade request (buy/sell)
 */
const validateTradeRequest = (req, res, next) => {
    const { quantity, price, stockName } = req.body;

    const validatedQuantity = validatePositiveInteger(quantity);
    const validatedPrice = validateNumber(price);
    const validatedStockName = sanitizeString(stockName);

    if (validatedQuantity === null) {
        return res.status(400).json({ error: 'Invalid quantity. Must be a positive integer.' });
    }

    if (validatedPrice === null) {
        return res.status(400).json({ error: 'Invalid price. Must be a positive number.' });
    }

    if (!validatedStockName) {
        return res.status(400).json({ error: 'Invalid stock name.' });
    }

    // Attach validated data to request
    req.validatedData = {
        quantity: validatedQuantity,
        price: validatedPrice,
        stockName: validatedStockName
    };

    next();
};

/**
 * Middleware: Validate stock symbol query parameter
 */
const validateSymbolQuery = (req, res, next) => {
    const symbol = validateStockSymbol(req.query.symbol);

    if (!symbol) {
        return res.status(400).json({ error: 'Invalid or missing symbol parameter.' });
    }

    req.validatedSymbol = symbol;
    next();
};

/**
 * Middleware: Validate watchlist add request
 */
const validateWatchlistAdd = (req, res, next) => {
    const { stockName, symbol, price, change } = req.body;

    const validatedSymbol = validateStockSymbol(symbol);
    const validatedStockName = sanitizeString(stockName);

    if (!validatedSymbol || !validatedStockName) {
        return res.status(400).json({ error: 'Invalid stock data.' });
    }

    req.validatedData = {
        stockName: validatedStockName,
        symbol: validatedSymbol,
        price: validateNumber(price) || 0,
        change: validateNumber(change) || 0
    };

    next();
};

module.exports = {
    sanitizeString,
    validateNumber,
    validatePositiveInteger,
    validateStockSymbol,
    validateTradeRequest,
    validateSymbolQuery,
    validateWatchlistAdd
};
