import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal, Form } from 'react-bootstrap';
import { portfolioApi, walletApi } from './services/api';
import { useNumberFormat } from './hooks/useStock';
import './App.css';

/**
 * Portfolio Component
 * Displays user's stock holdings with P/L calculation
 */
export const Portfolio = () => {
    const [holdings, setHoldings] = useState([]);
    const [summary, setSummary] = useState(null);
    const [walletBalance, setWalletBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal states
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [showSellModal, setShowSellModal] = useState(false);
    const [selectedStock, setSelectedStock] = useState(null);
    const [quantity, setQuantity] = useState(0);

    const { formatNumber, formatCurrency } = useNumberFormat();
    const navigate = useNavigate();

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [portfolioRes, walletRes] = await Promise.all([
                portfolioApi.getAll(),
                walletApi.getMoney()
            ]);

            // Handle new format with holdings array and summary
            if (portfolioRes.data.holdings) {
                setHoldings(portfolioRes.data.holdings);
                setSummary(portfolioRes.data.summary);
            } else if (Array.isArray(portfolioRes.data)) {
                setHoldings(portfolioRes.data);
            } else {
                // Legacy format - convert object to array
                const holdingsArray = Object.values(portfolioRes.data).filter(
                    item => item && typeof item === 'object' && item.stockName
                );
                setHoldings(holdingsArray);
            }

            setWalletBalance(walletRes.data?.Money || walletRes.data?.balance || 0);
        } catch (err) {
            setError('Failed to load portfolio data');
            console.error('Error fetching portfolio:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleReset = async () => {
        if (window.confirm('Are you sure you want to reset your portfolio? This will delete all holdings and reset your balance to $25,000.')) {
            try {
                await portfolioApi.reset();
                fetchData();
            } catch (err) {
                console.error('Reset failed:', err);
            }
        }
    };

    const handleOpenBuyModal = (stock) => {
        setSelectedStock(stock);
        setQuantity(0);
        setShowBuyModal(true);
    };

    const handleOpenSellModal = (stock) => {
        setSelectedStock(stock);
        setQuantity(0);
        setShowSellModal(true);
    };

    const handleBuy = async () => {
        if (!selectedStock || quantity <= 0) return;

        const price = parseFloat(selectedStock.currentPrice || selectedStock.price) || 0;
        const totalCost = quantity * price;

        if (totalCost > walletBalance) {
            alert('Insufficient funds');
            return;
        }

        try {
            await portfolioApi.buy({
                quantity: parseInt(quantity),
                price: price,
                stockName: selectedStock.stockName,
            });
            setShowBuyModal(false);
            fetchData();
        } catch (err) {
            console.error('Error buying stock:', err);
            alert('Failed to complete purchase');
        }
    };

    const handleSell = async () => {
        if (!selectedStock || quantity <= 0) return;

        if (quantity > selectedStock.quantity) {
            alert('Insufficient stock quantity');
            return;
        }

        try {
            await portfolioApi.sell({
                quantity: parseInt(quantity),
                price: parseFloat(selectedStock.currentPrice || selectedStock.price),
                stockName: selectedStock.stockName,
            });
            setShowSellModal(false);
            fetchData();
        } catch (err) {
            console.error('Error selling stock:', err);
            alert('Failed to complete sale');
        }
    };

    if (loading) {
        return (
            <div className="portfolio-container">
                <div className="portfolio-header">
                    <h1>My Portfolio</h1>
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
                    <h1>My Portfolio</h1>
                </div>
                <div className="text-center p-5">
                    <p className="text-danger">{error}</p>
                    <button className="btn btn-primary" onClick={fetchData}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="portfolio-container">
            <div className="portfolio-header">
                <h1>My Portfolio</h1>
                <h4>Money in Wallet: {formatCurrency(walletBalance)}</h4>
                <Button variant="outline-secondary" size="sm" onClick={handleReset} className="mt-2">
                    Reset Portfolio
                </Button>
            </div>

            {/* Portfolio Summary */}
            {summary && (
                <div className="card portfolio-summary-card mb-4">
                    <div className="card-header">
                        <h4>Portfolio Summary</h4>
                    </div>
                    <div className="portfolio-card-body">
                        <div className="side1">
                            <div className="stat-row">
                                <span className="stat-label">Total Invested:</span>
                                <span className="stat-value">{formatCurrency(summary.totalInvested)}</span>
                            </div>
                            <div className="stat-row">
                                <span className="stat-label">Market Value:</span>
                                <span className="stat-value">{formatCurrency(summary.totalMarketValue)}</span>
                            </div>
                        </div>
                        <div className="side2">
                            <div className="stat-row">
                                <span className="stat-label">Unrealized P/L:</span>
                                <span className={`stat-value ${summary.totalUnrealizedPL >= 0 ? 'text-green' : 'text-red'}`}>
                                    {formatCurrency(summary.totalUnrealizedPL)}
                                    <span style={{ fontSize: '0.8em', marginLeft: '5px' }}>
                                        ({summary.totalUnrealizedPL >= 0 ? '+' : ''}{formatNumber(summary.totalUnrealizedPLPercent)}%)
                                    </span>
                                </span>
                            </div>
                            <div className="stat-row">
                                <span className="stat-label">Realized P/L:</span>
                                <span className={`stat-value ${summary.totalRealizedPL >= 0 ? 'text-green' : 'text-red'}`}>
                                    {formatCurrency(summary.totalRealizedPL)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {holdings.length === 0 ? (
                <div className="text-center p-5">
                    <h4 className="text-muted">Your portfolio is empty.</h4>
                    <p className="text-muted">Search for stocks and start trading!</p>
                </div>
            ) : (
                holdings.map((stock, index) => (
                    <PortfolioCard
                        key={stock.stockName || index}
                        stock={stock}
                        onBuy={handleOpenBuyModal}
                        onSell={handleOpenSellModal}
                        onNavigate={(symbol) => navigate(`/analytics/${symbol}`)}
                        formatNumber={formatNumber}
                        formatCurrency={formatCurrency}
                    />
                ))
            )}

            {/* Buy Modal */}
            <TradeModal
                show={showBuyModal}
                onHide={() => setShowBuyModal(false)}
                title={`Buy ${selectedStock?.stockName || ''}`}
                stock={selectedStock}
                quantity={quantity}
                onQuantityChange={setQuantity}
                onConfirm={handleBuy}
                confirmText="Buy"
                confirmVariant="success"
                formatNumber={formatNumber}
            />

            {/* Sell Modal */}
            <TradeModal
                show={showSellModal}
                onHide={() => setShowSellModal(false)}
                title={`Sell ${selectedStock?.stockName || ''}`}
                stock={selectedStock}
                quantity={quantity}
                onQuantityChange={setQuantity}
                onConfirm={handleSell}
                confirmText="Sell"
                confirmVariant="danger"
                formatNumber={formatNumber}
                maxQuantity={selectedStock?.quantity}
            />
        </div>
    );
};

/**
 * Portfolio Card Component with P/L display
 */
const PortfolioCard = ({ stock, onBuy, onSell, onNavigate, formatNumber, formatCurrency }) => {
    const unrealizedPL = stock.unrealizedPL || stock.change || 0;
    const unrealizedPLPercent = stock.unrealizedPLPercent || 0;
    const isPositive = unrealizedPL >= 0;

    const handleStockClick = () => {
        const symbol = stock.symbol || stock.stockName;
        if (symbol && onNavigate) {
            onNavigate(symbol);
        }
    };

    return (
        <div className="card portfolio-item-card">
            <div className="card-header" style={{ cursor: 'pointer' }} onClick={handleStockClick}>
                <h3 style={{ color: '#00c805', textDecoration: 'underline' }}>{stock.stockName}</h3>
                {stock.realizedPL !== undefined && stock.realizedPL !== 0 && (
                    <span className={`badge ${stock.realizedPL >= 0 ? 'bg-success' : 'bg-danger'}`}>
                        Realized: {formatCurrency(stock.realizedPL)}
                    </span>
                )}
            </div>

            <div className="portfolio-card-body">
                <div className="side1">
                    <div className="stat-row">
                        <span className="stat-label">Quantity:</span>
                        <span className="stat-value">{stock.quantity}</span>
                    </div>
                    <div className="stat-row">
                        <span className="stat-label">Avg. Cost:</span>
                        <span className="stat-value">{formatCurrency(stock.averageCost || stock.Average)}</span>
                    </div>
                    <div className="stat-row">
                        <span className="stat-label">Total Cost:</span>
                        <span className="stat-value">{formatCurrency(stock.totalCost || stock.Total)}</span>
                    </div>
                </div>

                <div className="side2">
                    <div className="stat-row">
                        <span className="stat-label">Current Price:</span>
                        <span className="stat-value">{formatCurrency(stock.currentPrice || stock.price)}</span>
                    </div>
                    <div className="stat-row">
                        <span className="stat-label">Market Value:</span>
                        <span className="stat-value">{formatCurrency(stock.marketValue || stock.MarketV)}</span>
                    </div>
                    <div className="stat-row">
                        <span className="stat-label">Unrealized P/L:</span>
                        <span className={`stat-value ${isPositive ? 'text-green' : 'text-red'}`}>
                            {formatCurrency(unrealizedPL)}
                            <span style={{ fontSize: '0.8em', marginLeft: '5px' }}>
                                ({isPositive ? '+' : ''}{formatNumber(unrealizedPLPercent)}%)
                                {isPositive ? ' ▲' : ' ▼'}
                            </span>
                        </span>
                    </div>
                </div>
            </div>

            <div className="card-footer bg-transparent border-0">
                <Button variant="success" className="mr-2" onClick={() => onBuy(stock)}>
                    Buy More
                </Button>
                <Button variant="danger" onClick={() => onSell(stock)}>
                    Sell
                </Button>
            </div>
        </div>
    );
};

/**
 * Reusable Trade Modal Component
 */
const TradeModal = ({
    show,
    onHide,
    title,
    stock,
    quantity,
    onQuantityChange,
    onConfirm,
    confirmText,
    confirmVariant,
    formatNumber,
    maxQuantity
}) => {
    if (!stock) return null;

    const price = parseFloat(stock.currentPrice || stock.price) || 0;
    const total = quantity * price;

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Current Price: ${formatNumber(price)}</p>
                {maxQuantity !== undefined && (
                    <p>Available Quantity: {maxQuantity}</p>
                )}
                <Form.Group>
                    <Form.Label>Quantity</Form.Label>
                    <Form.Control
                        type="number"
                        min="0"
                        max={maxQuantity}
                        value={quantity}
                        onChange={(e) => onQuantityChange(parseInt(e.target.value) || 0)}
                    />
                </Form.Group>
                <p className="mt-3">
                    <strong>Total: ${formatNumber(total)}</strong>
                </p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Cancel
                </Button>
                <Button
                    variant={confirmVariant}
                    onClick={onConfirm}
                    disabled={quantity <= 0}
                >
                    {confirmText}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default Portfolio;
