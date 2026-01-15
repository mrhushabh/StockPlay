import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

export const Chart2 = ({inputData}) => {
  // Prepare data for Highcharts
  if (!Array.isArray(inputData)) {
    console.error('Invalid data:', inputData);
    return null; // or display an error message
  }
  const periods = inputData.map(entry => {
    // Extract year and month part of the data.period value
    return entry.period.substr(0, 7); // Get the first 7 characters (yyyy-mm)
  });

  // Initialize series data for each recommendation type
  const seriesData = {
    strongBuy: [],
    buy: [],
    hold: [],
    sell: [],
    strongSell: []
  };

  // Populate seriesData with values for each recommendation type
  inputData.forEach(entry => {
    seriesData.strongBuy.push(entry.strongBuy);
    seriesData.buy.push(entry.buy);
    seriesData.hold.push(entry.hold);
    seriesData.sell.push(entry.sell);
    seriesData.strongSell.push(entry.strongSell);
  });

  // Highcharts configuration options
  const options = {
    chart: {
      type: 'column',
      backgroundColor: '#f3f3f3' // Set chart background color to #f3f3f3
    },
    title: {
      text: 'Recommendation Trends'
    },
    xAxis: {
      categories: periods // Use periods array for x-axis categories
    },
    yAxis: {
      title: {
        text: '#Analysis'
      },
      tickInterval: 10 // Set y-axis interval to 10 units
    },
    legend: {
      reversed: true
    },
    plotOptions: {
      column: {
        stacking: 'normal',
        dataLabels: {
          enabled: true,
          format: '{point.y}', // Display the y-value of each point
          color: 'black', // Text color
          style: {
            textOutline: 'none' // Disable text outline
          }
        }
      }
    },
    series: [
      { name: 'Strong Buy', data: seriesData.strongBuy, color: '#006400', 
        dataLabels: {
          color: 'white' // Set text color to white for "Strong Buy" stack
        }
      },
      { name: 'Buy', data: seriesData.buy, color: '#3ecf5b' },
      { name: 'Hold', data: seriesData.hold, color: '#c29b3a' },
      { name: 'Sell', data: seriesData.sell, color: '#e66a7a' },
      { name: 'Strong Sell', data: seriesData.strongSell, color: '#8B0000', 
        dataLabels: {
          color: 'white' // Set text color to white for "Strong Sell" stack
        }
      }
    ]
  };

  return (
    <div>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
};