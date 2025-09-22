// components/AdminGarbageChart.js

import React, { useEffect, useState } from 'react';
import { API_CONFIG } from '../config/api';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminGarbageChart = () => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to generate dynamic colors
  const generateColors = (num) => {
    const backgroundColors = [];
    const borderColors = [];
    for (let i = 0; i < num; i++) {
      const r = Math.floor(Math.random() * 255);
      const g = Math.floor(Math.random() * 255);
      const b = Math.floor(Math.random() * 255);
      backgroundColors.push(`rgba(${r}, ${g}, ${b}, 0.6)`);
      borderColors.push(`rgba(${r}, ${g}, ${b}, 1)`);
    }
    return { backgroundColors, borderColors };
  };

  useEffect(() => {
    const fetchGarbageStats = async () => {
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
        const res = await axios.get(API_CONFIG.ADMIN.GARBAGE_STATS, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('API Response:', res.data); // Debugging

        if (!Array.isArray(res.data)) {
          throw new Error('Unexpected API response format.');
        }

        const wasteTypes = res.data.map((item) => item._id);
        const totalWeights = res.data.map((item) => item.totalWeight);

        const { backgroundColors, borderColors } = generateColors(wasteTypes.length);

        setChartData({
          labels: wasteTypes,
          datasets: [
            {
              label: 'Total Weight (kg)',
              data: totalWeights,
              backgroundColor: backgroundColors,
              borderColor: borderColors,
              borderWidth: 1,
            },
          ],
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching garbage data:', err);
        setError('Error loading data.');
        setLoading(false);
      }
    };

    fetchGarbageStats();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <div>
      <h3>Old Garbage Data by Category</h3>
      {chartData.labels && chartData.labels.length > 0 ? (
        <Bar
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
                text: 'Garbage Collection Data',
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

export default AdminGarbageChart;
