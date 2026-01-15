
import React, { useState, useEffect  } from 'react';
import { Tabs, Tab, Modal, Button, Card, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
// import Highcharts from 'highcharts/highstock';
import exporting from 'highcharts/modules/exporting';
import data from 'highcharts/modules/data';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { Chart1 } from './Chart1';
import { Chart2 } from './Chart2';
import { Chart3 } from './Chart3';
import { MainChart } from './Mainchart';
// import { useNavigate } from 'react-router-dom';




export const Tabsss = (props) => {
  const [stockdata1, setStockData1] = useState(' ');
  const [chartOptions, setChartOptions] = useState(null);
  const [chartData, setChartData] = useState({ tValues: [], cValues: [] });
  const [showModal, setShowModal] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [key, setKey] = useState('Summary');
  // const [stockticker, setstockticker] = useState(' ');
  const [news, setnews] = useState(null)
  let assignSymbol = props.ticker;
  const navigate = useNavigate();
 
 
  useEffect(() => {
const fetchdata = async (assignSymbol) => {
  try {
   
    const response4 = await axios.get('http://localhost:3001/api/News', {  params: {
          symbol: props.ticker
        }});
  
    const response6 = await axios.get('http://localhost:3001/api/Chart1', {  params: {
        symbol: props.ticker
      }});
    const response7 = await axios.get('http://localhost:3001/api/Chart2', {
        params: {
          symbol: props.ticker
        }
      });
      const response8 = await axios.get('http://localhost:3001/api/Chart4', {
        params: {
          symbol: props.ticker
        }
      });
    // const spaced = (response3.data).join()
    // const peers = {peers:response3.data}

    // let totalChange = 0;
    // let positiveChange = 0;
    // let totalmspr = 0;
    // let positivemspr = 0;
    // let negativeChange = 0;
    // let negativemspr = 0;

    // const options = {
    //   title: {
    //     text: 'Stock Chart'
    //   },
    //   series: [{
    //     name: 'Stock Data',
    //     data: [[Date.now(), 100], [Date.now() + 1000, 200], [Date.now() + 2000, 150]], // Sample data
    //     tooltip: {
    //       valueDecimals: 2
    //     }
    //   }]
    // };

    setChartOptions(options);
// Iterate over each item in the data array



  



   

    const tValues = response6.data.tValues;
    const cValues = response6.data.cValues;

  //  const Sentiments  = {tc:totalChange,pc:positiveChange,tm:totalmspr,pm:positivemspr, nm:negativemspr,nc:negativeChange}
   setChartData({ tValues, cValues });
    setnews(response4.data)
    console.log(news)
    // console.log(response6.data.results)
    // console.log(totalChange)
    console.log(response6.data)
    console.log(response7)
    const Chart2data = {Chart2data:response7.data}
    const Chart4data = {Chart4data:response8.data}
    const response = {...props.data,...response6.data,...Chart2data,...Chart4data};
    console.log(response)
    setStockData1(response);
    console.log(stockdata1.Chart4data)
    console.log(Chart2data)
    console.log(stockdata1.peers);
  }
catch (error) {
  console.error('Error fetching quote:', error);
}
}
  
if (props.ticker){
fetchdata();
}
},[props.ticker]);

// new handling
const options = {
  title: {
    text: 'Stock Chart'
  },
  series: [{
    name: 'Stock Data',
    data: [[Date.now(), 100], [Date.now() + 1000, 200], [Date.now() + 2000, 150]], // Sample data
    tooltip: {
      valueDecimals: 2
    }
  }]
};
  


const handleCloseModal = () => {
    setSelectedNews(null);
    setShowModal(false);
};

const handleShowModal = (item) => {
    setSelectedNews(item);
    setShowModal(true);
};


  return (


            <Tabs defaultActiveKey="Summary" id="watchlist-tabs" className="tabss" activeKey={key} onSelect={(k) => setKey(k)} variant="underline">
         
         <Tab eventKey="Summary" title="Summary">
    {stockdata1 && (
        <div id="Summary" className="tabcontent">
            <div className='scolumn1'>
                <div className='sumc1'>
                    <p>High Price: {stockdata1.h} </p>
                    <p>Low Price: {stockdata1.l}</p>
                    <p>Open Price: {stockdata1.o}</p>
                    <p>Prev. Close:{stockdata1.pc}</p>
                </div>
                <div className='sumc2'>
                    <p><b>About the Company</b></p>
                    <p>IPO Start Date:{stockdata1.ipo}</p>
                    <p>Industry: {stockdata1.finnhubIndustry}</p>
                    <p>Webpage:</p> <a href={stockdata1.weburl}>{stockdata1.weburl}</a>
                    <p>Company peers:</p>
                    <div className="company-peers">
                        {Array.isArray(stockdata1.peers) && stockdata1.peers.map((peer, index) => (
                            <p key={index}><a onClick={() => {
                                navigate(`/search/${peer}`);
                                window.location.reload();
                            }}>{peer}</a></p>
                        ))}
                    </div>
                </div>
            </div>
            <div className='scolumn2'>
                <div className='sumc3'>
                    <Chart1 tvalues={chartData.tValues} cvalues={chartData.cValues} />
                </div>
            </div>
        </div>
    )}
</Tab>

                
                <Tab eventKey="News" title="Top News" style={{margin:'0% 5%'}}> 
                    <Row>
                    {Array.isArray(news) && news.map((item, index) => (
                        item.image && // Check if item.image exists
                        <Col md={6} key={index} className='mb-1'>
             <Card onClick={() => handleShowModal(item)} style={{ cursor: 'pointer', border: '1px solid black', backgroundColor: '#f7f7f7' }}>
                    <Card.Body>
                        <Row>
                            <Col xs={4} sm={3} className='pr-2'> {/* Decrease the size of the image column for smaller screens */}
                                <Card.Img src={item.image} alt="News Image" style={{ width: '100%', height: 'auto' }} /> {/* Adjust the image size to fit the column */}
                            </Col>
                            <Col xs={8} sm={9} className='pl-2 pl-sm-4'> {/* Increase the size of the text column for smaller screens */}
                                <Card.Text>{item.headline}</Card.Text>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                        </Col>
                    ))}


            
                           {selectedNews && (
                                    <Modal show={showModal} onHide={handleCloseModal}>
                                    <Modal.Header closeButton>
                                        <Modal.Title>{selectedNews.source}</Modal.Title><br></br>
                                        {selectedNews.datetime}
                                    </Modal.Header>
                                    <Modal.Body>
                                    <b>{selectedNews.headline}</b><br></br>
                                    {selectedNews.summary}<br></br>
                                    for more details click <a href={selectedNews.url}>here</a>
                                    </Modal.Body>
                                    <Modal.Footer>
                                        Share
                                        <a href='https://twitter.com/?lang=en'><img id ='twitterimg' src = 'https://1000logos.net/wp-content/uploads/2017/06/Twitter-Log%D0%BE.png'></img></a>
                                        <a href ='https://www.facebook.com/'><img id = 'twitterimg' src = 'https://static-00.iconduck.com/assets.00/facebook-icon-512x512-seb542ju.png'></img></a>
                                    </Modal.Footer>
                                    </Modal>
                                )}
                    </Row>
                </Tab>
                <Tab eventKey="Charts" title="Charts">
                    <div id="Charts" className="tabcontent">
                        <MainChart/>
                    </div>
                </Tab>
                <Tab eventKey="Insights" title="Insights" style={{margin:'0% 5%'}}>
                    {stockdata1 && (
                        <div id="Insights" className="tabcontent" style={{ display: 'block' }}>
                            <h3 id='insightsheading'>Insider Sentiments</h3>
                            <div className='Sentimentstable'>
                                <table className="table" id="itable">
                                    <thead>
                                        <tr>
                                            <th scope="col">{stockdata1.name}</th>
                                            <th scope="col">MSPR</th>
                                            <th scope="col">Change</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <th scope="row">Total</th>
                                            <td>{stockdata1.tm}</td>
                                            <td>{stockdata1.tc}</td>
                                        </tr>
                                        <tr>
                                            <th scope="row">Positive</th>
                                            <td>{stockdata1.pm}</td>
                                            <td>{stockdata1.pc}</td>
                                        </tr>
                                        <tr>
                                            <th scope="row">Negative</th>
                                            <td>{stockdata1.nm}</td>
                                            <td>{stockdata1.nc}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className='InsightCharts'>
                                <div className='ichart1'>
                                    <Chart2 inputData={stockdata1.Chart2data} />
                                </div>
                                <div className='ichart2'>
                                    <Chart3 data={stockdata1.Chart4data} />
                                </div>
                          </div>

                        </div>
                    )}
                </Tab>
            </Tabs>
     
    );

//   function openTab(tab) {
//     var i;
//     console.log(tab)
//     var x = document.getElementsByClassName("tabcontent");
   
//     for (i = 0; i < x.length; i++) {
//       x[i].style.display = "none";
//       console.log(x[i]);
//     }
//     document.getElementById(tab).style.display = "flex";
//   }
}
