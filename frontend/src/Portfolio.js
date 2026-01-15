import React, { useState, useEffect, useCallback } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import { portfolioApi, walletApi } from './services/api';
import { useNumberFormat } from './hooks/useStock';
import './App.css';

/**
 * Portfolio Component
 * Displays user's stock holdings with buy/sell functionality
 * Refactored to use centralized API service and proper patterns
 */
export const Portfolio = () => {
    const [holdings, setHoldings] = useState([]);
    const [walletBalance, setWalletBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal states
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [showSellModal, setShowSellModal] = useState(false);
    const [selectedStock, setSelectedStock] = useState(null);
    const [quantity, setQuantity] = useState(0);

    const { formatNumber, formatCurrency } = useNumberFormat();

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [portfolioRes, walletRes] = await Promise.all([
                portfolioApi.getAll(),
                walletApi.getMoney()
            ]);

            setHoldings(portfolioRes.data || []);
            setWalletBalance(walletRes.data?.Money || 0);
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

        const totalCost = quantity * parseFloat(selectedStock.price);
        if (totalCost > walletBalance) {
            alert('Insufficient funds');
            return;
        }

        try {
            await portfolioApi.buy({
                quantity: parseInt(quantity),
                price: parseFloat(selectedStock.price),
                stockName: selectedStock.stockName,
            });
            setShowBuyModal(false);
            fetchData(); // Refresh data
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
                price: parseFloat(selectedStock.price),
                stockName: selectedStock.stockName,
            });
            setShowSellModal(false);
            fetchData(); // Refresh data
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
            </div>

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
                        formatNumber={formatNumber}
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
 * Individual Portfolio Card Component
 */
const PortfolioCard = ({ stock, onBuy, onSell, formatNumber }) => {
    const change = parseFloat(stock.change) || 0;
    const isPositive = change >= 0;

    return (
        <div className="card portfolio-item-card">
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
                <button
                    type="button"
                    className="btn btn-success mr-2"
                    onClick={() => onBuy(stock)}
                >
                    Buy
                </button>
                <Button variant="danger" onClick={() => onSell(stock)}>
                    Sell
                </Button>
            </div>
        </div>
    );
};

/**
 * Stat Row Component for consistent display
 */
const StatRow = ({ label, value, valueClass = '' }) => (
    <div className="stat-row">
        <span className="stat-label">{label}:</span>
        <span className={`stat-value ${valueClass}`}>{value}</span>
    </div>
);

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

    const total = quantity * parseFloat(stock.price || 0);

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Current Price: ${formatNumber(stock.price)}</p>
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
