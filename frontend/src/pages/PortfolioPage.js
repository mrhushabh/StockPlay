import React, { useEffect, memo, useCallback } from 'react';
import { Button } from 'react-bootstrap';
import { usePortfolio, useWallet } from '../context/AppContext';
import { useNumberFormat } from '../hooks/useStock';
import { LoadingSpinner, ErrorDisplay, EmptyState, Card, StatRow } from '../components/shared';
import './App.css';

/**
 * Portfolio Page Component
 * Uses context for state management, memoized for performance
 */
const PortfolioPage = memo(() => {
    const { holdings, loading, error, refetch, openBuyModal, openSellModal } = usePortfolio();
    const { balance, refetch: refetchWallet } = useWallet();
    const { formatNumber, formatCurrency } = useNumberFormat();

    useEffect(() => {
        refetch();
        refetchWallet();
    }, [refetch, refetchWallet]);

    if (loading) {
        return (
            <div className="portfolio-container">
                <PageHeader title="My Portfolio" balance={balance} formatCurrency={formatCurrency} />
                <LoadingSpinner message="Loading portfolio..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="portfolio-container">
                <PageHeader title="My Portfolio" balance={balance} formatCurrency={formatCurrency} />
                <ErrorDisplay message={error} onRetry={refetch} />
            </div>
        );
    }

    return (
        <div className="portfolio-container">
            <PageHeader title="My Portfolio" balance={balance} formatCurrency={formatCurrency} />

            {holdings.length === 0 ? (
                <EmptyState
                    icon="📊"
                    title="Your portfolio is empty"
                    message="Start trading to build your portfolio!"
                />
            ) : (
                holdings.map((stock) => (
                    <PortfolioCard
                        key={stock.stockName || stock._id}
                        stock={stock}
                        onBuy={openBuyModal}
                        onSell={openSellModal}
                        formatNumber={formatNumber}
                    />
                ))
            )}
        </div>
    );
});

PortfolioPage.displayName = 'PortfolioPage';

/**
 * Page Header with Balance
 */
const PageHeader = memo(({ title, balance, formatCurrency }) => (
    <div className="portfolio-header">
        <h1>{title}</h1>
        <h4>Money in Wallet: {formatCurrency(balance)}</h4>
    </div>
));

PageHeader.displayName = 'PageHeader';

/**
 * Portfolio Card Component
 */
const PortfolioCard = memo(({ stock, onBuy, onSell, formatNumber }) => {
    const handleBuy = useCallback(() => {
        onBuy(stock);
    }, [onBuy, stock]);

    const handleSell = useCallback(() => {
        onSell(stock);
    }, [onSell, stock]);

    const change = parseFloat(stock.change) || 0;
    const isPositive = change >= 0;

    return (
        <Card className="portfolio-item-card">
            <div className="card-header">
                <h3>{stock.stockName}</h3>
            </div>

            <div className="portfolio-card-body">
                <div className="side1">
                    <StatRow label="Quantity" value={stock.quantity} />
                    <StatRow label="Avg. Cost/Share" value={`$${formatNumber(stock.Average)}`} />
                    <StatRow label="Total Cost" value={`$${formatNumber(stock.Total)}`} />
                </div>

                <div className="side2">
                    <StatRow
                        label="Change"
                        value={formatNumber(change)}
                        valueClass={isPositive ? 'text-green' : 'text-red'}
                    />
                    <StatRow label="Current Price" value={`$${formatNumber(stock.price)}`} />
                    <StatRow label="Market Value" value={`$${formatNumber(stock.MarketV)}`} />
                </div>
            </div>

            <div className="card-footer bg-transparent border-0">
                <Button variant="success" className="mr-2" onClick={handleBuy}>
                    Buy
                </Button>
                <Button variant="danger" onClick={handleSell}>
                    Sell
                </Button>
            </div>
        </Card>
    );
});

PortfolioCard.displayName = 'PortfolioCard';

export { PortfolioPage };
export default PortfolioPage;
