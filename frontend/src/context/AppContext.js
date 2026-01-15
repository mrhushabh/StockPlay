import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import { walletApi, portfolioApi, watchlistApi } from '../services/api';

/**
 * App Context - Centralized State Management
 * Replaces props drilling and global state pollution
 */

// Initial State
const initialState = {
    // Wallet
    wallet: { balance: 0, loading: false, error: null },

    // Portfolio
    portfolio: { holdings: [], loading: false, error: null },

    // Watchlist
    watchlist: { items: [], loading: false, error: null },

    // Search/Selected Stock
    selectedStock: null,
    searchResults: null,

    // UI State
    modals: { buy: false, sell: false },
    notifications: []
};

// Action Types
const ActionTypes = {
    // Wallet
    FETCH_WALLET_START: 'FETCH_WALLET_START',
    FETCH_WALLET_SUCCESS: 'FETCH_WALLET_SUCCESS',
    FETCH_WALLET_ERROR: 'FETCH_WALLET_ERROR',

    // Portfolio
    FETCH_PORTFOLIO_START: 'FETCH_PORTFOLIO_START',
    FETCH_PORTFOLIO_SUCCESS: 'FETCH_PORTFOLIO_SUCCESS',
    FETCH_PORTFOLIO_ERROR: 'FETCH_PORTFOLIO_ERROR',

    // Watchlist
    FETCH_WATCHLIST_START: 'FETCH_WATCHLIST_START',
    FETCH_WATCHLIST_SUCCESS: 'FETCH_WATCHLIST_SUCCESS',
    FETCH_WATCHLIST_ERROR: 'FETCH_WATCHLIST_ERROR',

    // Stock Selection
    SET_SELECTED_STOCK: 'SET_SELECTED_STOCK',
    SET_SEARCH_RESULTS: 'SET_SEARCH_RESULTS',
    CLEAR_SELECTION: 'CLEAR_SELECTION',

    // Modals
    OPEN_BUY_MODAL: 'OPEN_BUY_MODAL',
    OPEN_SELL_MODAL: 'OPEN_SELL_MODAL',
    CLOSE_MODALS: 'CLOSE_MODALS',

    // Notifications
    ADD_NOTIFICATION: 'ADD_NOTIFICATION',
    REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION'
};

// Reducer
const appReducer = (state, action) => {
    switch (action.type) {
        // Wallet
        case ActionTypes.FETCH_WALLET_START:
            return { ...state, wallet: { ...state.wallet, loading: true, error: null } };
        case ActionTypes.FETCH_WALLET_SUCCESS:
            return { ...state, wallet: { balance: action.payload, loading: false, error: null } };
        case ActionTypes.FETCH_WALLET_ERROR:
            return { ...state, wallet: { ...state.wallet, loading: false, error: action.payload } };

        // Portfolio
        case ActionTypes.FETCH_PORTFOLIO_START:
            return { ...state, portfolio: { ...state.portfolio, loading: true, error: null } };
        case ActionTypes.FETCH_PORTFOLIO_SUCCESS:
            return { ...state, portfolio: { holdings: action.payload, loading: false, error: null } };
        case ActionTypes.FETCH_PORTFOLIO_ERROR:
            return { ...state, portfolio: { ...state.portfolio, loading: false, error: action.payload } };

        // Watchlist
        case ActionTypes.FETCH_WATCHLIST_START:
            return { ...state, watchlist: { ...state.watchlist, loading: true, error: null } };
        case ActionTypes.FETCH_WATCHLIST_SUCCESS:
            return { ...state, watchlist: { items: action.payload, loading: false, error: null } };
        case ActionTypes.FETCH_WATCHLIST_ERROR:
            return { ...state, watchlist: { ...state.watchlist, loading: false, error: action.payload } };

        // Stock Selection
        case ActionTypes.SET_SELECTED_STOCK:
            return { ...state, selectedStock: action.payload };
        case ActionTypes.SET_SEARCH_RESULTS:
            return { ...state, searchResults: action.payload };
        case ActionTypes.CLEAR_SELECTION:
            return { ...state, selectedStock: null, searchResults: null };

        // Modals
        case ActionTypes.OPEN_BUY_MODAL:
            return { ...state, modals: { ...state.modals, buy: true }, selectedStock: action.payload };
        case ActionTypes.OPEN_SELL_MODAL:
            return { ...state, modals: { ...state.modals, sell: true }, selectedStock: action.payload };
        case ActionTypes.CLOSE_MODALS:
            return { ...state, modals: { buy: false, sell: false } };

        // Notifications
        case ActionTypes.ADD_NOTIFICATION:
            return { ...state, notifications: [...state.notifications, { id: Date.now(), ...action.payload }] };
        case ActionTypes.REMOVE_NOTIFICATION:
            return { ...state, notifications: state.notifications.filter(n => n.id !== action.payload) };

        default:
            return state;
    }
};

// Create Context
const AppContext = createContext(null);

