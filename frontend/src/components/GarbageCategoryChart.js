import React, { useEffect, useState } from 'react';
import { API_CONFIG } from '../config/api';
import { Pie } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

// Register necessary Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const GarbageCategoryChart = () => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        const authData = localStorage.getItem('authData');
        let token = '';
        if (authData) {
          const parsedAuthData = JSON.parse(authData);
          token = parsedAuthData.token || parsedAuthData;
        }

        const res = await axios.get(API_CONFIG.ADMIN.GARBAGE_CATEGORY_COUNT, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!Array.isArray(res.data)) {
          throw new Error('Unexpected API response format.');
        }

        const labels = res.data.map(item => item._id); // Garbage types (food, cardboard, polythene)
        const weights = res.data.map(item => item.totalWeight); // Total weight for each category

        setChartData({
          labels,
          datasets: [
            {
              label: 'Garbage Categories',
              data: weights,
              backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
              hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
            },
          ],
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching garbage category counts:', err);
        setError('Error loading category data.');
        setLoading(false);
      }
    };

    fetchCategoryCounts();
  }, []);

  if (loading) {
    return <div>Loading Garbage Category Data...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <div>
      <h3>Most Requested Garbage Categories</h3>
      <Pie
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Garbage Category Requests',
            },
          },
        }}
      />
    </div>
  );
};

export default GarbageCategoryChart;
