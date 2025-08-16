import React, { useEffect, useState } from 'react';
import { API_CONFIG } from '../config/api';
import { Line } from 'react-chartjs-2'; // Using Line chart for trend visualization
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const MonthlyRequestsChart = () => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to map month numbers to month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    const fetchRequestsPerMonth = async () => {
      try {
        // Retrieve and parse the auth token
        const authData = localStorage.getItem('authData');
        let token = '';
        if (authData) {
          try {
            const parsedAuthData = JSON.parse(authData);
            token = parsedAuthData.token || parsedAuthData; // Adjust based on how token is stored
          } catch (parseError) {
            console.error('Error parsing authData from localStorage:', parseError);
            setError('Invalid authentication data.');
            setLoading(false);
            return;
          }
        } else {
          setError('No authentication data found.');
          setLoading(false);
          return;
        }

        // Make API request with Authorization header
        const res = await axios.get(API_CONFIG.ADMIN.REQUESTS_PER_MONTH, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!Array.isArray(res.data)) {
          throw new Error('Unexpected API response format.');
        }

        const labels = res.data.map(item => monthNames[item.month - 1]);
        const data = res.data.map(item => item.totalRequests);

        setChartData({
          labels,
          datasets: [
            {
              label: 'Number of Requests',
              data,
              fill: false,
              backgroundColor: 'rgba(75,192,192,0.4)',
              borderColor: 'rgba(75,192,192,1)',
            },
          ],
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching requests per month:', err);
        setError('Error loading requests data.');
        setLoading(false);
      }
    };

    fetchRequestsPerMonth();
  }, []);

  if (loading) {
    return <div>Loading Requests Data...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <div>
      <h3>Number of Waste Collection Requests per Month</h3>
      {chartData.labels && chartData.labels.length > 0 ? (
        <Line
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                display: true,
                position: 'top',
              },
              title: {
                display: true,
                text: 'Monthly Requests Trend',
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1,
                },
              },
            },
          }}
        />
      ) : (
        <p>No data available to display.</p>
      )}
    </div>
  );
};

export default MonthlyRequestsChart;
