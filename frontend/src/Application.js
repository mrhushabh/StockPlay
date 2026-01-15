import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import { Searchengine } from './Searchengine';
import { Watchlist } from './Watchlist';
import { Portfolio } from './Portfolio';

import { Button, Modal, Form, Card, Image } from 'react-bootstrap';
import axios from 'axios';
import { Tabsss } from './Tabsss';
import { Navss} from './Navss';
import { BsDisplay } from 'react-icons/bs';

export const Application = () => {


  // State to store search results
  const [searchResults, setSearchResults] = useState(null);
  const [tabData, setTabData] = useState(null);
//   const [stockData, setStockData] = useState(null);
//   const [stockSymbol, setStockSymbol] = useState(' ');
  // Function to update search results
  const updateSearchResults = (data) => {
    setSearchResults(data);
  };
  const updateTabData = (data) => {
    setTabData(data);
  };

  return (
    <Router>
      <div className="bodymain">
        <Navss />

        <Routes>
            <Route path="/" element={<Navigate to="/search" />} />
            <Route path="/search/:ticker" element={<SearchResults searchResults={searchResults} updateSearchResults={updateSearchResults} updateTabData={updateTabData}  />} />

            {/* Define route for /search */}
            <Route path="/search" element={<SearchResults searchResults={searchResults} updateSearchResults={updateSearchResults} updateTabData={updateTabData}  />}/>

            {/* Define routes for other paths */}
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/portfolio" element={<Portfolio />} />






            {/* <Route path = "/search" element = {className =} */}
          {/* <Route path="/search" element={<SearchResults searchResults={searchResults} updateSearchResults={updateSearchResults} updateTabData={updateTabData} stockSymbol = {stockSymbol} stockData = {stockData}/>} />
          <Route path="/search/:ticker" element={<SearchResults searchResults={searchResults} updateSearchResults={updateSearchResults} updateTabData={updateTabData} stockSymbol = {stockSymbol} stockData = {stockData}/>} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/*" element={<Navigate replace to="/search" />} /> */}
        </Routes>
        {/* {(searchResults || tabData) && <Tab ticker={searchResults ? searchResults.ticker : ''} tabData={tabData} updateTabData={updateTabData} />} */}
      </div>


    </Router>
  );
};

let Boughtstocks = {};
const fetchCurrentMoney = async () => {
    try {
      const response = await axios.post('http://localhost:3001/api/Money');
      Money = response.data.Money;
      console.log(response.data.Money)
      return (response.data.Money); // Assuming the server responds with the money value under the key 'Money'
    } catch (error) {
      console.error('Error fetching current money:', error);
      return null; // Handle the error appropriately in your component
    }
  };
  fetchCurrentMoney()
