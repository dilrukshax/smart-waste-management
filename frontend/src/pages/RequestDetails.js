import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import { 
  ArrowLeft, 
  Package, 
  Calendar, 
  DollarSign, 
  User, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  FileText,
  Scale,
  Loader,
  MapPin,
  Phone,
  Mail,
  Trash2,
  Recycle,
  Zap
} from 'lucide-react';
import '../styles/RequestDetails.css';

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        const response = await axios.get(`/api/request/${id}`, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });
        setRequest(response.data);
      } catch (err) {
        console.error('Error fetching request details:', err);
        setError('Failed to fetch request details.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequestDetails();
  }, [id, auth.token]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock size={20} className="status-icon pending" />;
      case 'completed':
        return <CheckCircle size={20} className="status-icon completed" />;
      case 'cancelled':
        return <XCircle size={20} className="status-icon cancelled" />;
      case 'in-progress':
        return <Package size={20} className="status-icon in-progress" />;
      default:
        return <AlertCircle size={20} className="status-icon default" />;
    }
  };

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

  const handleGoBack = () => {
    navigate('/view-requests');
  };

  if (loading) {
    return (
      <div className="request-details-container">
        <div className="loading-state">
          <Loader className="loading-spinner" size={48} />
          <h3>Loading Request Details...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="request-details-container">
        <div className="error-state">
          <AlertCircle size={48} className="error-icon" />
          <h3>Error Loading Request</h3>
          <p>{error}</p>
          <button className="back-btn" onClick={handleGoBack}>
            <ArrowLeft size={16} />
            Back to Requests
          </button>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="request-details-container">
        <div className="not-found-state">
          <Package size={48} className="not-found-icon" />
          <h3>Request Not Found</h3>
          <p>The requested waste collection request could not be found.</p>
          <button className="back-btn" onClick={handleGoBack}>
            <ArrowLeft size={16} />
            Back to Requests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="request-details-container">
      <div className="container-inner">
        {/* Header Section */}
        <div className="details-header">
          <button className="back-btn" onClick={handleGoBack}>
            <ArrowLeft size={16} />
            Back to Requests
          </button>
          
          <div className="header-content">
            <div className="header-icon">
              <Package size={32} />
            </div>
            <div className="header-text">
              <h1 className="page-title">Request Details</h1>
              <p className="page-subtitle">Complete information about your waste collection request</p>
            </div>
          </div>
          
          <div className="request-id-badge">
            <FileText size={16} />
            <span>#{request._id.slice(-8)}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="details-content">
          {/* Status Card */}
          <div className="status-card">
            <div className="status-header">
              <h3>Request Status</h3>
              <div className={`status-badge status-${request.status}`}>
                {getStatusIcon(request.status)}
                <span>{request.status.charAt(0).toUpperCase() + request.status.slice(1)}</span>
              </div>
            </div>
            
            <div className="status-timeline">
              <div className={`timeline-item ${request.status !== 'pending' ? 'completed' : 'active'}`}>
                <div className="timeline-icon">
                  <FileText size={16} />
                </div>
                <div className="timeline-content">
                  <h4>Request Submitted</h4>
                  <p>{new Date(request.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className={`timeline-item ${request.status === 'in-progress' || request.status === 'completed' ? 'completed' : request.assignedCollector ? 'active' : 'pending'}`}>
                <div className="timeline-icon">
                  <User size={16} />
                </div>
                <div className="timeline-content">
                  <h4>Collector Assigned</h4>
                  <p>{request.assignedCollector ? request.assignedCollector.name : 'Pending assignment'}</p>
                </div>
              </div>
              
              <div className={`timeline-item ${request.status === 'in-progress' ? 'active' : request.status === 'completed' ? 'completed' : 'pending'}`}>
                <div className="timeline-icon">
                  <Package size={16} />
                </div>
                <div className="timeline-content">
                  <h4>Collection in Progress</h4>
                  <p>{request.status === 'in-progress' ? 'Currently collecting' : request.status === 'completed' ? 'Collection completed' : 'Waiting for collection'}</p>
                </div>
              </div>
              
              <div className={`timeline-item ${request.status === 'completed' ? 'completed' : 'pending'}`}>
                <div className="timeline-icon">
                  <CheckCircle size={16} />
                </div>
                <div className="timeline-content">
                  <h4>Completed</h4>
                  <p>{request.status === 'completed' ? 'Request completed successfully' : 'Pending completion'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Request Information Grid */}
          <div className="info-grid">
            {/* Basic Information */}
            <div className="info-card">
              <div className="card-header">
                <Calendar size={20} />
                <h3>Request Information</h3>
              </div>
              <div className="info-list">
                <div className="info-item">
                  <span className="info-label">Request ID:</span>
                  <span className="info-value">{request._id}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Date Requested:</span>
                  <span className="info-value">{new Date(request.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Payment Status:</span>
                  <span className={`payment-status ${request.paymentStatus}`}>
                    {request.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Collector Information */}
            {request.assignedCollector && (
              <div className="info-card">
                <div className="card-header">
                  <User size={20} />
                  <h3>Assigned Collector</h3>
                </div>
                <div className="collector-info">
                  <div className="collector-avatar">
                    <User size={24} />
                  </div>
                  <div className="collector-details">
                    <h4>{request.assignedCollector.name}</h4>
                    <div className="contact-info">
                      {request.assignedCollector.email && (
                        <div className="contact-item">
                          <Mail size={14} />
                          <span>{request.assignedCollector.email}</span>
                        </div>
                      )}
                      {request.assignedCollector.phone && (
                        <div className="contact-item">
                          <Phone size={14} />
                          <span>{request.assignedCollector.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Financial Summary */}
            <div className="info-card financial-card">
              <div className="card-header">
                <DollarSign size={20} />
                <h3>Financial Summary</h3>
              </div>
              <div className="financial-content">
                <div className="total-amount">
                  <span className="amount-label">Total Amount</span>
                  <span className="amount-value">LKR {request.totalPrice.toLocaleString()}</span>
                </div>
                <div className="payment-breakdown">
                  <div className="breakdown-item">
                    <span>Service Fee:</span>
                    <span>LKR {(request.totalPrice * 0.1).toLocaleString()}</span>
                  </div>
                  <div className="breakdown-item">
                    <span>Collection Cost:</span>
                    <span>LKR {(request.totalPrice * 0.9).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Waste Items Section */}
          <div className="waste-items-section">
            <div className="section-header">
              <Scale size={24} />
              <h3>Waste Items Breakdown</h3>
            </div>
            
            <div className="waste-items-grid">
              {request.wasteItems.map((item, index) => {
                const itemTotal = item.weight * (item.pricePerKg || 0);
                return (
                  <div key={index} className="waste-item-card">
                    <div className="item-header">
                      <div className="item-icon">
                        {getWasteIcon(item.wasteType)}
                      </div>
                      <h4 className="item-type">
                        {item.wasteType.charAt(0).toUpperCase() + item.wasteType.slice(1)} Waste
                      </h4>
                    </div>
                    
                    <div className="item-details">
                      <div className="detail-row">
                        <Scale size={16} />
                        <span className="detail-label">Weight:</span>
                        <span className="detail-value">{item.weight} kg</span>
                      </div>
                      
                      {item.pricePerKg && (
                        <>
                          <div className="detail-row">
                            <DollarSign size={16} />
                            <span className="detail-label">Rate:</span>
                            <span className="detail-value">LKR {item.pricePerKg}/kg</span>
                          </div>
                          
                          <div className="detail-row total-row">
                            <span className="detail-label">Subtotal:</span>
                            <span className="detail-value total">LKR {itemTotal.toLocaleString()}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="waste-summary">
              <div className="summary-item">
                <span className="summary-label">Total Weight:</span>
                <span className="summary-value">
                  {request.wasteItems.reduce((total, item) => total + item.weight, 0)} kg
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Total Items:</span>
                <span className="summary-value">{request.wasteItems.length} types</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-section">
            <button className="action-btn primary">
              <FileText size={16} />
              Download Receipt
            </button>
            <button className="action-btn secondary">
              <Package size={16} />
              Track Collection
            </button>
            {request.status === 'pending' && (
              <button className="action-btn danger">
                <XCircle size={16} />
                Cancel Request
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetails;
