import React, { memo, useState, useCallback } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { useModals, usePortfolio, useWallet } from '../context/AppContext';
import { useNumberFormat } from '../hooks/useStock';

/**
 * Trade Modal Component - Handles Buy/Sell operations with confirmation
 * Decoupled from parent components, uses context for state
 */
const TradeModal = memo(() => {
    const { buy: showBuy, sell: showSell, selectedStock, closeModals } = useModals();
    const { buyStock, sellStock } = usePortfolio();
    const { balance } = useWallet();
    const { formatNumber, formatCurrency } = useNumberFormat();

    const [quantity, setQuantity] = useState(0);
    const [error, setError] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);

    const show = showBuy || showSell;
    const isBuy = showBuy;
    const title = isBuy ? 'Buy' : 'Sell';

    const handleClose = useCallback(() => {
        setQuantity(0);
        setError('');
        setShowConfirmation(false);
        closeModals();
    }, [closeModals]);

    const handleQuantityChange = useCallback((e) => {
        const value = parseInt(e.target.value) || 0;
        setQuantity(Math.max(0, value));
        setError('');
    }, []);

    // Show confirmation view
    const handleShowConfirmation = useCallback(() => {
        if (!selectedStock || quantity <= 0) {
            setError('Please enter a valid quantity');
            return;
        }

        const price = parseFloat(selectedStock.price) || 0;
        const total = quantity * price;

        if (isBuy && total > balance) {
            setError('Insufficient funds');
            return;
        }

        if (!isBuy && quantity > (selectedStock.quantity || 0)) {
            setError('Insufficient shares');
            return;
        }

        setError('');
        setShowConfirmation(true);
    }, [selectedStock, quantity, isBuy, balance]);

    // Go back to quantity entry
    const handleBack = useCallback(() => {
        setShowConfirmation(false);
    }, []);

    // Execute the trade
    const handleConfirmTrade = useCallback(async () => {
        if (!selectedStock || quantity <= 0) return;

        const price = parseFloat(selectedStock.price) || 0;
        const tradeData = {
            quantity,
            price,
            stockName: selectedStock.stockName || selectedStock.name
        };

        try {
            if (isBuy) {
                await buyStock(tradeData);
            } else {
                await sellStock(tradeData);
            }
            handleClose();
        } catch (err) {
            setError(err.message || 'Transaction failed');
            setShowConfirmation(false);
        }
    }, [selectedStock, quantity, isBuy, buyStock, sellStock, handleClose]);

    if (!selectedStock) return null;

    const price = parseFloat(selectedStock.price) || 0;
    const total = quantity * price;
    const maxQuantity = !isBuy ? (selectedStock.quantity || 0) : undefined;

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    {showConfirmation ? 'Confirm Order' : `${title} ${selectedStock.stockName || selectedStock.symbol}`}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {!showConfirmation ? (
                    // Quantity entry view
                    <>
                        <div style={{ marginBottom: '16px' }}>
                            <p><strong>Current Price:</strong> {formatCurrency(price)}</p>
                            {!isBuy && <p><strong>Available Shares:</strong> {maxQuantity}</p>}
                            {isBuy && <p><strong>Available Balance:</strong> {formatCurrency(balance)}</p>}
                        </div>

                        <Form.Group>
                            <Form.Label>Quantity</Form.Label>
                            <Form.Control
                                type="number"
                                min="0"
                                max={maxQuantity}
                                value={quantity}
                                onChange={handleQuantityChange}
                                placeholder="Enter quantity"
                            />
                        </Form.Group>

                        {error && (
                            <p style={{ color: '#ff5000', marginTop: '12px' }}>{error}</p>
                        )}

                        <div style={{ marginTop: '20px', padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                            <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
                                Total: {formatCurrency(total)}
                            </p>
                        </div>
                    </>
                ) : (
                    // Confirmation view
                    <>
                        <div style={{
                            padding: '20px',
                            backgroundColor: 'var(--bg-secondary)',
                            borderRadius: '12px',
                            border: `2px solid ${isBuy ? 'var(--accent-green)' : 'var(--accent-orange)'}`
                        }}>
                            <h5 style={{ marginBottom: '20px', textAlign: 'center', color: isBuy ? 'var(--accent-green)' : 'var(--accent-orange)' }}>
                                {isBuy ? '📈 Buy Order' : '📉 Sell Order'}
                            </h5>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Stock:</span>
                                <span style={{ fontWeight: 'bold' }}>{selectedStock.stockName || selectedStock.symbol}</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Symbol:</span>
                                <span style={{ fontWeight: 'bold', color: 'var(--accent-green)' }}>{selectedStock.symbol}</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Quantity:</span>
                                <span style={{ fontWeight: 'bold' }}>{quantity} shares</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Price per Share:</span>
                                <span style={{ fontWeight: 'bold' }}>{formatCurrency(price)}</span>
                            </div>

                            <hr style={{ borderColor: 'var(--border-color)', margin: '16px 0' }} />

                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Total:</span>
                                <span style={{ fontSize: '18px', fontWeight: 'bold', color: isBuy ? 'var(--accent-green)' : 'var(--accent-orange)' }}>
                                    {formatCurrency(total)}
                                </span>
                            </div>
                        </div>

                        <p style={{ textAlign: 'center', marginTop: '16px', color: 'var(--text-muted)', fontSize: '0.9em' }}>
                            Are you sure you want to {isBuy ? 'buy' : 'sell'} {quantity} shares of {selectedStock.symbol}?
                        </p>

                        {error && (
                            <p style={{ color: '#ff5000', marginTop: '12px', textAlign: 'center' }}>{error}</p>
                        )}
                    </>
                )}
            </Modal.Body>

            <Modal.Footer>
                {!showConfirmation ? (
                    // Buttons for quantity entry view
                    <>
                        <Button variant="secondary" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button
                            variant={isBuy ? 'success' : 'danger'}
                            onClick={handleShowConfirmation}
                            disabled={quantity <= 0}
                        >
                            {title} {quantity > 0 ? `${quantity} shares` : ''}
                        </Button>
                    </>
                ) : (
                    // Buttons for confirmation view
                    <>
                        <Button variant="secondary" onClick={handleBack}>
                            ← Back
                        </Button>
                        <Button
                            variant={isBuy ? 'success' : 'danger'}
                            onClick={handleConfirmTrade}
                        >
                            ✓ Confirm {title}
                        </Button>
                    </>
                )}
            </Modal.Footer>
        </Modal>
    );
});

TradeModal.displayName = 'TradeModal';

export default TradeModal;

