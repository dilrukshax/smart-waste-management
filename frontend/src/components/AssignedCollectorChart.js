// components/AssignedCollectorChart.js

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

const AssignedCollectorChart = () => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCollectorAssignments = async () => {
      try {
        const authData = localStorage.getItem('authData');
        let token = '';
        if (authData) {
          const parsedAuthData = JSON.parse(authData);
          token = parsedAuthData.token || parsedAuthData;
        } else {
          setError('No authentication data found.');
          setLoading(false);
          return;
        }

        const res = await axios.get(API_CONFIG.ADMIN.COLLECTOR_ASSIGNMENTS, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('Collector Assignments Response:', res.data);

        const collectorNames = res.data.map((item) => item.collectorName);
        const assignedUsers = res.data.map((item) => item.assignedUsers);

        setChartData({
          labels: collectorNames,
          datasets: [
            {
              label: 'Assigned Users',
              data: assignedUsers,
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
          ],
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching collector assignments:', err);
        setError('Error loading data.');
        setLoading(false);
      }
    };

    fetchCollectorAssignments();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <div>
      <h3>Number of Users Assigned to Garbage Collectors</h3>
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
                text: 'Users Assigned to Garbage Collectors',
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

export default AssignedCollectorChart;
