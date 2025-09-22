// Example of how to use the new API_CONFIG in your components

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../config/api';

const ExampleComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // ✅ NEW WAY: Using centralized API configuration
        const response = await axios.get(API_CONFIG.AUTH.PROFILE, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(response.data);

        // For dynamic URLs, use the helper functions:
        const requestResponse = await axios.get(API_CONFIG.REQUEST.BY_ID('12345'));
        
        // You can also use the base URL helper:
        const customResponse = await axios.get(`${API_CONFIG.BASE_URL}/api/custom/endpoint`);
        
      } catch (error) {
        console.error('API call failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (formData) => {
    try {
      // ✅ NEW WAY: All API endpoints are centralized
      const response = await axios.post(API_CONFIG.REQUEST.CREATE, formData);
      console.log('Request created:', response.data);
    } catch (error) {
      console.error('Failed to create request:', error);
    }
  };

  return (
    <div>
      <h2>Example Component</h2>
      {loading ? <p>Loading...</p> : <p>Data loaded!</p>}
      
      {/* Your component JSX here */}
    </div>
  );
};

export default ExampleComponent;

/*
❌ OLD WAY (Don't do this):
const response = await axios.get('http://localhost:3001/api/auth/profile');

✅ NEW WAY (Do this):
const response = await axios.get(API_CONFIG.AUTH.PROFILE);

Benefits:
1. Environment-aware: Works in development, staging, and production
2. Centralized: All endpoints defined in one place
3. Type-safe: Reduces typos and errors
4. Maintainable: Easy to update when backend URLs change
5. Scalable: Easy to add new endpoints
*/
