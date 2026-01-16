import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Modal, Form, Card, Image, Spinner, FormControl, InputGroup } from 'react-bootstrap';
import axios from 'axios';
import { BsSearch, BsX } from 'react-icons/bs';
import { Tabsss } from '../Tabsss';
import { HeartbeatLoader } from '../HeartbeatLoader';
import '../App.css';

/**
 * AnalyticsPage Component
 * Detailed stock analysis with summary, charts, news, and insights
 */
export const AnalyticsPage = () => {
    const { ticker } = useParams();
    const navigate = useNavigate();

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);

    // Stock data state
    const [stockData, setStockData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Trading modal state
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [showSellModal, setShowSellModal] = useState(false);
    const [quantity, setQuantity] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');
    const [money, setMoney] = useState(0);

    // Watchlist state
    const [inWatchlist, setInWatchlist] = useState(false);
    const [sellButtonEnabled, setSellButtonEnabled] = useState(false);

    // Fetch wallet balance
    const fetchMoney = useCallback(async () => {
        try {
            const response = await axios.post('/api/Money');
            setMoney(response.data.Money || 0);
        } catch (error) {
            console.error('Error fetching money:', error);
        }
    }, []);

    // Fetch stock data
    const fetchStockData = useCallback(async (symbol) => {
        if (!symbol) return;

        try {
            setLoading(true);
            setError(null);

            const [companyRes, quoteRes, peersRes, sentimentsRes] = await Promise.all([
                axios.get('/api/company', { params: { symbol } }),
                axios.get('/api/quote', { params: { symbol } }),
                axios.get('/api/peers', { params: { symbol } }),
                axios.get('/api/Sentiments', { params: { symbol } })
            ]);

            // Calculate sentiment totals
            let totalChange = 0, positiveChange = 0, negativeChange = 0;
            let totalMspr = 0, positiveMspr = 0, negativeMspr = 0;

            const sentimentData = sentimentsRes.data.data || [];
            sentimentData.forEach(item => {
                totalChange += item.change;
                totalMspr += item.mspr;
                if (item.change > 0) positiveChange += item.change;
                if (item.change < 0) negativeChange += item.change;
                if (item.mspr > 0) positiveMspr += item.mspr;
                if (item.mspr < 0) negativeMspr += item.mspr;
            });

            const data = {
                ...companyRes.data,
                ...quoteRes.data,
                peers: peersRes.data,
                tc: totalChange,
                pc: positiveChange,
                nc: negativeChange,
                tm: totalMspr,
                pm: positiveMspr,
                nm: negativeMspr
            };

            setStockData(data);
        } catch (err) {
            console.error('Error fetching stock data:', err);
            setError('Failed to load stock data');
        } finally {
            setLoading(false);
        }
    }, []);

    // Check watchlist status
    const checkWatchlistStatus = useCallback(async (symbol) => {
        try {
            const response = await axios.post('/api/star', { symbol });
            setInWatchlist(response.data.starstate);
        } catch (error) {
            console.error('Error checking watchlist:', error);
        }
    }, []);

    // Check if user owns this stock
    const checkPortfolioStatus = useCallback(async (stockName) => {
        try {
            const response = await axios.post('/api/portfoliostock', { stockName });
            setSellButtonEnabled(response.data[0]?.quantity > 0);
        } catch (error) {
            console.error('Error checking portfolio:', error);
            setSellButtonEnabled(false);
        }
    }, []);

    // Load data when ticker changes
    useEffect(() => {
        if (ticker) {
            fetchStockData(ticker);
            checkWatchlistStatus(ticker);
            fetchMoney();
        }
    }, [ticker, fetchStockData, checkWatchlistStatus, fetchMoney]);

    // Check portfolio status when stock data loads
    useEffect(() => {
        if (stockData?.name) {
            checkPortfolioStatus(stockData.name);
        }
    }, [stockData?.name, checkPortfolioStatus]);

    // Search functionality
    const fetchSearchSuggestions = useCallback(async () => {
        if (!searchQuery.trim()) {
            setSuggestions([]);
            return;
        }
        try {
            setSearchLoading(true);
            const response = await axios.get('/api/stocks', {
                params: { query: searchQuery }
            });
            const filtered = (response.data.result || []).filter(
                item => item.type === 'Common Stock' && !item.symbol.includes('.')
            );
            setSuggestions(filtered);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        } finally {
            setSearchLoading(false);
        }
    }, [searchQuery]);

    useEffect(() => {
        const timer = setTimeout(fetchSearchSuggestions, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, fetchSearchSuggestions]);

    const handleSearchSelect = (symbol) => {
        setSearchQuery('');
        setSuggestions([]);
        setShowAutocomplete(false);
        navigate(`/analytics/${symbol}`);
    };

    // Trading handlers
    const handleBuy = async () => {
        const totalAmount = quantity * parseFloat(stockData.c);
        if (totalAmount > money) {
            setErrorMessage('Insufficient funds');
            return;
        }
        try {
            await axios.post('/api/buy', {
                quantity,
                price: stockData.c,
                stockName: stockData.name,
                change: stockData.d,
            });
            setErrorMessage('');
            setShowBuyModal(false);
            setQuantity(0);
            fetchMoney();
            checkPortfolioStatus(stockData.name);
        } catch (error) {
            console.error('Error buying stock:', error);
            setErrorMessage('Transaction failed');
        }
    };

    const handleSell = async () => {
        try {
            const portfolioRes = await axios.post('/api/portfoliostock', {
                stockName: stockData.name
            });

            if (!portfolioRes.data[0] || portfolioRes.data[0].quantity < quantity) {
                setErrorMessage('Not enough shares');
                return;
            }

            await axios.post('/api/sell', {
                quantity,
                price: stockData.c,
                stockName: stockData.name
            });

            setErrorMessage('');
            setShowSellModal(false);
            setQuantity(0);
            fetchMoney();
            checkPortfolioStatus(stockData.name);
        } catch (error) {
            console.error('Error selling stock:', error);
            setErrorMessage('Transaction failed');
        }
    };

    // Watchlist toggle
    const handleToggleWatchlist = async () => {
        try {
            if (inWatchlist) {
                await axios.post('/api/removefav', {
                    symbol: stockData.ticker,
                });
            } else {
                await axios.post('/api/addfav', {
                    stockName: stockData.name,
                    symbol: stockData.ticker,
                    price: stockData.c,
                    change: stockData.d,
                    percentchange: stockData.dp,
                });
            }
            setInWatchlist(!inWatchlist);
        } catch (error) {
            console.error('Error updating watchlist:', error);
        }
    };

    const formatUnixTimestamp = (unixTimestamp) => {
        const date = new Date(unixTimestamp * 1000);
        return date.toLocaleString();
    };

    const totalAmount = stockData?.c ? quantity * parseFloat(stockData.c) : 0;

    // Market status check
    const isMarketOpen = stockData?.t ?
        (Math.floor(Date.now() / 1000) - stockData.t) < 300 : false;

    if (loading && ticker) {
        return (
            <div className="analytics-page">
                <div className="text-center py-5">
                    <HeartbeatLoader />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="analytics-page">
                <div className="text-center py-5">
                    <p className="text-danger">{error}</p>
                    <Button variant="primary" onClick={() => fetchStockData(ticker)}>
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="analytics-page">
            {/* Compact search bar at top */}
            <div className="analytics-top-search">
                <InputGroup className="search-input-group compact">
                    <FormControl
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setShowAutocomplete(true);
                        }}
                        onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
                        placeholder="Search for a stock..."
                        className="search-input"
                    />
                    <Button className="search-btn" type="button">
                        <BsSearch size={16} />
                    </Button>
                    {searchQuery && (
                        <Button className="clear-btn" onClick={() => setSearchQuery('')} type="button">
                            <BsX size={20} />
                        </Button>
                    )}
                </InputGroup>

                {showAutocomplete && suggestions.length > 0 && (
                    <ul id="autocomplete" className="analytics-autocomplete">
                        {suggestions.slice(0, 8).map(item => (
                            <li key={item.symbol} onClick={() => handleSearchSelect(item.symbol)}>
                                <span>{item.symbol}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9em' }}>
                                    {item.description}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Content when stock selected */}
            {stockData ? (
                <>
                    <div className="topdetails">
                        <Card className="card 1" id="card1">
                            <Card.Body>
                                <div className="d-flex flex-column align-items-center">
                                    <h2 id="symbol">
                                        {stockData.ticker}{" "}
                                        <svg
                                            onClick={handleToggleWatchlist}
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill={inWatchlist ? "yellow" : "none"}
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="feather feather-star"
                                            style={{ cursor: "pointer" }}
                                        >
                                            <path d="M12 2L15.09 8.22L22 9.27L17 14.14L18.18 21.02L12 18.77L5.82 21.02L7 14.14L2 9.27L8.91 8.22L12 2Z" />
                                        </svg>
                                    </h2>
                                    <div id="Name">
                                        <Card.Text>{stockData.name}</Card.Text>
                                    </div>
                                    <div id="exchange">
                                        <Card.Text>{stockData.exchange}</Card.Text>
                                    </div>
                                </div>
                            </Card.Body>
                            <div className="d-flex justify-content-center">
                                <div className="tradebuttons">
                                    <Button variant="success" id="buy" onClick={() => setShowBuyModal(true)}>
                                        Buy
                                    </Button>
                                    {sellButtonEnabled && (
                                        <Button variant="danger" onClick={() => setShowSellModal(true)}>
                                            Sell
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>

                        <div className='card 2' id='card2'>
                            <Image id='logo' src={stockData.logo} alt="Logo" fluid />
                        </div>

                        <div className='card 3' id='card3'>
                            <div id='currentp' className="text-center mb-2"
                                style={{ color: stockData.dp < 0 ? 'red' : 'green', fontSize: '2rem' }}>
                                {stockData.c}
                            </div>
                            <div id='percent' className="text-center"
                                style={{ color: stockData.dp < 0 ? 'red' : 'green', fontSize: '1.5rem' }}>
                                {stockData.dp < 0 ? <span className="triangle-down"></span> : <span className="triangle-up"></span>}
                                {stockData.d} ({stockData.dp}%)
                            </div>
                            <div id='time' className="text-center" style={{ fontSize: '1rem' }}>
                                {formatUnixTimestamp(stockData.t)}
                            </div>
                        </div>
                    </div>

                    {/* Market status */}
                    <div className='marketstatus' style={{ display: 'flex', justifyContent: 'center' }}>
                        <div className="market-status">
                            {isMarketOpen ? (
                                <p>Market is open</p>
                            ) : (
                                <p className="closed">
                                    Market closed on {stockData?.t ? formatUnixTimestamp(stockData.t) : ''}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Tabs */}
                    <Tabsss ticker={stockData.ticker} data={stockData} />

                    {/* Modals */}
                    <Modal show={showBuyModal} onHide={() => setShowBuyModal(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>{stockData?.ticker}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p>Current Price: ${stockData?.c}</p>
                            <p>Money in Wallet: ${money.toFixed(2)}</p>
                            <Form.Group>
                                <Form.Label>Quantity</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                                    min="0"
                                />
                            </Form.Group>
                        </Modal.Body>
                        <Modal.Footer>
                            <p>Total: ${totalAmount.toFixed(2)}</p>
                            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                            <Button variant="success" onClick={handleBuy} disabled={quantity <= 0}>
                                Buy
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    <Modal show={showSellModal} onHide={() => setShowSellModal(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>{stockData?.ticker}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p>Current Price: ${stockData?.c}</p>
                            <Form.Group>
                                <Form.Label>Quantity</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                                    min="0"
                                />
                            </Form.Group>
                        </Modal.Body>
                        <Modal.Footer>
                            <p>Total: ${totalAmount.toFixed(2)}</p>
                            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                            <Button variant="danger" onClick={handleSell} disabled={quantity <= 0}>
                                Sell
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </>
            ) : (
                <div className="text-center py-5">
                    <p className="text-muted">Use the search bar above to find a stock.</p>
                </div>
            )}
        </div>
    );
};

export default AnalyticsPage;
