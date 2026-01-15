import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
export const Chart3 = ({data}) => {
  if (!Array.isArray(data)) {
    console.error('Invalid data:', data);
    return null; // or display an error message
  }
    const categories = data.map(entry => `${entry.period}, Surprise: ${entry.surprise.toFixed(2)}`);

    let actualValues = data.map(entry => entry.actual);
    let estimateValues = data.map(entry => entry.estimate);
  
    // Replace null values with 0
    actualValues = actualValues.map(value => value === null ? 0 : value);
    estimateValues = estimateValues.map(value => value === null ? 0 : value);
  
    // Highcharts configuration options
    const options = {
      chart: {
        type: 'spline',
        backgroundColor: '#f2f2f2'
      },
      title: {
        text: 'Historical EPS Surprises'
      },
      xAxis: {
        categories: categories,
        title: {
          text: ''
        },
      },
      yAxis: {
        title: {
          text: 'Quarterly EPS'
        }
      },
      series: [
        { name: 'Actual', data: actualValues },
        { name: 'Estimate', data: estimateValues }
      ]
    };
  
    return (
      <div>
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
    );
  };

