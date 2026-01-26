// Import the Spinner component from react-bootstrap
import { Spinner } from 'react-bootstrap';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Form, FormControl, Button, InputGroup } from 'react-bootstrap';
import axios from 'axios';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { BsSearch, BsX } from 'react-icons/bs';
// Import the Spinner component from react-bootstrap


export const Searchengine = ({ parentfunc, hideTabs, unhideTabs }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false); // State to control visibility of autocomplete
  const [loading, setLoading] = useState(false); // State to control the loading spinner

  const navigate = useNavigate();
  const { ticker } = useParams();
  // Function to fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true); // Set loading state to true when fetching data starts
      const response = await axios.get('/api/stocks', {
        params: {
          query: query
        }
      });
      setSuggestions(response.data.result);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false); // Set loading state to false when fetching data completes
    }
  }, [query]);

  // Effect to fetch data every 15 seconds
  useEffect(() => {
    fetchData(); // Fetch data immediately when component mounts
    const intervalId = setInterval(fetchData, 15000); // Fetch data every 15 seconds

    return () => clearInterval(intervalId); // Clean up interval on component unmount
  }, [fetchData]);

  useEffect(() => {
    // Filter suggestions whenever query or suggestions state changes
    setFilteredSuggestions(
      suggestions.filter(
        (item) => item.type === 'Common Stock' && item.symbol.toLowerCase().startsWith(query.toLowerCase())
      )
    );

    // Show autocomplete only if there's a query
    setShowAutocomplete(!!query);
  }, [query, suggestions]);

  // Dedicated effect to handle ticker URL parameter (from Portfolio/Watchlist navigation)
  useEffect(() => {
    if (ticker) {
      handleSelectSuggestion(ticker);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker]);

  const handleInputChange = async (event) => {
    const inputValue = event.target.value;
    setQuery(inputValue);
  };

  const handleSelectSuggestion = async (suggestion) => {
    unhideTabs();
    setQuery('');
    try {
      const response1 = await axios.get('/api/company', {
        params: {
          symbol: suggestion
        }
      });
      const response3 = await axios.get('/api/quote', {
        params: {
          symbol: suggestion
        }
      });
      const response5 = await axios.get('/api/peers', {
        params: {
          symbol: suggestion
        }
      });
      const response6 = await axios.get('/api/Sentiments', {
        params: {
          symbol: suggestion
        }
      });

      const peers = { peers: response5.data };
      let totalChange = 0;
      let positiveChange = 0;
      let totalmspr = 0;
      let positivemspr = 0;
      let negativeChange = 0;
      let negativemspr = 0;
      for (let i = 0; i < response6.data.data.length; i++) {
        const item = response6.data.data[i];
        totalChange += item.change;
        totalmspr += item.mspr;
        if (item.change > 0) {
          positiveChange += item.change;
        }
        if (item.change < 0) {
          negativeChange += item.change;
        }
        if (item.mspr > 0) {
          positivemspr += item.mspr;
        }
        if (item.mspr < 0) {
          negativemspr += item.mspr;
        }
      }

      const Sentiments = { tc: totalChange, pc: positiveChange, tm: totalmspr, pm: positivemspr, nm: negativemspr, nc: negativeChange };
      const response = { ...response1.data, ...response3.data, ...Sentiments, ...peers };
      parentfunc(response);
      navigate(`/search/${response.ticker}`);
    } catch (error) {
      console.error('Error fetching company data:', error);
    }
  };

  const handleClear = () => {
    setQuery(''); // Clear the query state
    setFilteredSuggestions([]); // Clear the filtered suggestions
    hideTabs();
  };

  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent the default form submission behavior
    if (filteredSuggestions.length > 0) {
      // If there are suggestions, select the first suggestion
      handleSelectSuggestion(filteredSuggestions[0].symbol);
      unhideTabs();
    } else {
      // If there are no suggestions, allow the form to submit
      event.target.submit();
    }
  };

  return (
    <div className="search-container">
      <Form onSubmit={handleSubmit} className="d-flex justify-content-center position-relative">
        <InputGroup className="search-input-group mb-3">
          <FormControl
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search for stocks..."
            className="search-input"
            aria-describedby="basic-addon2"
          />
          <Button
            className="search-btn"
            onClick={() => { }}
            type="submit"
          >
            <BsSearch size={20} />
          </Button>
          <Button
            className="clear-btn"
            onClick={handleClear}
            type="button"
          >
            <BsX size={24} />
          </Button>
        </InputGroup>

        {showAutocomplete && !loading && (
          <ul id="autocomplete" style={{ textAlign: 'left' }}>
            {filteredSuggestions.map((item) => (
              <li key={item.symbol} onClick={() => handleSelectSuggestion(item.symbol)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
                <span style={{ textAlign: 'left' }}>{item.symbol}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9em', textAlign: 'left' }}>{item.description}</span>
              </li>
            ))}
          </ul>
        )}

        {loading && (
          <div className="text-center w-100 position-absolute" style={{ top: '100%', marginTop: '20px' }}>
            <Spinner animation="border" role="status" variant="success">
              <span className="sr-only">Loading...</span>
            </Spinner>
          </div>
        )}
      </Form>
    </div>
  );
};
