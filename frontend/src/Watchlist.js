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

    const handleRemoveCard = async(symbol1) => {
        try {
            await axios.post(`http://localhost:3001/api/removefav/`, { symbol: symbol1 }); 
            // After successful removal, refetch watchlist data
            fetchData();
        } catch (error) {
            console.error('Error removing stock from watchlist:', error);
        }
    };

    return (
        <div>
            <h2>My Watchlist</h2>
            {data.map((item, index) => (
                <Card key={index} className="watchlist-card">
                     <span className="clos" onClick={() => handleRemoveCard(item.symbol)}
                        style={{ position: 'absolute', top: '5px', left: '5px', cursor: 'pointer' }}>&times;</span>
                    <Card.Body>
                        <Row>
                            <Col>
                                <Card.Title>{item.symbol}</Card.Title>
                                <Card.Text>{item.stockName}</Card.Text>
                            </Col>
                            <Col className="text-right">
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span className="triangle" style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: `5px solid ${item.change > 0 ? 'green' : 'red'}`, marginRight: '5px', transform: `rotate(${item.change > 0 ? 0 : 180}deg)` }}></span>
                                    <Card.Text style={{ color: item.change > 0 ? 'green' : 'red' }}>{item.change}</Card.Text>
                                </div>
                                <Card.Text style={{ color: item.change > 0 ? 'green' : 'red' }}>{item.price}</Card.Text>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            ))}
        </div>
    );
};
