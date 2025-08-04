// components/GarbageCollectionForm.js

import React, { useContext, useState } from 'react';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import { 
  X, 
  Plus, 
  Trash2, 
  Package, 
  Weight, 
  User, 
  CheckCircle, 
  AlertCircle, 
  Save,
  Recycle,
  Calculator,
  FileText
} from 'lucide-react';
import '../styles/GarbageCollectionForm.css';

const GarbageCollectionForm = ({ user, onClose }) => {
  const { auth } = useContext(AuthContext);
  const [wasteData, setWasteData] = useState([{ wasteType: 'food', weight: 0 }]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const wasteTypes = [
    { value: 'food', label: 'Food Waste', icon: '🍎', rate: 50 },
    { value: 'cardboard', label: 'Cardboard', icon: '📦', rate: 30 },
    { value: 'polythene', label: 'Polythene', icon: '🛍️', rate: 80 },
    { value: 'plastic', label: 'Plastic', icon: '♻️', rate: 60 },
    { value: 'glass', label: 'Glass', icon: '🍶', rate: 40 },
    { value: 'metal', label: 'Metal', icon: '🔧', rate: 70 },
    { value: 'paper', label: 'Paper', icon: '📄', rate: 25 },
    { value: 'organic', label: 'Organic', icon: '🌿', rate: 45 }
  ];

  const handleAddWasteType = () => {
    setWasteData([...wasteData, { wasteType: 'food', weight: 0 }]);
  };

  const handleRemoveWasteType = (index) => {
    if (wasteData.length > 1) {
      const newWasteData = wasteData.filter((_, i) => i !== index);
      setWasteData(newWasteData);
    }
  };

  const handleWasteDataChange = (index, field, value) => {
    const newWasteData = [...wasteData];
    newWasteData[index][field] = value;
    setWasteData(newWasteData);
    setError(''); // Clear errors when user makes changes
  };

  const validateForm = () => {
    for (let i = 0; i < wasteData.length; i++) {
      const item = wasteData[i];
      if (!item.wasteType) {
        setError(`Please select a waste type for item ${i + 1}`);
        return false;
      }
      if (!item.weight || parseFloat(item.weight) <= 0) {
        setError(`Please enter a valid weight for item ${i + 1}`);
        return false;
      }
    }
    return true;
  };

  const calculateTotalWeight = () => {
    return wasteData.reduce((total, item) => total + parseFloat(item.weight || 0), 0);
  };

  const calculateTotalPrice = () => {
    return wasteData.reduce((total, item) => {
      const wasteType = wasteTypes.find(type => type.value === item.wasteType);
      const rate = wasteType ? wasteType.rate : 50;
      return total + (parseFloat(item.weight || 0) * rate);
    }, 0);
  };

  const getWasteTypeInfo = (wasteType) => {
    return wasteTypes.find(type => type.value === wasteType) || wasteTypes[0];
  };

  const handleSubmitGarbageCollection = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      // Calculate totals for submission
      const enhancedWasteData = wasteData.map(item => ({
        ...item,
        weight: parseFloat(item.weight),
        rate: getWasteTypeInfo(item.wasteType).rate,
        totalPrice: parseFloat(item.weight) * getWasteTypeInfo(item.wasteType).rate
      }));

      await axios.post(
        `http://localhost:5000/api/collector/collect-garbage/${user._id}`,
        { 
          wasteData: enhancedWasteData,
          totalWeight: calculateTotalWeight(),
          totalPrice: calculateTotalPrice(),
          collectionDate: new Date().toISOString()
        },
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      
      setSuccessMessage('Garbage collection recorded successfully!');
      
      // Close after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error recording garbage collection:', err);
      setError('Failed to record garbage collection. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="collection-form-overlay">
      <div className="collection-form-modal">
        
        {/* Modal Header */}
        <div className="modal-header">
          <div className="header-content">
            <div className="header-icon">
              <Recycle size={24} />
            </div>
            <div className="header-text">
              <h2 className="modal-title">Record Garbage Collection</h2>
              <p className="modal-subtitle">Customer: {user?.name || 'Unknown'}</p>
            </div>
          </div>
          <button className="close-button" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="alert alert-error" role="alert" aria-live="polite">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success" role="alert" aria-live="polite">
            <CheckCircle size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Customer Info */}
        <div className="customer-info-section">
          <div className="customer-card">
            <div className="customer-avatar">
              <User size={20} />
            </div>
            <div className="customer-details">
              <h3>{user?.name || 'Unknown Customer'}</h3>
              <p>{user?.email || 'No email provided'}</p>
              {user?.phoneNumber && <p>{user.phoneNumber}</p>}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="modal-body">
          
          {/* Waste Items */}
          <div className="waste-items-section">
            <div className="section-header">
              <h3 className="section-title">
                <Package size={20} />
                Waste Items
              </h3>
              <span className="items-count">{wasteData.length} item{wasteData.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="waste-items-list">
              {wasteData.map((data, index) => {
                const wasteTypeInfo = getWasteTypeInfo(data.wasteType);
                const itemPrice = parseFloat(data.weight || 0) * wasteTypeInfo.rate;
                
                return (
                  <div key={index} className="waste-item-card">
                    
                    {/* Item Header */}
                    <div className="item-header">
                      <div className="item-number">
                        <span>#{index + 1}</span>
                      </div>
                      {wasteData.length > 1 && (
                        <button 
                          className="remove-item-button"
                          onClick={() => handleRemoveWasteType(index)}
                          aria-label={`Remove item ${index + 1}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    {/* Item Form */}
                    <div className="item-form">
                      
                      {/* Waste Type Selection */}
                      <div className="form-group">
                        <label className="form-label">
                          <Package size={16} />
                          Waste Type
                        </label>
                        <div className="select-wrapper">
                          <select
                            value={data.wasteType}
                            onChange={(e) => handleWasteDataChange(index, 'wasteType', e.target.value)}
                            className="form-select"
                          >
                            {wasteTypes.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.icon} {type.label} (LKR {type.rate}/kg)
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Weight Input */}
                      <div className="form-group">
                        <label className="form-label">
                          <Weight size={16} />
                          Weight (kg)
                        </label>
                        <div className="input-wrapper">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={data.weight}
                            onChange={(e) => handleWasteDataChange(index, 'weight', e.target.value)}
                            placeholder="Enter weight"
                            className="form-input"
                          />
                          <span className="input-unit">kg</span>
                        </div>
                      </div>

                      {/* Item Summary */}
                      <div className="item-summary">
                        <div className="summary-row">
                          <span>Rate:</span>
                          <span>LKR {wasteTypeInfo.rate}/kg</span>
                        </div>
                        <div className="summary-row total">
                          <span>Subtotal:</span>
                          <span>LKR {itemPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add More Button */}
            <button 
              className="add-item-button"
              onClick={handleAddWasteType}
              type="button"
            >
              <Plus size={18} />
              Add More Waste Type
            </button>
          </div>

          {/* Collection Summary */}
          <div className="collection-summary">
            <div className="summary-card">
              <div className="summary-header">
                <Calculator size={20} />
                <h3>Collection Summary</h3>
              </div>
              
              <div className="summary-content">
                <div className="summary-stats">
                  <div className="stat-item">
                    <div className="stat-icon">
                      <Package size={18} />
                    </div>
                    <div className="stat-info">
                      <span className="stat-label">Items</span>
                      <span className="stat-value">{wasteData.length}</span>
                    </div>
                  </div>
                  
                  <div className="stat-item">
                    <div className="stat-icon">
                      <Weight size={18} />
                    </div>
                    <div className="stat-info">
                      <span className="stat-label">Total Weight</span>
                      <span className="stat-value">{calculateTotalWeight().toFixed(1)} kg</span>
                    </div>
                  </div>
                  
                  <div className="stat-item total-price">
                    <div className="stat-icon">
                      <FileText size={18} />
                    </div>
                    <div className="stat-info">
                      <span className="stat-label">Total Amount</span>
                      <span className="stat-value">LKR {calculateTotalPrice().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button 
            className="action-button secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            className={`action-button primary ${isLoading ? 'loading' : ''}`}
            onClick={handleSubmitGarbageCollection}
            disabled={isLoading || wasteData.length === 0}
          >
            {isLoading ? (
              <>
                <div className="spinner"></div>
                Recording...
              </>
            ) : (
              <>
                <Save size={18} />
                Record Collection
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GarbageCollectionForm;
