import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import './App.css';

export const Navss = () => {
  const location = useLocation();

  // Check if current path starts with /analytics
  const isAnalyticsActive = location.pathname.startsWith('/analytics');
  const isSearchActive = location.pathname === '/search' || location.pathname === '/';

  return (
    <Navbar expand="lg" className="navbar">
      <div className="container-fluid">
        <Navbar.Brand href="#" className="navbar-brand mb-0 h1">StockPlay</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarNav" />
        <Navbar.Collapse id="navbarNav" className="justify-content-end">
          <Nav className="nav nav-pills">
            <Nav.Item className='navitem'>
              <Nav.Link
                as={Link}
                to="/search"
                className={`nav-link ${isSearchActive ? 'active' : ''}`}
              >
                Search
              </Nav.Link>
            </Nav.Item>
            <Nav.Item className='navitem'>
              <Nav.Link
                as={Link}
                to="/analytics"
                className={`nav-link ${isAnalyticsActive ? 'active' : ''}`}
              >
                Analytics
              </Nav.Link>
            </Nav.Item>
            <Nav.Item className='navitem'>
              <Nav.Link
                as={Link}
                to="/portfolio"
                className={`nav-link ${location.pathname === '/portfolio' ? 'active' : ''}`}
              >
                Portfolio
              </Nav.Link>
            </Nav.Item>
            <Nav.Item className='navitem'>
              <Nav.Link
                as={Link}
                to="/watchlist"
                className={`nav-link ${location.pathname === '/watchlist' ? 'active' : ''}`}
              >
                Watchlist
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Navbar.Collapse>
      </div>
    </Navbar>
  );
};