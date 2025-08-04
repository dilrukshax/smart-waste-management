import React, { useContext, useState, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Trash2, User, Mail, Phone, Scale, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import '../styles/WasteRequestForm.css'; // Link to custom CSS

const WasteRequestForm = () => {
  const { auth } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    wasteItems: [
      { wasteType: 'food', weight: 0 },
      { wasteType: 'cardboard', weight: 0 },
      { wasteType: 'polythene', weight: 0 },
    ],
  });
  const [userInfo, setUserInfo] = useState({});
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch user profile data
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        setUserInfo(res.data);
      } catch (err) {
        console.error('Error fetching user info:', err);
        setError('Failed to fetch user information.');
      }
    };
    fetchUserInfo();
  }, [auth.token]);

  // Handle weight changes
  const handleWeightChange = (e, wasteType) => {
    setError('');
    const value = parseFloat(e.target.value);
    if (isNaN(value) || value < 0) {
      setError('Please enter a valid positive number for weight.');
      return;
    }
    const newWasteItems = formData.wasteItems.map((waste) =>
      waste.wasteType === wasteType ? { ...waste, weight: value } : waste
    );
    setFormData({ ...formData, wasteItems: newWasteItems });
  };

  // Submit the request
  const onSubmit = async (e) => {
    e.preventDefault();

    // Validate that at least one waste item has a positive weight
    const hasPositiveWeight = formData.wasteItems.some((item) => item.weight > 0);
    if (!hasPositiveWeight) {
      setError('Please enter a positive weight for at least one waste type.');
      return;
    }

    // Calculate total price
    const priceMap = {
      food: 50, // LKR per kg
      cardboard: 100, // LKR per kg
      polythene: 150, // LKR per kg
    };

    let totalPrice = 0;
    const processedWasteItems = formData.wasteItems.map((item) => {
      const itemPrice = priceMap[item.wasteType] * item.weight;
      totalPrice += itemPrice;
      return { ...item, totalPrice: itemPrice };
    });

    const processedFormData = { wasteItems: processedWasteItems };

    // Store formData in localStorage for payment processing
    localStorage.setItem('pendingRequest', JSON.stringify(processedFormData));

    // Redirect to payment page
    navigate('/payment');
  };

  return (
    <div className="waste-request-container">
      <div className="container-inner">
        {/* Header Section */}
        <div className="form-header">
          <div className="header-icon">
            <Trash2 size={32} />
          </div>
          <h1 className="form-title">Create Waste Collection Request</h1>
          <p className="form-subtitle">Schedule your waste pickup and help build a cleaner environment</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <div className="form-layout">
          {/* User Info Section */}
          <div className="user-info-section">
            <div className="section-header">
              <User size={24} />
              <h2>Your Information</h2>
            </div>
            <div className="user-info-card">
              <div className="info-item">
                <User size={18} className="info-icon" />
                <div className="info-content">
                  <label>Full Name</label>
                  <span>{userInfo.name || 'Loading...'}</span>
                </div>
              </div>
              <div className="info-item">
                <Mail size={18} className="info-icon" />
                <div className="info-content">
                  <label>Email Address</label>
                  <span>{userInfo.email || 'Loading...'}</span>
                </div>
              </div>
              <div className="info-item">
                <Phone size={18} className="info-icon" />
                <div className="info-content">
                  <label>Phone Number</label>
                  <span>{userInfo.phoneNumber || 'Not provided'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Waste Request Form */}
          <div className="waste-form-section">
            <div className="section-header">
              <Scale size={24} />
              <h2>Waste Details</h2>
            </div>
            
            <form onSubmit={onSubmit} className="waste-form">
              <p className="form-description">
                Enter the weight for each type of waste you want to collect. Our rates are competitive and eco-friendly!
              </p>
              
              <div className="waste-items-grid">
                {formData.wasteItems.map((waste) => {
                  const pricePerKg = waste.wasteType === 'food' ? 50 : waste.wasteType === 'cardboard' ? 100 : 150;
                  const totalPrice = waste.weight * pricePerKg;
                  
                  return (
                    <div key={waste.wasteType} className="waste-item-card">
                      <div className="card-header">
                        <div className="waste-icon">
                          {waste.wasteType === 'food' && '🍽️'}
                          {waste.wasteType === 'cardboard' && '📦'}
                          {waste.wasteType === 'polythene' && '🛍️'}
                        </div>
                        <h3 className="waste-title">
                          {waste.wasteType.charAt(0).toUpperCase() + waste.wasteType.slice(1)} Waste
                        </h3>
                        <span className="price-tag">LKR {pricePerKg}/kg</span>
                      </div>
                      
                      <div className="input-group">
                        <label htmlFor={`weight-${waste.wasteType}`} className="input-label">
                          <Scale size={16} />
                          Weight (kg)
                        </label>
                        <input
                          type="number"
                          id={`weight-${waste.wasteType}`}
                          min="0"
                          step="0.1"
                          value={waste.weight}
                          onChange={(e) => handleWeightChange(e, waste.wasteType)}
                          className="weight-input"
                          placeholder="0.0"
                        />
                      </div>
                      
                      {waste.weight > 0 && (
                        <div className="price-display">
                          <DollarSign size={16} />
                          <span>LKR {totalPrice.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Total Price Display */}
              {formData.wasteItems.some(item => item.weight > 0) && (
                <div className="total-section">
                  <div className="total-card">
                    <div className="total-header">
                      <CheckCircle size={24} />
                      <h3>Order Summary</h3>
                    </div>
                    <div className="total-breakdown">
                      {formData.wasteItems.map((waste) => {
                        if (waste.weight > 0) {
                          const pricePerKg = waste.wasteType === 'food' ? 50 : waste.wasteType === 'cardboard' ? 100 : 150;
                          const totalPrice = waste.weight * pricePerKg;
                          return (
                            <div key={waste.wasteType} className="breakdown-item">
                              <span className="item-name">
                                {waste.wasteType.charAt(0).toUpperCase() + waste.wasteType.slice(1)} ({waste.weight}kg)
                              </span>
                              <span className="item-price">LKR {totalPrice.toFixed(2)}</span>
                            </div>
                          );
                        }
                        return null;
                      })}
                      <div className="total-line">
                        <span className="total-label">Total Amount</span>
                        <span className="total-amount">
                          LKR {formData.wasteItems.reduce((total, waste) => {
                            const pricePerKg = waste.wasteType === 'food' ? 50 : waste.wasteType === 'cardboard' ? 100 : 150;
                            return total + (waste.weight * pricePerKg);
                          }, 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button type="submit" className="submit-btn">
                <CheckCircle size={20} />
                Proceed to Payment
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WasteRequestForm;
