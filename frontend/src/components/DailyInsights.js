import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Spinner } from 'react-bootstrap';
import RecommendationCard from './RecommendationCard';
import { useNumberFormat } from '../hooks/useStock';

const DailyInsights = () => {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { formatCurrency } = useNumberFormat();

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                setLoading(true);
                // Fetch from v1 endpoint
                const response = await axios.get('/api/v1/recommendations/daily');
                setInsights(response.data);
            } catch (err) {
                console.error('Failed to fetch insights:', err);
                setError('Unable to load AI insights at the moment.');
            } finally {
                setLoading(false);
            }
        };

        fetchInsights();
    }, []);

    const handleAddToWatchlist = async (stock) => {
        try {
            await axios.post('/api/addfav', {
                stockName: stock.name,
                symbol: stock.symbol,
                price: parseFloat(stock.price) || 0,
                change: 0,
                percentchange: 0
            });
            alert(`Added ${stock.symbol} to your watchlist!`);
        } catch (err) {
            console.error('Error adding to watchlist:', err);
            alert('Failed to add to watchlist. It might already be there.');
        }
    };

    if (loading) {
        return (
            <div className="text-center p-5">
                <Spinner animation="border" variant="success" />
                <p className="mt-3 text-muted"><strong>Gemini AI</strong> is analyzing the market...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-4 text-muted">
                <p>{error}</p>
            </div>
        );
    }

    if (!insights || !insights.recommendations || insights.recommendations.length === 0) {
        return null;
    }

    return (
        <div className="daily-insights-container" style={{ margin: '20px auto', width: '100%', padding: '0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', gap: '15px' }}>
                <h2 style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    margin: 0,
                    alignItems: 'center',
                    display: 'flex',
                    gap: '10px'
                }}>
                    <span style={{ fontSize: '1.5rem' }}>🤖</span> Daily AI Insights
                    <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-muted)' }}>(Watchlist Based)</span>
                </h2>
                <span className="badge" style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: insights.marketSentiment === 'Bullish' ? '#28a745' :
                        insights.marketSentiment === 'Bearish' ? '#dc3545' : '#ffc107',
                    border: '1px solid var(--border-color)'
                }}>
                    Market Sentiment: {insights.marketSentiment}
                </span>
            </div>

            <div className="daily-insights-scroll" style={{
                display: 'flex',
                overflowX: 'auto',
                gap: '20px',
                paddingBottom: '20px',
                marginBottom: '10px',
                WebkitOverflowScrolling: 'touch',
                width: 'fit-content',
                maxWidth: '100%',
                margin: '0 auto 10px auto'
            }}>
                {insights.recommendations.map((stock, index) => (
                    <RecommendationCard
                        key={`${stock.symbol}-${index}`}
                        stock={stock}
                        onAddWatchlist={handleAddToWatchlist}
                        formatCurrency={formatCurrency}
                    />
                ))}
            </div>

            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Powered by Google Gemini • Not financial advice
            </p>
        </div>
    );
};

export default DailyInsights;
