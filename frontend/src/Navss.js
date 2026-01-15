import React from 'react'
import { useHistory } from 'react-router-dom';
import { Navbar, Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import './App.css';



export const Navss = () => {
  const location = useLocation();
  return (
    <Navbar expand="lg" className="bg-blue">
    <div className="container-fluid">
      <Navbar.Brand href="#" className="navbar-brand mb-0 h1">Stock Search</Navbar.Brand>
      <Navbar.Toggle aria-controls="navbarNav" />
      <Navbar.Collapse id="navbarNav" className="justify-content-end">
        <Nav className="nav nav-pills">
          <Nav.Item className='navitem'>
            <Nav.Link as={Link} to="/search" className={`nav-link ${location.pathname === '/search' ? 'active' : ''}`} aria-current="page">Search</Nav.Link>
          </Nav.Item >
          <Nav.Item className='navitem'>
            <Nav.Link as={Link} to="/portfolio" className={`nav-link ${location.pathname === '/portfolio' ? 'active' : ''}`} aria-current="page">Portfolio</Nav.Link>
          </Nav.Item>
          <Nav.Item className='navitem'>
            <Nav.Link as={Link} to="/watchlist" className={`nav-link ${location.pathname === '/watchlist' ? 'active' : ''}`} aria-current="page">Watchlist</Nav.Link>
          </Nav.Item>
        </Nav>
      </Navbar.Collapse>
    </div>
  </Navbar>
  )
}