import { useState, useEffect, useCallback } from 'react';
import { walletApi } from '../services/api';

/**
 * Custom hook for wallet/money management
 * Eliminates the need for global Money state
 */
export const useWallet = () => {
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBalance = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await walletApi.getMoney();
            setBalance(response.data.Money || 0);
        } catch (err) {
            setError(err.message || 'Failed to fetch wallet balance');
            console.error('Error fetching wallet:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBalance();
    }, [fetchBalance]);

    return {
        balance,
        loading,
        error,
        refetch: fetchBalance,
    };
};

/**
 * Custom hook for debounced search
 * Prevents excessive API calls during typing
 */
export const useDebouncedValue = (value, delay = 300) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

/**
 * Custom hook for async operations with loading/error states
 */
export const useAsync = (asyncFunction, immediate = false) => {
    const [status, setStatus] = useState('idle');
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const execute = useCallback(async (...args) => {
        setStatus('pending');
        setData(null);
        setError(null);

        try {
            const response = await asyncFunction(...args);
            setData(response.data);
            setStatus('success');
            return response.data;
        } catch (err) {
            setError(err);
            setStatus('error');
            throw err;
        }
    }, [asyncFunction]);

    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, [execute, immediate]);

    return {
        execute,
        status,
        data,
        error,
        isLoading: status === 'pending',
        isError: status === 'error',
        isSuccess: status === 'success',
    };
};

/**
 * Custom hook for number formatting
 * Ensures consistent display of prices and quantities
 */
export const useNumberFormat = () => {
    const formatCurrency = useCallback((value) => {
        const num = parseFloat(value);
        if (isNaN(num)) return '$0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(num);
    }, []);

    const formatNumber = useCallback((value, decimals = 2) => {
        const num = parseFloat(value);
        if (isNaN(num)) return '0';
        return num.toFixed(decimals);
    }, []);

    const formatPercent = useCallback((value) => {
        const num = parseFloat(value);
        if (isNaN(num)) return '0%';
        return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
    }, []);

    return { formatCurrency, formatNumber, formatPercent };
};
