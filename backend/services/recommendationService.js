/**
 * AI Recommendation Service
 * Uses Google Gemini to generate daily stock picks based on watchlist and market news
 */
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');
const Fav = require('../Wishlistschema'); // Watchlist model

// Initialize Gemini will be done inside the function to ensure env vars are ready
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const finnhubClient = axios.create({
    baseURL: 'https://finnhub.io/api/v1',
    timeout: 10000
});

// Cache for recommendations (simple in-memory cache)
let cache = {
    data: null,
    timestamp: 0
};
const CACHE_DURATION = 4 * 60 * 60 * 1000; // 4 hours

/**
 * Get Market News Headlines
 */
const getMarketNews = async () => {
    try {
        const response = await finnhubClient.get('/news?category=general', {
            params: { token: FINNHUB_API_KEY }
        });
        // Get top 5 headlines
        return response.data.slice(0, 5).map(n => n.headline).join('; ');
    } catch (error) {
        console.error('Error fetching market news:', error.message);
        return "Market is volatile today.";
    }
};

/**
 * Get User Watchlist Data
 */
const getWatchlistData = async () => {
    try {
        const watchlist = await Fav.find();

        // If empty, return default seeds
        if (!watchlist || watchlist.length === 0) {
            return [
                { symbol: 'SPY', stockName: 'S&P 500 ETF' },
                { symbol: 'QQQ', stockName: 'Nasdaq 100 ETF' },
                { symbol: 'NVDA', stockName: 'FDA' },
                { symbol: 'AAPL', stockName: 'Apple Inc' }
            ];
        }

        // Return max 10 to avoid token limits
        return watchlist.slice(0, 10).map(item => ({
            symbol: item.symbol,
            name: item.stockName,
            price: item.price
        }));
    } catch (error) {
        console.error('Error fetching watchlist:', error.message);
        return [{ symbol: 'SPY', stockName: 'S&P 500 ETF' }];
    }
};

/**
 * Generate Daily Insights using Gemini
 */
const generateDailyInsights = async () => {
    // Check cache
    const now = Date.now();
    if (cache.data && (now - cache.timestamp < CACHE_DURATION)) {
        console.log('Serving cached AI recommendations');
        return cache.data;
    }

    try {
        console.log('Generating new AI recommendations...');

        // Check API Key
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is missing in environment variables');
        }

        // Initialize Gemini (lazy load to ensure env vars are ready)
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // 1. Gather Data
        const [marketNews, watchlist] = await Promise.all([
            getMarketNews(),
            getWatchlistData()
        ]);

        console.log(`Fetched news length: ${marketNews.length}`);

        const watchlistStr = watchlist.map(s => `${s.symbol} (${s.name})`).join(', ');

        // 2. Construct Prompt
        const prompt = `
        You are a senior financial analyst AI. 
        
        Current Market News Headlines: "${marketNews}"
        
        User's Watchlist Stocks: ${watchlistStr}
        
        Task: 
        Based on the market news and the user's watchlist, select the top 3 specific stocks that are most interesting to watch today.
        They can be from the watchlist OR related stocks that might be affected by the news.
        
        Output MUST be valid JSON only, with this structure:
        {
            "marketSentiment": "Bullish" | "Bearish" | "Neutral",
            "recommendations": [
                {
                    "symbol": "TICKER",
                    "name": "Company Name",
                    "price": "Current Price (estimate)",
                    "reason": "Concise reasoning (max 1 sentence) relating to news or pattern.",
                    "sentiment": "Positive" | "Negative",
                    "risk": "High" | "Medium" | "Low"
                }
            ]
        }
        Do not include markdown formatting like \`\`\`json. Just the raw JSON string.
        `;

        // 3. Call Gemini
        console.log('Sending request to Gemini...');
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();

        console.log('Received response from Gemini');
        let insights;
        try {
            insights = JSON.parse(text);
        } catch (e) {
            console.error('Failed to parse Gemini/JSON response:', text);
            throw new Error('Invalid JSON response from AI');
        }

        // 4. Update Cache
        cache = {
            data: insights,
            timestamp: now
        };

        return insights;
    } catch (error) {
        console.error('Gemini Agent Error Details:', error);
        // Rethrow error so controller handles it (frontend will show error state)
        throw error;
    }
};

module.exports = {
    generateDailyInsights
};
