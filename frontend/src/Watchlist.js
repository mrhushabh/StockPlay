import React, { useState, useEffect, useCallback } from 'react';
import { watchlistApi } from './services/api';
import { useNumberFormat } from './hooks/useStock';
import './App.css';

/**
 * Watchlist Component
 * Displays user's favorite stocks with real-time data
 * Refactored to use centralized API service and custom hooks
 */
export const Watchlist = () => {
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { formatNumber } = useNumberFormat();

    const fetchWatchlist = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await watchlistApi.getAll();
            setStocks(response.data || []);
        } catch (err) {
            setError('Failed to load watchlist');
            console.error('Error fetching watchlist:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWatchlist();
    }, [fetchWatchlist]);

    const handleRemoveStock = async (symbol) => {
        try {
            await watchlistApi.remove(symbol);
            // Optimistic update
            setStocks(prevStocks => prevStocks.filter(stock => stock.symbol !== symbol));
        } catch (err) {
            console.error('Error removing stock:', err);
            // Refetch to ensure consistency
            fetchWatchlist();
        }
    };

    if (loading) {
        return (
            <div className="portfolio-container">
                <div className="portfolio-header">
                    <h1>My Watchlist</h1>
                </div>
                <div className="text-center p-5">
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="portfolio-container">
                <div className="portfolio-header">
                    <h1>My Watchlist</h1>
                </div>
                <div className="text-center p-5">
                    <p className="text-danger">{error}</p>
                    <button className="btn btn-primary" onClick={fetchWatchlist}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="portfolio-container">
            <div className="portfolio-header">
                <h1>My Watchlist</h1>
            </div>

            {stocks.length === 0 ? (
                <div className="text-center p-5">
                    <h4 className="text-muted">Your watchlist is empty.</h4>
                    <p className="text-muted">Search for stocks and add them to your watchlist.</p>
                </div>
            ) : (
                stocks.map((stock, index) => (
                    <WatchlistCard
                        key={stock.symbol || index}
                        stock={stock}
                        onRemove={handleRemoveStock}
                        formatNumber={formatNumber}
                    />
                ))
            )}
        </div>
    );
};

/**
 * Individual Watchlist Card Component
 * Extracted for better separation of concerns
 */
const WatchlistCard = ({ stock, onRemove, formatNumber }) => {
    const isPositive = parseFloat(stock.change) >= 0;

    return (
        <div className="card portfolio-item-card" style={{ position: 'relative' }}>
            <span
                className="close-btn"
                onClick={() => onRemove(stock.symbol)}
                title="Remove from Watchlist"
                aria-label="Remove from watchlist"
            >
                &times;
            </span>

            <div className="card-header">
                <h3>{stock.symbol}</h3>
            </div>

            <div className="portfolio-card-body">
                <div className="side1">
                    <div className="stat-row">
                        <span
                            className="stat-label"
                            style={{ alignSelf: 'center', fontSize: '1.2rem', fontWeight: '500', color: '#000' }}
                        >
                            {stock.stockName}
                        </span>
                    </div>
                </div>

                <div className="side2">
                    <div className="stat-row">
                        <span className="stat-label">Change:</span>
                        <span className={`stat-value ${isPositive ? 'text-green' : 'text-red'}`}>
                            {formatNumber(stock.change)}
                            <span style={{ fontSize: '0.8em', marginLeft: '5px' }}>
                                {isPositive ? '▲' : '▼'}
                            </span>
                        </span>
                    </div>

                    <div className="stat-row">
                        <span className="stat-label">Current Price:</span>
                        <span className={`stat-value ${isPositive ? 'text-green' : 'text-red'}`}>
                            ${formatNumber(stock.price)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Watchlist;
