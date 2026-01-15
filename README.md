# Portfolio Web Application (MERN Stack)

A full-stack stock market portfolio tracker built with MongoDB, Express, React, and Node.js.

## Overview
This application allows users to:
- Search for stocks using real-time API data.
- Manage a portfolio of simulated holdings (Buy/Sell).
- Track favorite stocks in a watchlist.
- View interactive charts and financial data.

## Project Structure
- `backend/`: Node.js + Express server.
- `frontend/`: React.js client application.

## Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)
- A valid MongoDB connection string (see Note below).

## Getting Started

### 1. Backend Setup
The backend handles API requests and database connections.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
   The server runs on **http://localhost:3001**.
   
   > **Note**: The current MongoDB connection string in `server.js` may be invalid or inaccessible. To fix this, update `dbUrl` in `backend/server.js` with your own MongoDB Atlas connection string.

### 2. Frontend Setup
The frontend displays the user interface.

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the application:
   ```bash
   npm start
   ```
   The app will open at **http://localhost:3000**.

## Technologies Used
- **Frontend**: React, Bootstrap, Highcharts, Axios
- **Backend**: Express, Mongoose
- **Database**: MongoDB
- **APIs**: Finnhub, Polygon.io

## Documentation
For more detailed information about the project architecture and components, please refer to [project_details.md](./project_details.md).
