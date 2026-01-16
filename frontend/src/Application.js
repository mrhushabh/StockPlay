import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Components
import { Navss } from './Navss';
import { HeartbeatLoader } from './HeartbeatLoader';

// Pages
import { SearchPage } from './pages/SearchPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { Portfolio } from './Portfolio';
import { Watchlist } from './Watchlist';

/**
 * Main Application Component
 * Handles routing between Search, Analytics, Portfolio, and Watchlist
 */
export const Application = () => {
  const [loading, setLoading] = useState(true);

  // Initial App Load Simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000); // 3 second stock chart intro
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="app-initial-loader">
        <HeartbeatLoader splash={true} />
      </div>
    );
  }
  return (
    <Router>
      <div className="bodymain">
        <Navss />

        <Routes>
          {/* Default redirect to search */}
          <Route path="/" element={<Navigate to="/search" />} />

          {/* Search page - for discovering stocks */}
          <Route path="/search" element={<SearchPage />} />

          {/* Analytics page - for detailed stock analysis */}
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/analytics/:ticker" element={<AnalyticsPage />} />

          {/* Legacy route - redirect /search/:ticker to /analytics/:ticker */}
          <Route path="/search/:ticker" element={<RedirectToAnalytics />} />

          {/* Portfolio and Watchlist */}
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/watchlist" element={<Watchlist />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/search" />} />
        </Routes>
      </div>
    </Router>
  );
};

/**
 * Helper component to redirect legacy /search/:ticker URLs to /analytics/:ticker
 */
const RedirectToAnalytics = () => {
  const path = window.location.pathname;
  const ticker = path.split('/').pop();
  return <Navigate to={`/analytics/${ticker}`} replace />;
};

export default Application;
