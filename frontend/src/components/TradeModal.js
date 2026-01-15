import React, { memo, useState, useCallback } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { useModals, usePortfolio, useWallet } from '../context/AppContext';
import { useNumberFormat } from '../hooks/useStock';

/**
 * Trade Modal Component - Handles Buy/Sell operations
 * Decoupled from parent components, uses context for state
 */
const TradeModal = memo(() => {
    const { buy: showBuy, sell: showSell, selectedStock, closeModals } = useModals();
    const { buyStock, sellStock } = usePortfolio();
    const { balance } = useWallet();
    const { formatNumber, formatCurrency } = useNumberFormat();

    const [quantity, setQuantity] = useState(0);
    const [error, setError] = useState('');

    const show = showBuy || showSell;
    const isBuy = showBuy;
    const title = isBuy ? 'Buy' : 'Sell';

    const handleClose = useCallback(() => {
        setQuantity(0);
        setError('');
        closeModals();
    }, [closeModals]);

    const handleQuantityChange = useCallback((e) => {
        const value = parseInt(e.target.value) || 0;
        setQuantity(Math.max(0, value));
        setError('');
    }, []);

    const handleConfirm = useCallback(async () => {
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
        }
    }, [selectedStock, quantity, isBuy, balance, buyStock, sellStock, handleClose]);

    if (!selectedStock) return null;

    const price = parseFloat(selectedStock.price) || 0;
    const total = quantity * price;
    const maxQuantity = !isBuy ? (selectedStock.quantity || 0) : undefined;

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    {title} {selectedStock.stockName || selectedStock.symbol}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
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

                <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f5f8fa', borderRadius: '8px' }}>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
                        Total: {formatCurrency(total)}
                    </p>
                </div>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>
                <Button
                    variant={isBuy ? 'success' : 'danger'}
                    onClick={handleConfirm}
                    disabled={quantity <= 0}
                >
                    {title} {quantity > 0 ? `${quantity} shares` : ''}
                </Button>
            </Modal.Footer>
        </Modal>
    );
});

TradeModal.displayName = 'TradeModal';

export default TradeModal;
