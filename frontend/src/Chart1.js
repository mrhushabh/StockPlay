import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

export const Chart1 = ({ tvalues, cvalues}) => {
  // Prepare data for Highcharts
  const data = tvalues.map((timestamp, index) => [timestamp, cvalues[index]]);
  const chartColor = 'green';
  // Highcharts configuration options
  const options = {
    chart: {
              backgroundColor: '#f3f3f3', // Set chart background color to grey
            },
    title: {
      text: 'Stock Chart'
    },
    xAxis: {
      type: 'datetime',
      title: {
        text: 'Timestamp'
      }
    },
    yAxis: {
      title: {
        text: ''
      },
            opposite: true, // Place y-axis on the right side
          },
    
    series: [{
      name: 'Stock Price',
      data: data,
      showInLegend:false,
      marker: {
        enabled: false // Disable markers (dots)
      },
      color: chartColor 
    }]
  };

  return (
    <div>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
};

// export default Chart1;

// import React from 'react';
// import Highcharts from 'highcharts';
// import HighchartsReact from 'highcharts-react-official';

//  export const Chart1 = ({ tvalues, cvalues}) => {
//   // Extract data from stockData
//   const data = {
//     x: tvalues,
//         // Date
//     y:cvalues,// Close price
//   };
  
// //   console.log(stockValue)
// //   const chartColor = stockValue >= 0 ? 'green' : 'red';
// const chartColor = 'green,';
//   // Highcharts configuration options
//   const options = {
//     chart: {
//       backgroundColor: '#f3f3f3', // Set chart background color to grey
//     },
//     title: {
//       text:'${stockData.ticker} Hourly Price Variation'
//     },
//     xAxis: {
//       type: 'datetime',
//     },
//     yAxis: {
//       title: {
//         text: ''
//       },
//       opposite: true, // Place y-axis on the right side
//     },
//     series: [{
//       data: data,
//       showInLegend:false,
//       marker: {
//         enabled: false // Disable markers (dots)
//       },
//       color: chartColor 
//     }],
//     tooltip: {
//     //   formatter: function() {
//     //     return '<b>' + stockData.ticker + '</b>: ' + this.y;
//     //   }
//     }
//   };

//   return (
//     <div>
//       <HighchartsReact highcharts={Highcharts} options={options} />
//     </div>
//   );
// };
