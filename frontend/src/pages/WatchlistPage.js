import React, { useEffect, memo, useCallback } from 'react';
import { useWatchlistContext } from '../context/AppContext';
import { useNumberFormat } from '../hooks/useStock';
import { LoadingSpinner, ErrorDisplay, EmptyState, Card, StatRow } from '../components/shared';
import './App.css';

/**
 * Watchlist Page Component
 * Uses context for state management, memoized for performance
 */
const WatchlistPage = memo(() => {
    const { items, loading, error, refetch, removeFromWatchlist } = useWatchlistContext();
    const { formatNumber } = useNumberFormat();

    useEffect(() => {
        refetch();
    }, [refetch]);

    if (loading) {
        return (
            <div className="portfolio-container">
                <PageHeader title="My Watchlist" />
                <LoadingSpinner message="Loading watchlist..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="portfolio-container">
                <PageHeader title="My Watchlist" />
                <ErrorDisplay message={error} onRetry={refetch} />
            </div>
        );
    }

    return (
        <div className="portfolio-container">
            <PageHeader title="My Watchlist" />

            {items.length === 0 ? (
                <EmptyState
                    icon="⭐"
                    title="Your watchlist is empty"
                    message="Search for stocks and add them to your watchlist to track them here."
                />
            ) : (
                items.map((stock) => (
                    <WatchlistCard
                        key={stock.symbol}
                        stock={stock}
                        onRemove={removeFromWatchlist}
                        formatNumber={formatNumber}
                    />
                ))
            )}
        </div>
    );
});

WatchlistPage.displayName = 'WatchlistPage';

/**
 * Page Header Component
 */
const PageHeader = memo(({ title, subtitle }) => (
    <div className="portfolio-header">
        <h1>{title}</h1>
        {subtitle && <h4>{subtitle}</h4>}
    </div>
));

PageHeader.displayName = 'PageHeader';

/**
 * Watchlist Card Component
 */
const WatchlistCard = memo(({ stock, onRemove, formatNumber }) => {
    const handleRemove = useCallback(() => {
        onRemove(stock.symbol);
    }, [onRemove, stock.symbol]);

    const change = parseFloat(stock.change) || 0;
    const isPositive = change >= 0;

    return (
        <Card className="portfolio-item-card" style={{ position: 'relative' }}>
            <button
                className="close-btn"
                onClick={handleRemove}
                title="Remove from Watchlist"
                aria-label="Remove from watchlist"
            >
                ×
            </button>

            <div className="card-header">
                <h3>{stock.symbol}</h3>
            </div>

            <div className="portfolio-card-body">
                <div className="side1">
                    <div className="stat-row">
                        <span
                            className="stat-label"
                            style={{ fontSize: '1.2rem', fontWeight: '500', color: '#000' }}
                        >
                            {stock.stockName}
                        </span>
                    </div>
                </div>

                <div className="side2">
                    <StatRow
                        label="Change"
                        value={
                            <>
                                {formatNumber(change)}
                                <span style={{ fontSize: '0.8em', marginLeft: '5px' }}>
                                    {isPositive ? '▲' : '▼'}
                                </span>
                            </>
                        }
                        valueClass={isPositive ? 'text-green' : 'text-red'}
                    />
                    <StatRow
                        label="Price"
                        value={`$${formatNumber(stock.price)}`}
                        valueClass={isPositive ? 'text-green' : 'text-red'}
                    />
                </div>
            </div>
        </Card>
    );
});

WatchlistCard.displayName = 'WatchlistCard';

export { WatchlistPage };
export default WatchlistPage;
