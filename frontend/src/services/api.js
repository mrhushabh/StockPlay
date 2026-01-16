/**
 * Centralized API Service
 * All API calls go through this service for consistency and maintainability
 */

import axios from 'axios';

// Use relative paths - works with proxy in dev and same-origin in production
const API_BASE = 'http://localhost:3001/api';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

// =========================
// WALLET & PORTFOLIO
// =========================

export const walletApi = {
    getMoney: () => apiClient.post('/Money'),
};

export const portfolioApi = {
    getAll: () => apiClient.post('/portfolio'),
    getByStock: (stockName) => apiClient.post('/portfoliostock', { stockName }),
    buy: (data) => apiClient.post('/buy', data),
    sell: (data) => apiClient.post('/sell', data),
    reset: () => apiClient.post('/reset'),
};

// =========================
// WATCHLIST
// =========================

export const watchlistApi = {
    getAll: () => apiClient.post('/watchlist'),
    add: (data) => apiClient.post('/addfav', data),
    remove: (symbol) => apiClient.post('/removefav', { symbol }),
    checkStar: (stockName) => apiClient.post('/star', { stockName }),
};

// =========================
// STOCK DATA
// =========================

export const stockApi = {
    search: (query) => apiClient.get('/stocks', { params: { query } }),
    getCompany: (symbol) => apiClient.get('/company', { params: { symbol } }),
    getQuote: (symbol) => apiClient.get('/quote', { params: { symbol } }),
    getPeers: (symbol) => apiClient.get('/peers', { params: { symbol } }),
    getSentiments: (symbol) => apiClient.get('/Sentiments', { params: { symbol } }),
    getNews: (symbol) => apiClient.get('/News', { params: { symbol } }),
};

// =========================
// CHARTS
// =========================

export const chartApi = {
    getChart1: (symbol) => apiClient.get('/Chart1', { params: { symbol } }),
    getChart2: (symbol) => apiClient.get('/Chart2', { params: { symbol } }),
    getChart4: (symbol) => apiClient.get('/Chart4', { params: { symbol } }),
    getHistoricalData: (symbol) => apiClient.get('/historical_data', { params: { symbol } }),
};

export default apiClient;
