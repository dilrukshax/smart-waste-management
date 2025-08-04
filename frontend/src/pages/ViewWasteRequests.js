import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import { Eye, Calendar, User, DollarSign, Package, Clock, CheckCircle, AlertCircle, XCircle, Loader, X } from 'lucide-react';
import '../styles/ViewWasteRequests.css'; // Create this CSS file for custom styles

const ViewWasteRequests = () => {
  const { auth } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state for viewing request details
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    const fetchUserRequests = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/request/user/my-requests', {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });
        setRequests(response.data);
      } catch (err) {
        console.error('Error fetching user requests:', err);
        setError('Failed to fetch your waste collection requests.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRequests();
  }, [auth.token]);

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
  };

  return (
    <div className="view-requests-container">
      <div className="container-inner">
        {/* Header Section */}
        <div className="page-header">
          <div className="header-content">
            <div className="header-icon">
              <Package size={32} />
            </div>
            <div className="header-text">
              <h1 className="page-title">My Waste Collection Requests</h1>
              <p className="page-subtitle">Track your waste collection requests and their status</p>
            </div>
          </div>
          <div className="stats-summary">
            <div className="stat-item">
              <div className="stat-number">{requests.length}</div>
              <div className="stat-label">Total Requests</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">
                {requests.filter(r => r.status === 'completed').length}
              </div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">
                {requests.filter(r => r.status === 'pending').length}
              </div>
              <div className="stat-label">Pending</div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="content-section">
          {loading ? (
            <div className="loading-container">
              <Loader className="loading-spinner" size={32} />
              <span>Loading your requests...</span>
            </div>
          ) : error ? (
            <div className="error-container">
              <AlertCircle size={24} />
              <span>{error}</span>
            </div>
          ) : requests.length === 0 ? (
            <div className="empty-state">
              <Package size={64} className="empty-icon" />
              <h3>No Requests Found</h3>
              <p>You haven't made any waste collection requests yet.</p>
              <button className="create-request-btn">
                Create Your First Request
              </button>
            </div>
          ) : (
            <div className="requests-grid">
              {requests.map((request, index) => (
                <div key={request._id} className="request-card">
                  <div className="card-header">
                    <div className="request-number">#{index + 1}</div>
                    <div className={`status-badge status-${request.status}`}>
                      {getStatusIcon(request.status)}
                      <span>{capitalizeFirstLetter(request.status)}</span>
                    </div>
                  </div>
                  
                  <div className="card-content">
                    <div className="request-info">
                      <div className="info-row">
                        <Calendar size={16} />
                        <span className="info-label">Date Requested:</span>
                        <span className="info-value">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="info-row">
                        <User size={16} />
                        <span className="info-label">Collector:</span>
                        <span className="info-value">
                          {request.assignedCollector ? request.assignedCollector.name : 'Not Assigned'}
                        </span>
                      </div>
                      
                      <div className="info-row">
                        <DollarSign size={16} />
                        <span className="info-label">Total Price:</span>
                        <span className="info-value price">
                          LKR {request.totalPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="waste-items-preview">
                      <h4>Waste Items:</h4>
                      <div className="items-list">
                        {request.wasteItems.map((item, idx) => (
                          <div key={idx} className="item-preview">
                            <span className="item-type">
                              {getWasteIcon(item.wasteType)} {capitalizeFirstLetter(item.wasteType)}
                            </span>
                            <span className="item-weight">{item.weight}kg</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="card-footer">
                    <button
                      className="view-details-btn"
                      onClick={() => handleViewDetails(request)}
                    >
                      <Eye size={16} />
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Modal */}
      {showModal && selectedRequest && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <Package size={24} />
                <h3>Request Details</h3>
              </div>
              <button className="close-btn" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="request-details">
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Request ID:</label>
                    <span className="request-id">#{selectedRequest._id.slice(-8)}</span>
                  </div>
                  
                  <div className="detail-item">
                    <label>Status:</label>
                    <div className={`status-badge status-${selectedRequest.status}`}>
                      {getStatusIcon(selectedRequest.status)}
                      <span>{capitalizeFirstLetter(selectedRequest.status)}</span>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <label>Date Requested:</label>
                    <span>{new Date(selectedRequest.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="detail-item">
                    <label>Payment Status:</label>
                    <span className={`payment-status ${selectedRequest.paymentStatus}`}>
                      {selectedRequest.paymentStatus}
                    </span>
                  </div>
                  
                  <div className="detail-item">
                    <label>Total Price:</label>
                    <span className="total-price">LKR {selectedRequest.totalPrice.toLocaleString()}</span>
                  </div>
                  
                  {selectedRequest.assignedCollector && (
                    <div className="detail-item">
                      <label>Assigned Collector:</label>
                      <span>{selectedRequest.assignedCollector.name}</span>
                    </div>
                  )}
                </div>
                
                <div className="waste-items-section">
                  <h4>Waste Items Breakdown</h4>
                  <div className="waste-items-table">
                    {selectedRequest.wasteItems.map((item, idx) => (
                      <div key={idx} className="waste-item-row">
                        <div className="item-info">
                          <span className="item-icon">{getWasteIcon(item.wasteType)}</span>
                          <span className="item-name">{capitalizeFirstLetter(item.wasteType)}</span>
                        </div>
                        <div className="item-details">
                          <span className="weight">{item.weight} kg</span>
                          <span className="price">LKR {(item.weight * item.pricePerKg).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to capitalize the first letter
const capitalizeFirstLetter = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// Helper function to get status icon
const getStatusIcon = (status) => {
  switch (status) {
    case 'pending':
      return <Clock size={16} />;
    case 'completed':
      return <CheckCircle size={16} />;
    case 'cancelled':
      return <XCircle size={16} />;
    default:
      return <AlertCircle size={16} />;
  }
};

// Helper function to get waste type icon
const getWasteIcon = (wasteType) => {
  switch (wasteType) {
    case 'food':
      return '🍽️';
    case 'cardboard':
      return '📦';
    case 'polythene':
      return '🛍️';
    default:
      return '🗑️';
  }
};

export default ViewWasteRequests;