// Provider Component
export const AppProvider = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);

    // ===== ACTIONS =====

    // Wallet Actions
    const fetchWallet = useCallback(async () => {
        dispatch({ type: ActionTypes.FETCH_WALLET_START });
        try {
            const response = await walletApi.getMoney();
            dispatch({ type: ActionTypes.FETCH_WALLET_SUCCESS, payload: response.data.Money || 0 });
        } catch (error) {
            dispatch({ type: ActionTypes.FETCH_WALLET_ERROR, payload: error.message });
        }
    }, []);

    // Portfolio Actions
    const fetchPortfolio = useCallback(async () => {
        dispatch({ type: ActionTypes.FETCH_PORTFOLIO_START });
        try {
            const response = await portfolioApi.getAll();
            dispatch({ type: ActionTypes.FETCH_PORTFOLIO_SUCCESS, payload: response.data || [] });
        } catch (error) {
            dispatch({ type: ActionTypes.FETCH_PORTFOLIO_ERROR, payload: error.message });
        }
    }, []);

    const buyStock = useCallback(async (stockData) => {
        try {
            await portfolioApi.buy(stockData);
            await fetchPortfolio();
            await fetchWallet();
            dispatch({ type: ActionTypes.CLOSE_MODALS });
            dispatch({ type: ActionTypes.ADD_NOTIFICATION, payload: { type: 'success', message: `Bought ${stockData.quantity} shares of ${stockData.stockName}` } });
        } catch (error) {
            dispatch({ type: ActionTypes.ADD_NOTIFICATION, payload: { type: 'error', message: error.message } });
        }
    }, [fetchPortfolio, fetchWallet]);

    const sellStock = useCallback(async (stockData) => {
        try {
            await portfolioApi.sell(stockData);
            await fetchPortfolio();
            await fetchWallet();
            dispatch({ type: ActionTypes.CLOSE_MODALS });
            dispatch({ type: ActionTypes.ADD_NOTIFICATION, payload: { type: 'success', message: `Sold ${stockData.quantity} shares of ${stockData.stockName}` } });
        } catch (error) {
            dispatch({ type: ActionTypes.ADD_NOTIFICATION, payload: { type: 'error', message: error.message } });
        }
    }, [fetchPortfolio, fetchWallet]);

    // Watchlist Actions
    const fetchWatchlist = useCallback(async () => {
        dispatch({ type: ActionTypes.FETCH_WATCHLIST_START });
        try {
            const response = await watchlistApi.getAll();
            dispatch({ type: ActionTypes.FETCH_WATCHLIST_SUCCESS, payload: response.data || [] });
        } catch (error) {
            dispatch({ type: ActionTypes.FETCH_WATCHLIST_ERROR, payload: error.message });
        }
    }, []);

    const addToWatchlist = useCallback(async (stockData) => {
        try {
            await watchlistApi.add(stockData);
            await fetchWatchlist();
            dispatch({ type: ActionTypes.ADD_NOTIFICATION, payload: { type: 'success', message: `Added ${stockData.symbol} to watchlist` } });
        } catch (error) {
            dispatch({ type: ActionTypes.ADD_NOTIFICATION, payload: { type: 'error', message: error.message } });
        }
    }, [fetchWatchlist]);

    const removeFromWatchlist = useCallback(async (symbol) => {
        try {
            await watchlistApi.remove(symbol);
            await fetchWatchlist();
        } catch (error) {
            dispatch({ type: ActionTypes.ADD_NOTIFICATION, payload: { type: 'error', message: error.message } });
        }
    }, [fetchWatchlist]);

    // UI Actions
    const openBuyModal = useCallback((stock) => {
        dispatch({ type: ActionTypes.OPEN_BUY_MODAL, payload: stock });
    }, []);

    const openSellModal = useCallback((stock) => {
        dispatch({ type: ActionTypes.OPEN_SELL_MODAL, payload: stock });
    }, []);

    const closeModals = useCallback(() => {
        dispatch({ type: ActionTypes.CLOSE_MODALS });
    }, []);

    const setSelectedStock = useCallback((stock) => {
        dispatch({ type: ActionTypes.SET_SELECTED_STOCK, payload: stock });
    }, []);

    const setSearchResults = useCallback((results) => {
        dispatch({ type: ActionTypes.SET_SEARCH_RESULTS, payload: results });
    }, []);

    const removeNotification = useCallback((id) => {
        dispatch({ type: ActionTypes.REMOVE_NOTIFICATION, payload: id });
    }, []);

    // Memoized context value
    const contextValue = useMemo(() => ({
        // State
        wallet: state.wallet,
        portfolio: state.portfolio,
        watchlist: state.watchlist,
        selectedStock: state.selectedStock,
        searchResults: state.searchResults,
        modals: state.modals,
        notifications: state.notifications,

        // Actions
        fetchWallet,
        fetchPortfolio,
        buyStock,
        sellStock,
        fetchWatchlist,
        addToWatchlist,
        removeFromWatchlist,
        openBuyModal,
        openSellModal,
        closeModals,
        setSelectedStock,
        setSearchResults,
        removeNotification
    }), [
        state.wallet,
        state.portfolio,
        state.watchlist,
        state.selectedStock,
        state.searchResults,
        state.modals,
        state.notifications,
        fetchWallet,
        fetchPortfolio,
        buyStock,
        sellStock,
        fetchWatchlist,
        addToWatchlist,
        removeFromWatchlist,
        openBuyModal,
        openSellModal,
        closeModals,
        setSelectedStock,
        setSearchResults,
        removeNotification
    ]);

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};

// Custom hook to use the context
export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};

// Selector hooks for specific state slices (prevents unnecessary re-renders)
export const useWallet = () => {
    const { wallet, fetchWallet } = useApp();
    return { ...wallet, refetch: fetchWallet };
};

export const usePortfolio = () => {
    const { portfolio, fetchPortfolio, buyStock, sellStock, openBuyModal, openSellModal } = useApp();
    return { ...portfolio, refetch: fetchPortfolio, buyStock, sellStock, openBuyModal, openSellModal };
};

export const useWatchlistContext = () => {
    const { watchlist, fetchWatchlist, addToWatchlist, removeFromWatchlist } = useApp();
    return { ...watchlist, refetch: fetchWatchlist, addToWatchlist, removeFromWatchlist };
};

export const useModals = () => {
    const { modals, selectedStock, closeModals } = useApp();
    return { ...modals, selectedStock, closeModals };
};

export default AppContext;