let Money= null;
const SearchResults = ({ searchResults, updateSearchResults, updateTabData }) => {
  const [stockData, setStockData] = useState(null);
  const [stockSymbol, setStockSymbol] = useState(' ');
  const { ticker } = useParams();
  const [tabData, setTabData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const [showSellModal, setShowSellModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); 
  const [star, setstar] = useState(false);
  const [inlist, setinlist] = useState(false);
  const [showTabs, setShowTabs] = useState(true); 
  const [sellButtonDisabled, setSellButtonDisabled] = useState(false);
  const [MarketOpen, setMarketOpen] = useState(false);
  
  // Function to handle symbol data
//   const symboldata = (data) => {
    // let Money = null;

      fetchCurrentMoney()
    // const money = getCurrentMoney()
    // let Money = await fetchCurrentMoney();
    // const money = getCurrentMoney()
    console.log(Money);
    const symboldata = (data) => {
    console.log(data);
    let inputdata = data;
    setStockData(inputdata);
    setStockSymbol(inputdata.ticker);
    // Update search results in parent component
    updateSearchResults(inputdata);
  };
  console.log(Money);
//   const navigateToSearch = (ticker) => {
//     // Define your navigation logic here
//     // For example, you can use window.location.href or any other navigation method
//     // In this case, I'll use window.location.href
//     console.log('reached')
//     return <Navigate to={`/search/${ticker}`} replace />;
//   };
const formatUnixTimestamp = (unixTimestamp) => {
  // Assuming unixTimestamp is in seconds
  const date = new Date(unixTimestamp * 1000);
  return date.toLocaleString(); // Adjust the formatting as per your requirements
};
  const handleShowModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };
  const handleShowSellModal = () => {
    setShowSellModal(true);
  };

  const handleCloseSellModal = () => {
    setShowSellModal(false);
  };
  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  const handleIncreaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setQuantity(value);
    }
    console.log(quantity)
  };

  const handleBuy = async() => {
    try {

        // if (Boughtstocks.hasOwnProperty(searchResults.name)) {
        //     Boughtstocks[searchResults.name] += quantity; // If the stockName already exists, increase its quantity
        //   } else {
        //     Boughtstocks[searchResults.name] = quantity; // If the stockName doesn't exist, add it with the given quantity
        //   }
        // console.log(Boughtstocks);
        const totalAmount = quantity * parseFloat(searchResults.c);
        if (totalAmount > Money) {
          setErrorMessage('Insufficient funds'); // Set error message if total amount exceeds available funds
          return;
        }
        // Money -= totalAmount;
        // console.log(Money)
        const response = await axios.post('http://localhost:3001/api/buy', {
        
          quantity,
          price: searchResults.c,
          stockName: searchResults.name,
          change: searchResults.d,
         
        });
        setErrorMessage('')
        console.log(response.data); // Handle success response
      } catch (error) { 
        console.error('Error buying stock:', error); // Handle error
      }
      handleCloseModal();
    };
  
  const handleSell =async () => {
 
    try {
        const response2 = await axios.post('http://localhost:3001/api/portfoliostock', { stockName: searchResults.name });
        console.log(response2.data[0].quantity)
        if (response2.data.length === 0) {
            setErrorMessage('No trades found for the specified stock');
            return;
        }
        // console.log(response2.data[0].quantity);
        console.log(quantity);
        if(response2.data[0].quantity<quantity){
            setErrorMessage('Not enough quantity');
            return;
        }
        const response1 = await axios.post('http://localhost:3001/api/sell', {
          quantity,
          price: searchResults.c,
          stockName: searchResults.name
        });
        
        console.log(response1.data); // Handle success response
        setErrorMessage('');
      } catch (error) {
        console.error('Error selling stock:', error); // Handle error
      }
      handleCloseSellModal();
    };

      
      // Function to check if the stock is in the watchlist
      const checkstar = async () => {
        try {
          const response = await axios.post(`http://localhost:3001/api/star`,{
            symbol : searchResults.ticker,
          });
          setinlist(response.data.starstate); 

          console.log(inlist)// Update inWatchlist state from backend
        } catch (error) {
          console.error('Error checking watchlist:', error);
        }
      };

      const checkquantity = async () => {
        try {
          const response = await axios.post('http://localhost:3001/api/portfoliostock', { stockName: searchResults.name });
          // setinlist(response.data.starstate); 
          if(response.data[0].quantity && response.data[0].quantity >0){
            setSellButtonDisabled(true)
          }else{
            setSellButtonDisabled(false)
          }
  
          console.log(sellButtonDisabled)// Update inWatchlist state from backend
        } catch (error) {
          console.error('Error checking watchlist:', error);
        }
      };
      
      const MarketStatus = ({ searchResults }) => {
        if(searchResults){
        // Calculate the current timestamp
        const currentTimestamp = Math.floor(Date.now() / 1000);
    
        // Calculate the difference between the current timestamp and the timestamp from the data
        const timeDifference = currentTimestamp - searchResults.t;
    
        // Check if the market is open based on the time difference
        const isMarketOpen = timeDifference < 300;
    
        return (
    
          <div className="market-status">
            {isMarketOpen ? (
              setMarketOpen(true),
              <p>Market is open</p>
            ) : (
              <p className="closed">Market closed on {formatUnixTimestamp(searchResults.t)}</p>
            )}
          </div>
    
        );
      };

    };




      useEffect(() => {
        // Run your function here
        if (searchResults) {
          checkstar();
          checkquantity();
        }
      }, []); 
      const hideTabs = () => {
        setShowTabs(false);
      };
      const unhideTabs = () => {
        setShowTabs(true);
      };
    const handleStar = async() => {
        console.log(inlist);
      // Toggle the state
   try{
        if(!inlist){
        
        // console.log(!inlist);
       
        const response = await axios.post('http://localhost:3001/api/addfav', {
          stockName: searchResults.name,
          symbol: searchResults.ticker,
          price: searchResults.c,
          change: searchResults.d,
          percentchange: searchResults.dp,

         
        });
        console.log(response.data); // Handle success response
      } 
     
       
        else{
         
            const response = await axios.post('http://localhost:3001/api/removefav', {
          
          symbol: searchResults.ticker,
        });
      }
      setinlist(!inlist);
      console.log('star:',inlist);
   }
      catch (error) { 
        console.error('Error removing stock:', error); // Handle error
      }
     
        
     
   

      };
  const totalAmount = searchResults && searchResults.c ? quantity * parseFloat(searchResults.c) : 0;
  const datatrans = stockSymbol;
  console.log(showTabs);
  console.log(searchResults)
  // console.log(searchResults.quantity)
  // useEffect(() => {
  //   if (searchResults && searchResults.quantity) {
  //     setSellButtonDisabled(false);
  // //   }});
  //     console.log(searchResults.quantity)
  return (
    <div>
  <div className="container text-center" id="searchBox">
    <h1>Stock Search</h1>
    <div className="form col-xs-12 my-custom-form">
      <Searchengine parentfunc={symboldata} hideTabs={hideTabs} unhideTabs={unhideTabs} />
    </div>
  </div>

  {searchResults && showTabs &&(
    <div className="topdetails">
      <Card className="card 1" id="card1">
        <Card.Body>
          <div className="d-flex flex-column align-items-center">
            <h2 id="symbol">
              {stockSymbol}{" "}
              <svg
                onClick={handleStar}
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill={inlist ? "yellow" : "none"}
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
              <Card.Text>{searchResults.name}</Card.Text>
            </div>
            <div id="exchange">
              <Card.Text>{searchResults.exchange}</Card.Text>
            </div>
          </div>
        </Card.Body>
        <div className="d-flex justify-content-center">
          <div className="tradebuttons">
            <Button variant="success" id="buy" onClick={() => handleShowModal({ stockSymbol })}>
              Buy
            </Button>
      {sellButtonDisabled && (
        <Button
          variant="danger"
          onClick={handleShowSellModal}
        >
          Sell
        </Button>
      )} 
          </div>
        </div>
      </Card>
            
    
          <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{searchResults.ticker}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Current Price: {searchResults.c}</p>
          <p>Money in Wallet: {Money}{/* Your wallet balance here */}</p>
          <Form.Group>
            <Form.Label>Quantity</Form.Label>
            <div className="d-flex">
              {/* <Button variant="outline-secondary" size="sm" onClick={handleDecreaseQuantity}>-</Button>{' '} */}
              <Form.Control type="number" value={quantity} onChange={handleQuantityChange}  />
              {/* <Button variant="outline-secondary" size="sm" onClick={handleIncreaseQuantity}>+</Button> */}
            </div>
          </Form.Group>
          
        </Modal.Body>
        <Modal.Footer>
        <p>Total: {totalAmount}</p>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>} {/* Display error message */}
          {/* <Button variant="danger" onClick={handleSell}>Sell</Button> */}
          <Button variant="primary" onClick={handleBuy} id='buy'>Buy</Button>
        </Modal.Footer>
      </Modal>

            {/* Sell Modal */}
            <Modal show={showSellModal} onHide={handleCloseSellModal}>
        <Modal.Header closeButton>
          <Modal.Title>{searchResults.ticker}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Current Price: {searchResults.c}</p>
          <Form.Group>
            <Form.Label>Quantity</Form.Label>
            <div className="d-flex align-items-center">
              {/* <Button variant="outline-secondary" size="sm" onClick={handleDecreaseQuantity}>-</Button>{' '} */}
              <Form.Control type="number" value={quantity} onChange={handleQuantityChange}  />
              {/* <Button variant="outline-secondary" size="sm" onClick={handleIncreaseQuantity}>+</Button> */}
            </div>
          </Form.Group>
         
        </Modal.Body>
        <Modal.Footer>
        <p>Total: {totalAmount}</p>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
          <Button variant="danger" onClick={handleSell}>Sell</Button>
        </Modal.Footer>
      </Modal>
    
      <div className='card 2' id='card2'>
  <Image id='logo' src={searchResults.logo} alt="Logo" fluid /> {/* Use the fluid prop to make the image responsive */}
</div>
<div className='card 3' id='card3'>
  <div id='currentp' className="text-center mb-2" style={{ color: searchResults.dp < 0 ? 'red' : 'green', fontSize: '2rem' }}>
    {searchResults.c}
  </div>
  <div id='percent' className="text-center" style={{ color: searchResults.dp < 0 ? 'red' : 'green', fontSize: '1.5rem' }}>
    {searchResults.dp < 0 ? <span className="triangle-down"></span> : <span className="triangle-up"></span>}
    {searchResults.d} ({searchResults.dp}%)
  </div>
  <div id='time' className="text-center" style={{ fontSize: '1rem' }}>{new Date(searchResults.t * 1000).toLocaleString()}</div>
</div>

        </div>
      )}
      <div className='marketstatus' style={{display:'flex',justifyContent:'center'}}>
      <MarketStatus searchResults={searchResults}/>
      </div>
     {showTabs && (searchResults || tabData) && <Tabsss ticker={searchResults?.ticker} data={searchResults} />}
     
      {/* <Tab ticker={datatrans} /> */}
      {/* {showTabs && <Tabsss ticker={searchResults.ticker} data = {searchResults} />} */}
    </div>
  );
};
