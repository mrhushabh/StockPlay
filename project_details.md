# Project Details: MERN Stack Portfolio Application

## 1. Executive Summary
This project is a full-stack web application built using the **MERN** stack (MongoDB, Express, React, Node.js). It serves as a stock market portfolio tracker, allowing users to search for stocks, view real-time/historical data, buy/sell simulated stocks, and manage a watchlist.

## 2. Architecture Overview
The application follows a standard client-server architecture:
- **Frontend (Client)**: React.js application serving the user interface. It communicates with the backend via RESTful APIs.
- **Backend (Server)**: Node.js + Express server that handles API requests, business logic, and database interactions.
- **Database**: MongoDB (Atlas) for storing user data, transactions, and watchlist items.

### High-Level Diagram
```mermaid
graph LR
    User[User] -->|Interact| Client[React Frontend]
    Client -->|API Requests (Axios)| Server[Express Backend]
    Server -->|Read/Write| DB[(MongoDB)]
    Server -->|External API| Finnhub[Finnhub/Polygon APIs]
```

## 3. Key Components

### 3.1 Backend (`/backend`)
- **Entry Point**: `server.js` (running on port 3001).
- **Tech Stack**: Express, Mongoose, Axios, Cors.
- **Data Models**:
  - `MoneySchema.js`: Tracks user's wallet balance.
  - `tradeschema.js`: Records buy/sell transactions.
  - `Wishlistschema.js`: Stores favorite/watchlist stocks.
- **External Integration**: Connects to Finnhub and Polygon.io APIs for stock data.
- **Current Issue**: The configured MongoDB connection string appears to be invalid or inaccessible (`querySrv ENOTFOUND`), causing database operations to fail locally.

### 3.2 Frontend (`/frontend`)
- **Framework**: React.js (Bootstrapped with Create React App).
- **Styling**: Bootstrap 5, React-Bootstrap, FontAwesome.
- **Routing**: `react-router-dom` for navigation (`/search`, `/watchlist`, `/portfolio`).
- **Key Modules**:
  - `Application.js`: Main container and routing logic.
  - `Searchengine.js`: Component for searching stock symbols.
  - `Portfolio.js`: Displays user's holdings and simulates trading.
  - `Watchlist.js`: Manages favorite stocks.
  - `Tabsss.js` / `Mainchart.js`: Visualization components using Highcharts.
- **Configuration**: Originally pointed to a cloud deployment (`uscreactdeployment.wl.r.appspot.com`), but updated to use `localhost:3001` for local execution.

## 4. Dependencies
### Backend
- `express`: Web framework.
- `mongoose`: ODM for MongoDB.
- `axios`: For making external API calls.
- `cors`: To allow cross-origin requests from the frontend.

### Frontend
- `react`, `react-dom`: Core library.
- `react-router-dom`: Routing.
- `bootstrap`, `react-bootstrap`: UI components.
- `highcharts`, `highcharts-react-official`: Charting library.
- `axios`: HTTP client.

## 5. Setup & Execution Findings
- **Ports**: Backend runs on `3001`. Frontend runs on `3000` (default) and proxies requests to backend.
- **Database**: Hardcoded MongoDB URI in `server.js`.
- **API Keys**: Finnhub and Polygon API keys are hardcoded in the backend.

## 6. Recommendations for Improvement
1.  **Environment Variables**: Move sensitive data (MongoDB URI, API Keys) to a `.env` file instead of hardcoding them.
2.  **Database Connection**: Update the MongoDB connection string to a valid cluster or a local instance.
3.  **Proxy Setup**: Configure `proxy` in `frontend/package.json` to handle CORS cleanly during development.
4.  **Error Handling**: Improve backend error handling to better manage API failures.
