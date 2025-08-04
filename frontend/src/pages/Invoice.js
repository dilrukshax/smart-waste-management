import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Package, 
  DollarSign, 
  Download, 
  ArrowLeft, 
  CheckCircle, 
  Clock,
  Recycle,
  Receipt,
  Printer
} from 'lucide-react';
import '../styles/Invoice.css';

const Invoice = () => {
  const { id } = useParams(); // Get request ID from URL params
  const [request, setRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequest = async () => {
      setIsLoading(true);
      setError('');
      try {
        const res = await axios.get(`http://localhost:5000/api/request/${id}`);
        setRequest(res.data);
      } catch (err) {
        console.error('Error fetching request data:', err);
        setError('Failed to load invoice data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchRequest();
    }
  }, [id]);

  const handlePrint = () => {
    setIsPrinting(true);
    window.print();
    setTimeout(() => setIsPrinting(false), 1000);
  };

  const handleDownload = () => {
    // Future implementation for PDF download
    alert('PDF download feature coming soon!');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'in-progress': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className="invoice-loading">
        <div className="loading-spinner">
          <div className="spinner-large"></div>
          <p>Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="invoice-error">
        <div className="error-content">
          <FileText size={48} />
          <h2>Invoice Not Found</h2>
          <p>{error}</p>
          <button className="back-button" onClick={() => navigate('/user-dashboard')}>
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="invoice-error">
        <div className="error-content">
          <FileText size={48} />
          <h2>Invoice Not Found</h2>
          <p>The requested invoice could not be found.</p>
          <button className="back-button" onClick={() => navigate('/user-dashboard')}>
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="invoice-container">
      <div className="invoice-wrapper">
        
        {/* Invoice Header */}
        <div className="invoice-header no-print">
          <div className="header-content">
            <div className="header-left">
              <button className="back-button" onClick={() => navigate('/user-dashboard')}>
                <ArrowLeft size={18} />
                Back to Dashboard
              </button>
            </div>
            <div className="header-right">
              <button className="action-button secondary" onClick={handleDownload}>
                <Download size={18} />
                Download PDF
              </button>
              <button 
                className={`action-button primary ${isPrinting ? 'loading' : ''}`} 
                onClick={handlePrint}
                disabled={isPrinting}
              >
                {isPrinting ? (
                  <>
                    <div className="spinner"></div>
                    Preparing...
                  </>
                ) : (
                  <>
                    <Printer size={18} />
                    Print Invoice
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Invoice Document */}
        <div className="invoice-document">
          
          {/* Company Header */}
          <div className="company-header">
            <div className="company-info">
              <div className="company-logo">
                <Recycle size={40} />
              </div>
              <div className="company-details">
                <h1 className="company-name">Smart Waste Management</h1>
                <p className="company-tagline">Sustainable Waste Solutions</p>
              </div>
            </div>
            <div className="invoice-meta">
              <h2 className="invoice-title">INVOICE</h2>
              <div className="invoice-number">#{request._id || id}</div>
              <div className="invoice-date">
                <Calendar size={16} />
                <span>{formatDate(request.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Invoice Status */}
          <div className="invoice-status-section">
            <div className={`status-badge ${getStatusColor(request.status)}`}>
              <CheckCircle size={16} />
              <span>Status: {request.status || 'Pending'}</span>
            </div>
          </div>

          {/* Billing Information */}
          <div className="billing-section">
            <div className="billing-grid">
              
              {/* Bill To */}
              <div className="billing-card">
                <h3 className="card-title">
                  <User size={20} />
                  Bill To
                </h3>
                <div className="customer-info">
                  <div className="info-item">
                    <User size={16} />
                    <span>{request.user?.name || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <Mail size={16} />
                    <span>{request.user?.email || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <Phone size={16} />
                    <span>{request.user?.phoneNumber || 'N/A'}</span>
                  </div>
                  {request.address && (
                    <div className="info-item">
                      <MapPin size={16} />
                      <span>{request.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Service Details */}
              <div className="billing-card">
                <h3 className="card-title">
                  <Package size={20} />
                  Service Details
                </h3>
                <div className="service-info">
                  <div className="info-item">
                    <Calendar size={16} />
                    <span>Requested: {formatDate(request.requestDate)}</span>
                  </div>
                  {request.scheduledDate && (
                    <div className="info-item">
                      <Clock size={16} />
                      <span>Scheduled: {formatDate(request.scheduledDate)}</span>
                    </div>
                  )}
                  <div className="info-item">
                    <Receipt size={16} />
                    <span>Invoice Date: {formatDate(request.createdAt)}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Items Table */}
          <div className="items-section">
            <h3 className="section-title">
              <Package size={20} />
              Waste Collection Items
            </h3>
            
            <div className="items-table">
              <div className="table-header">
                <div className="header-cell">Item</div>
                <div className="header-cell">Waste Type</div>
                <div className="header-cell">Package Size</div>
                <div className="header-cell">Quantity</div>
                <div className="header-cell">Unit Price</div>
                <div className="header-cell">Total</div>
              </div>
              
              <div className="table-body">
                {request.wasteItems && request.wasteItems.length > 0 ? (
                  request.wasteItems.map((waste, index) => (
                    <div key={index} className="table-row">
                      <div className="table-cell">
                        <div className="item-info">
                          <Recycle size={16} />
                          <span>Waste Collection #{index + 1}</span>
                        </div>
                      </div>
                      <div className="table-cell">
                        <span className="waste-type">{waste.wasteType || 'General Waste'}</span>
                      </div>
                      <div className="table-cell">
                        <span className="package-size">{waste.packageSize || 'Standard'}</span>
                      </div>
                      <div className="table-cell">
                        <span>1</span>
                      </div>
                      <div className="table-cell">
                        <span>{formatCurrency(waste.totalPrice || 0)}</span>
                      </div>
                      <div className="table-cell">
                        <span className="item-total">{formatCurrency(waste.totalPrice || 0)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="table-row empty-row">
                    <div className="table-cell" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                      No items found
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="summary-section">
            <div className="summary-content">
              <div className="summary-left">
                <div className="payment-info">
                  <h4>Payment Information</h4>
                  <p>Payment Method: {request.paymentMethod || 'Not specified'}</p>
                  <p>Payment Status: {request.paymentStatus || 'Pending'}</p>
                </div>
              </div>
              
              <div className="summary-right">
                <div className="totals">
                  <div className="total-row">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(request.totalPrice || 0)}</span>
                  </div>
                  <div className="total-row">
                    <span>Tax (0%):</span>
                    <span>{formatCurrency(0)}</span>
                  </div>
                  <div className="total-row discount">
                    <span>Discount:</span>
                    <span>-{formatCurrency(0)}</span>
                  </div>
                  <div className="total-row grand-total">
                    <span>Total Amount:</span>
                    <span>{formatCurrency(request.totalPrice || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="invoice-footer">
            <div className="footer-content">
              <div className="footer-section">
                <h4>Terms & Conditions</h4>
                <ul>
                  <li>Payment is due within 30 days of invoice date</li>
                  <li>Late payments may incur additional charges</li>
                  <li>Please ensure waste is properly sorted before collection</li>
                </ul>
              </div>
              <div className="footer-section">
                <h4>Contact Information</h4>
                <p>Smart Waste Management Ltd.</p>
                <p>Email: support@smartwaste.com</p>
                <p>Phone: +94 11 234 5678</p>
                <p>Website: www.smartwaste.com</p>
              </div>
            </div>
            <div className="footer-bottom">
              <p>Thank you for choosing Smart Waste Management!</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Invoice;
