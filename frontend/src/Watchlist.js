import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';
import Card from 'react-bootstrap/Card';

export const Watchlist = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.post('http://localhost:3001/api/watchlist');
            setData(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleRemoveCard = async (symbol1) => {
        try {
            await axios.post(`http://localhost:3001/api/removefav/`, { symbol: symbol1 });
            // After successful removal, refetch watchlist data
            fetchData();
        } catch (error) {
            console.error('Error removing stock from watchlist:', error);
        }
    };

    return (
        <div className="portfolio-container"> {/* Reuse container style */}
            <div className="portfolio-header"> {/* Reuse header style */}
                <h1>My Watchlist</h1>
            </div>
            {data.map((item, index) => (
                <div key={index} className="card portfolio-item-card" style={{ position: 'relative' }}>
                    <span
                        className="close-btn"
                        onClick={() => handleRemoveCard(item.symbol)}
                        title="Remove from Watchlist"
                    >
                        &times;
                    </span>
                    <div className="card-header">
                        <h3>{item.symbol}</h3>
                    </div>
                    <div className="portfolio-card-body">
                        <div className='side1'>
                            <div className="stat-row">
                                <span className="stat-label" style={{ alignSelf: "center", fontSize: "1.2rem", fontWeight: "500", color: "#000" }}>{item.stockName}</span>
                            </div>
                        </div>
                        <div className='side2'>
                            <div className="stat-row">
                                <span className="stat-label">Change:</span>
                                <span className={`stat-value ${item.change >= 0 ? 'text-green' : 'text-red'}`}>
                                    {item.change}
                                    <span style={{ fontSize: '0.8em', marginLeft: '5px' }}>
                                        {item.change >= 0 ? '▲' : '▼'}
                                    </span>
                                </span>
                            </div>
                            <div className="stat-row">
                                <span className="stat-label">Current Price:</span>
                                <span className={`stat-value ${item.change >= 0 ? 'text-green' : 'text-red'}`}>
                                    {item.price}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            {data.length === 0 && (
                <div className="text-center p-5">
                    <h4 className="text-muted">Your watchlist is empty.</h4>
                </div>
            )}
        </div>
    );
};
