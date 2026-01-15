/**
 * External Stock API Service
 * Handles all external API calls to Finnhub and Polygon
 */
const axios = require('axios');

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const POLYGON_API_KEY = process.env.POLYGON_API_KEY;

const finnhubClient = axios.create({
    baseURL: 'https://finnhub.io/api/v1',
    timeout: 10000
});

const polygonClient = axios.create({
    baseURL: 'https://api.polygon.io/v2',
    timeout: 10000
});

/**
 * Search for stocks
 */
const searchStocks = async (query) => {
    const response = await finnhubClient.get('/search', {
        params: { q: query, token: FINNHUB_API_KEY }
    });
    return response.data;
};

/**
 * Get company profile
 */
const getCompanyProfile = async (symbol) => {
    const response = await finnhubClient.get('/stock/profile2', {
        params: { symbol, token: FINNHUB_API_KEY }
    });
    return response.data;
};

/**
 * Get stock quote
 */
const getQuote = async (symbol) => {
    const response = await finnhubClient.get('/quote', {
        params: { symbol, token: FINNHUB_API_KEY }
    });
    return response.data;
};

/**
 * Get stock peers
 */
const getPeers = async (symbol) => {
    const response = await finnhubClient.get('/stock/peers', {
        params: { symbol, token: FINNHUB_API_KEY }
    });
    return response.data;
};

/**
 * Get insider sentiments
 */
const getSentiments = async (symbol) => {
    const response = await finnhubClient.get('/stock/insider-sentiment', {
        params: { symbol, token: FINNHUB_API_KEY }
    });
    return response.data;
};

/**
 * Get company news
 */
const getNews = async (symbol) => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const toDate = today.toISOString().split('T')[0];
    const fromDate = weekAgo.toISOString().split('T')[0];

    const response = await finnhubClient.get('/company-news', {
        params: { symbol, from: fromDate, to: toDate, token: FINNHUB_API_KEY }
    });
    return response.data;
};

/**
 * Get recommendations
 */
const getRecommendations = async (symbol) => {
    const response = await finnhubClient.get('/stock/recommendation', {
        params: { symbol, token: FINNHUB_API_KEY }
    });
    return response.data;
};

/**
 * Get earnings
 */
const getEarnings = async (symbol) => {
    const response = await finnhubClient.get('/stock/earnings', {
        params: { symbol, token: FINNHUB_API_KEY }
    });
    return response.data;
};

/**
 * Get historical chart data (Polygon)
 */
const getChartData = async (symbol, months = 6) => {
    const today = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const toDate = today.toISOString().split('T')[0];
    const fromDate = startDate.toISOString().split('T')[0];

    const response = await polygonClient.get(
        `/aggs/ticker/${symbol}/range/1/day/${fromDate}/${toDate}`,
        { params: { adjusted: true, sort: 'asc', apiKey: POLYGON_API_KEY } }
    );

    const results = response.data.results || [];
    return {
        tValues: results.map(item => item.t),
        cValues: results.map(item => item.c)
    };
};

/**
 * Get historical OHLCV data (Polygon)
 */
const getHistoricalData = async (symbol, years = 2) => {
    const today = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - years);

    const toDate = today.toISOString().split('T')[0];
    const fromDate = startDate.toISOString().split('T')[0];

    const response = await polygonClient.get(
        `/aggs/ticker/${symbol}/range/1/day/${fromDate}/${toDate}`,
        { params: { adjusted: true, sort: 'asc', apiKey: POLYGON_API_KEY } }
    );

    return (response.data.results || []).map(result => ({
        timestamp: result.t,
        open: result.o,
        high: result.h,
        low: result.l,
        close: result.c,
        volume: result.v
    }));
};

module.exports = {
    searchStocks,
    getCompanyProfile,
    getQuote,
    getPeers,
    getSentiments,
    getNews,
    getRecommendations,
    getEarnings,
    getChartData,
    getHistoricalData
};
