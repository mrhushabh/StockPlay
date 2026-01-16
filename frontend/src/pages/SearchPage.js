import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner, Form, FormControl, Button, InputGroup } from 'react-bootstrap';
import axios from 'axios';
import { BsSearch, BsX, BsStarFill, BsStar } from 'react-icons/bs';
import { HeartbeatLoader } from '../HeartbeatLoader';
import '../App.css';

/**
 * SearchPage Component
 * Dedicated search experience for discovering stocks and adding to watchlist
 */
export const SearchPage = () => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [watchlistItems, setWatchlistItems] = useState(new Set());
    const navigate = useNavigate();

    // Fetch watchlist to show which items are already added
    const fetchWatchlist = useCallback(async () => {
        try {
            const response = await axios.post('/api/watchlist');
            const symbols = new Set(response.data.map(item => item.symbol));
            setWatchlistItems(symbols);
        } catch (error) {
            console.error('Error fetching watchlist:', error);
        }
    }, []);

    useEffect(() => {
        fetchWatchlist();
    }, [fetchWatchlist]);

    // Fetch search suggestions
    const fetchSuggestions = useCallback(async () => {
        if (!query.trim()) {
            setSuggestions([]);
            return;
        }
        try {
            setLoading(true);
            const response = await axios.get('/api/stocks', {
                params: { query }
            });
            setSuggestions(response.data.result || []);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        } finally {
            setLoading(false);
        }
    }, [query]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchSuggestions();
        }, 300);
        return () => clearTimeout(timer);
    }, [query, fetchSuggestions]);

    // Filter suggestions - exclude foreign market listings (symbols with dots like .CN, .NE, .MX)
    useEffect(() => {
        setFilteredSuggestions(
            suggestions.filter(
                (item) => item.type === 'Common Stock' &&
                    !item.symbol.includes('.') &&  // Exclude foreign market extensions
                    item.symbol.toLowerCase().includes(query.toLowerCase())
            )
        );
    }, [query, suggestions]);

    const handleInputChange = (event) => {
        setQuery(event.target.value);
    };

    const handleClear = () => {
        setQuery('');
        setFilteredSuggestions([]);
    };

    // Navigate to analytics page
    const handleStockClick = async (symbol) => {
        navigate(`/analytics/${symbol}`);
    };

    // Add/remove from watchlist (silent)
    const handleToggleWatchlist = async (e, item) => {
        e.stopPropagation(); // Prevent navigation

        const isInWatchlist = watchlistItems.has(item.symbol);

        try {
            if (isInWatchlist) {
                await axios.post('/api/removefav', {
                    symbol: item.symbol,
                });
                setWatchlistItems(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(item.symbol);
                    return newSet;
                });
            } else {
                // Need to get stock data for adding to watchlist
                const quoteResponse = await axios.get('/api/quote', {
                    params: { symbol: item.symbol }
                });
                const companyResponse = await axios.get('/api/company', {
                    params: { symbol: item.symbol }
                });

                await axios.post('/api/addfav', {
                    stockName: companyResponse.data.name || item.description,
                    symbol: item.symbol,
                    price: quoteResponse.data.c,
                    change: quoteResponse.data.d,
                    percentchange: quoteResponse.data.dp,
                });
                setWatchlistItems(prev => new Set(prev).add(item.symbol));
            }
        } catch (error) {
            console.error('Error updating watchlist:', error);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (filteredSuggestions.length > 0) {
            handleStockClick(filteredSuggestions[0].symbol);
        }
    };

    return (
        <div className="search-page">
            <div className="container text-center" id="searchBox">
                <h1>Stock Search</h1>
                <p className="text-muted mb-4">Search for stocks and add them to your watchlist</p>

                <Form onSubmit={handleSubmit} className="d-flex justify-content-center position-relative">
                    <InputGroup className="search-input-group mb-3">
                        <FormControl
                            type="text"
                            value={query}
                            onChange={handleInputChange}
                            placeholder="Search for stocks (e.g., AAPL, TSLA, GOOGL)..."
                            className="search-input"
                            autoFocus
                        />
                        <Button className="search-btn" type="submit">
                            <BsSearch size={20} />
                        </Button>
                        <Button className="clear-btn" onClick={handleClear} type="button">
                            <BsX size={24} />
                        </Button>
                    </InputGroup>
                </Form>

                {/* Loading indicator */}
                {loading && (
                    <div className="text-center py-4">
                        <HeartbeatLoader />
                    </div>
                )}

                {/* Search Results - Autocomplete style list */}
                {!loading && query && filteredSuggestions.length > 0 && (
                    <div className="search-results-list">
                        {filteredSuggestions.map((item) => (
                            <div
                                key={item.symbol}
                                className="search-result-item"
                                onClick={() => handleStockClick(item.symbol)}
                            >
                                <div className="result-info">
                                    <span className="result-symbol">{item.symbol}</span>
                                    <span className="result-description">{item.description}</span>
                                </div>
                                <button
                                    className={`watchlist-btn ${watchlistItems.has(item.symbol) ? 'in-watchlist' : ''}`}
                                    onClick={(e) => handleToggleWatchlist(e, item)}
                                    title={watchlistItems.has(item.symbol) ? 'Remove from Watchlist' : 'Add to Watchlist'}
                                >
                                    {watchlistItems.has(item.symbol) ? (
                                        <BsStarFill size={18} />
                                    ) : (
                                        <BsStar size={18} />
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* No results message */}
                {!loading && query && filteredSuggestions.length === 0 && (
                    <div className="text-center py-4">
                        <p className="text-muted">No stocks found for "{query}"</p>
                    </div>
                )}

                {/* Empty state */}
                {!query && (
                    <div className="search-empty-state">
                        <p className="text-muted">
                            Start typing to search for stocks. Click a stock to view analytics,
                            or click the star to add to your watchlist.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchPage;
