import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { watchlistApi } from './services/api';
import { useNumberFormat } from './hooks/useStock';
import { HeartbeatLoader } from './HeartbeatLoader';
import './App.css';

/**
 * Watchlist Component
 * Displays user's favorite stocks with click navigation
 */
export const Watchlist = () => {
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { formatNumber } = useNumberFormat();
    const navigate = useNavigate();

    const fetchWatchlist = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await watchlistApi.getAll();
            // Ensure we always have an array
            const data = response.data;
            if (Array.isArray(data)) {
                setStocks(data);
            } else if (data && Array.isArray(data.list)) {
                setStocks(data.list);
            } else if (data && typeof data === 'object') {
                // Convert object values to array if it's an object
                setStocks(Object.values(data).filter(item => item && item.symbol));
            } else {
                setStocks([]);
            }
        } catch (err) {
            setError('Failed to load watchlist');
            console.error('Error fetching watchlist:', err);
            setStocks([]);
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
            setStocks(prevStocks => prevStocks.filter(stock => stock.symbol !== symbol));
        } catch (err) {
            console.error('Error removing stock:', err);
            fetchWatchlist();
        }
    };

    const handleStockClick = (symbol) => {
        navigate(`/analytics/${symbol}`);
    };

    if (loading) {
        return (
            <div className="portfolio-container">
                <div className="portfolio-header">
                    <h1>My Watchlist</h1>
                </div>
                <div className="text-center p-5">
                    <HeartbeatLoader />
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
                        onNavigate={handleStockClick}
                        formatNumber={formatNumber}
                    />
                ))
            )}
        </div>
    );
};

/**
 * Individual Watchlist Card Component
 */
const WatchlistCard = ({ stock, onRemove, onNavigate, formatNumber }) => {
    const isPositive = parseFloat(stock.change) >= 0;

    const handleClick = (e) => {
        // Don't navigate if clicking the remove button
        if (e.target.closest('.close-btn')) return;
        onNavigate(stock.symbol);
    };

    return (
        <div
            className="card portfolio-item-card"
            style={{ position: 'relative', cursor: 'pointer' }}
            onClick={handleClick}
        >
            <span
                className="close-btn"
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove(stock.symbol);
                }}
                title="Remove from Watchlist"
                aria-label="Remove from watchlist"
            >
                &times;
            </span>

            <div className="card-header">
                <h3 style={{ color: 'var(--accent-green)', textDecoration: 'underline' }}>{stock.symbol}</h3>
            </div>

            <div className="portfolio-card-body">
                <div className="side1">
                    <div className="stat-row">
                        <span
                            className="stat-label"
                            style={{ alignSelf: 'center', fontSize: '1.2rem', fontWeight: '500' }}
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
