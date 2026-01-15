/**
 * Stock Controller
 * Handles external stock API requests
 */
const stockService = require('../services/stockService');

const searchStocks = async (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }
    const data = await stockService.searchStocks(query);
    res.json(data);
};

const getCompany = async (req, res) => {
    const data = await stockService.getCompanyProfile(req.validatedSymbol);
    res.json(data);
};

const getQuote = async (req, res) => {
    const data = await stockService.getQuote(req.validatedSymbol);
    res.json(data);
};

const getPeers = async (req, res) => {
    const data = await stockService.getPeers(req.validatedSymbol);
    res.json(data);
};

const getSentiments = async (req, res) => {
    const data = await stockService.getSentiments(req.validatedSymbol);
    res.json(data);
};

const getNews = async (req, res) => {
    const data = await stockService.getNews(req.validatedSymbol);
    res.json(data);
};

const getChart1 = async (req, res) => {
    const data = await stockService.getChartData(req.validatedSymbol);
    res.json(data);
};

const getChart2 = async (req, res) => {
    const data = await stockService.getRecommendations(req.validatedSymbol);
    res.json(data);
};

const getChart4 = async (req, res) => {
    const data = await stockService.getEarnings(req.validatedSymbol);
    res.json(data);
};

const getHistoricalData = async (req, res) => {
    const data = await stockService.getHistoricalData(req.validatedSymbol);
    res.json(data);
};

module.exports = {
    searchStocks,
    getCompany,
    getQuote,
    getPeers,
    getSentiments,
    getNews,
    getChart1,
    getChart2,
    getChart4,
    getHistoricalData
};
