import React from 'react';
import { Button } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RecommendationCard = ({ stock, onAddWatchlist, formatCurrency }) => {
    const navigate = useNavigate();
    const isBullish = stock.sentiment === 'Bullish' || stock.sentiment === 'Positive';

    // Risk badge color
    const getRiskColor = (risk) => {
        switch (risk?.toLowerCase()) {
            case 'high': return '#dc3545';
            case 'medium': return '#ffc107';
            case 'low': return '#28a745';
            default: return '#6c757d';
        }
    };

    return (
        <div className="card recommendation-card" style={{
            minWidth: '320px',
            maxWidth: '320px',
            flex: '0 0 auto',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            backgroundColor: 'var(--bg-secondary)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{
                        margin: 0,
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 700,
                        fontSize: '1.5rem',
                        cursor: 'pointer'
                    }} onClick={() => navigate(`/analytics/${stock.symbol}`)}>
                        {stock.symbol}
                    </h3>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{stock.name}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>
                        {stock.price && stock.price !== "0.00" ? `$${stock.price}` : ''}
                    </div>
                </div>
            </div>

            <div style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                lineHeight: '1.4',
                color: '#e0e0e0'
            }}>
                "{stock.reason}"
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <span className="badge" style={{
                        backgroundColor: isBullish ? 'rgba(40, 167, 69, 0.2)' : 'rgba(220, 53, 69, 0.2)',
                        color: isBullish ? '#28a745' : '#dc3545',
                        border: `1px solid ${isBullish ? '#28a745' : '#dc3545'}`
                    }}>
                        {stock.sentiment}
                    </span>
                    <span className="badge" style={{
                        backgroundColor: 'transparent',
                        color: getRiskColor(stock.risk),
                        border: `1px solid ${getRiskColor(stock.risk)}`
                    }}>
                        Risk: {stock.risk}
                    </span>
                </div>

                <Button
                    size="sm"
                    variant="outline-success"
                    onClick={() => onAddWatchlist(stock)}
                    style={{ borderRadius: '20px', fontSize: '0.8rem' }}
                >
                    + Watch
                </Button>
            </div>
        </div>
    );
};

export default RecommendationCard;
