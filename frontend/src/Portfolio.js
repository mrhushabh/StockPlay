import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { Button, Modal, Form } from 'react-bootstrap';

export const Portfolio = () => {
    const [data, setData] = useState([]);
    const [Money, setMoney] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showSellModal, setShowSellModal] = useState(false);
    const [quantity, setQuantity] = useState(0);
    const [selectedStock, setSelectedStock] = useState(null); // State variable to store the selected stock
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.post('http://localhost:3001/api/portfolio');
                const response2 = await axios.post('http://localhost:3001/api/Money');
                setData(response.data);
                setMoney(response2);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    const handleShowModal = (stock) => {
        setSelectedStock(stock); // Set the selected stock when opening the modal
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleShowSellModal = (stock) => {
        setSelectedStock(stock); // Set the selected stock when opening the modal
        setShowSellModal(true);
    };

    const handleCloseSellModal = () => {
        setShowSellModal(false);
    };

    const handleDecreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const handleIncreaseQuantity = () => {
        setQuantity(quantity + 1);
    };

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value >= 0) {
            setQuantity(value);
        }
    };

    const handleBuy = async (stock) => {
        setSelectedStock(stock);
        if (!selectedStock) return; // Check if a stock is selected
        try {
            const totalAmount = quantity * parseFloat(selectedStock.price);
            const response = await axios.post('http://localhost:3001/api/buy', {
                quantity,
                price: selectedStock.price,
                stockName: selectedStock.stockName,
                change: selectedStock.change,
            });
            setErrorMessage('');
            console.log(response.data); // Handle success response
        } catch (error) {
            console.error('Error buying stock:', error); // Handle error
        }
        handleCloseModal();
    };

    const handleSell = async (stock) => {
        setSelectedStock(stock);
        if (!selectedStock) return; // Check if a stock is selected
        try {
            const response1 = await axios.post('http://localhost:3001/api/sell', {
                quantity,
                price: selectedStock.price,
                stockName: selectedStock.stockName,
            });
            console.log(response1.data); // Handle success response
            setErrorMessage('');
        } catch (error) {
            console.error('Error selling stock:', error); // Handle error
        }
        handleCloseSellModal();
    };

    return (
        <div className="portfolio-container">
            {Money && Money.data && Money.data.Money !== undefined && (
                <div className="portfolio-header">
                    <h1>My Portfolio</h1>
                    <h4>Money in Wallet: ${parseFloat(Money.data.Money).toFixed(2)}</h4>
                </div>
            )}
            {data.map((item, index) => (
                <div key={index}>
                    <div className="card portfolio-item-card" id={`card-${index}`}>
                        <div className="card-header" >
                            <h3>{item.stockName}</h3>
                        </div>
                        <div className="portfolio-card-body" >
                            <div className='side1'>
                                <div className="stat-row">
                                    <span className="stat-label">Quantity:</span>
                                    <span className="stat-value">{item.quantity}</span>
                                </div>
                                <div className="stat-row">
                                    <span className="stat-label">Avg. Cost/Share:</span>
                                    <span className="stat-value">{parseFloat(item.Average).toFixed(2)}</span>
                                </div>
                                <div className="stat-row">
                                    <span className="stat-label">Total Cost:</span>
                                    <span className="stat-value">{parseFloat(item.Total).toFixed(2)}</span>
                                </div>
                            </div>
                            <div className='side2'>
                                <div className="stat-row">
                                    <span className="stat-label">Change:</span>
                                    <span className={`stat-value ${parseFloat(item.change) >= 0 ? 'text-green' : 'text-red'}`}>
                                        {parseFloat(item.change).toFixed(2)}
                                    </span>
                                </div>
                                <div className="stat-row">
                                    <span className="stat-label">Current Price:</span>
                                    <span className="stat-value">{parseFloat(item.price).toFixed(2)}</span>
                                </div>
                                <div className="stat-row">
                                    <span className="stat-label">Market Value:</span>
                                    <span className="stat-value">{parseFloat(item.Total).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="card-footer bg-transparent border-0">
                            <button type="button" className="btn btn-success mr-2" onClick={() => handleShowModal(item)}>Buy</button>
                            <Button variant="danger" onClick={() => handleShowSellModal(item)}>Sell</Button>
                        </div>
                    </div>

                    <Modal show={showModal} onHide={handleCloseModal}>
                        <Modal.Header closeButton>
                            <Modal.Title>{selectedStock && selectedStock.stockName}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p>Current Price: {selectedStock && selectedStock.price}</p>
                            <Form.Group>
                                <Form.Label>Quantity</Form.Label>
                                <div className="d-flex">
                                    <Form.Control type="number" value={quantity} onChange={handleQuantityChange} />
                                </div>
                            </Form.Group>
                        </Modal.Body>
                        <Modal.Footer >
                            <p>Total: {selectedStock && (quantity * selectedStock.price)}</p>
                            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                            <Button variant="primary" onClick={() => handleBuy(item)} id='buy'>Buy</Button>
                        </Modal.Footer>
                    </Modal>
                    <Modal show={showSellModal} onHide={handleCloseSellModal}>
                        <Modal.Header closeButton>
                            <Modal.Title>{selectedStock && selectedStock.stockName}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p>Current Price: {selectedStock && selectedStock.price}</p>
                            <Form.Group>
                                <Form.Label>Quantity</Form.Label>
                                <div className="d-flex align-items-center">
                                    <Form.Control type="number" value={quantity} onChange={handleQuantityChange} />
                                </div>
                            </Form.Group>
                        </Modal.Body>
                        <Modal.Footer>
                            <p>Total: {selectedStock && (quantity * selectedStock.price)}</p>
                            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                            <Button variant="danger" onClick={() => handleSell(item)}>Sell</Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            ))}
        </div>
    );
};
