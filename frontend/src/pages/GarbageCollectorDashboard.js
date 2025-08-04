// components/GarbageCollectorDashboard.js

import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Package, 
  User, 
  Calendar, 
  Weight, 
  DollarSign,
  Filter,
  Search,
  RefreshCw,
  Eye,
  Phone,
  Mail,
  Navigation
} from 'lucide-react';
import '../styles/GarbageCollectorDashboard.css';

const GarbageCollectorDashboard = () => {
  const { auth } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignedRequests();
  }, [auth.token]);

  useEffect(() => {
    filterRequests();
  }, [requests, searchTerm, statusFilter]);

  const fetchAssignedRequests = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await axios.get('http://localhost:5000/api/request/collector/assigned-requests', {
        headers: {
          Authorization: `Bearer ${auth.token}`, // Include token for authentication
        },
      });
      setRequests(res.data);
      calculateStats(res.data);
    } catch (err) {
      console.error('Error fetching assigned requests:', err);
      setError('Failed to fetch assigned requests.');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await fetchAssignedRequests();
    setIsRefreshing(false);
  };

  const calculateStats = (requestsData) => {
    const stats = {
      total: requestsData.length,
      pending: requestsData.filter(req => req.status === 'pending').length,
      inProgress: requestsData.filter(req => req.status === 'in-progress').length,
      completed: requestsData.filter(req => req.status === 'completed').length
    };
    setStats(stats);
  };

  const filterRequests = () => {
    let filtered = requests;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(req => 
        req.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.wasteItems.some(item => 
          item.wasteType.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }
    
    setFilteredRequests(filtered);
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Function to mark a request as completed
  const markAsCompleted = async (requestId) => {
    try {
      setError('');
      setSuccessMessage('');
      
      await axios.put(
        `http://localhost:5000/api/request/collector/complete/${requestId}`,
        {}, // No body needed as per backend implementation
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      
      // Update the local state to reflect the status change
      const updatedRequests = requests.map((req) =>
        req._id === requestId ? { ...req, status: 'completed' } : req
      );
      setRequests(updatedRequests);
      calculateStats(updatedRequests);
      setSuccessMessage('Request marked as completed successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update request status.');
    }
  };

  const markAsInProgress = async (requestId) => {
    try {
      setError('');
      setSuccessMessage('');
      
      // Assuming there's an endpoint for this, or you can create one
      const updatedRequests = requests.map((req) =>
        req._id === requestId ? { ...req, status: 'in-progress' } : req
      );
      setRequests(updatedRequests);
      calculateStats(updatedRequests);
      setSuccessMessage('Request marked as in progress!');
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update request status.');
    }
  };

  if (isLoading) {
    return (
      <div className="collector-loading">
        <div className="loading-spinner">
          <div className="spinner-large"></div>
          <p>Loading assigned requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="collector-dashboard">
      <div className="dashboard-wrapper">
        
        {/* Dashboard Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="header-left">
              <div className="header-icon">
                <Truck size={32} />
              </div>
              <div className="header-text">
                <h1 className="dashboard-title">Collector Dashboard</h1>
                <p className="dashboard-subtitle">Manage your assigned waste collection requests</p>
              </div>
            </div>
            <div className="header-right">
              <button 
                className={`refresh-button ${isRefreshing ? 'loading' : ''}`}
                onClick={refreshData}
                disabled={isRefreshing}
              >
                <RefreshCw size={18} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="alert alert-error" role="alert" aria-live="polite">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success" role="alert" aria-live="polite">
            <CheckCircle size={20} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-icon">
              <Package size={24} />
            </div>
            <div className="stat-content">
              <h3>{stats.total}</h3>
              <p>Total Requests</p>
            </div>
          </div>
          
          <div className="stat-card pending">
            <div className="stat-icon">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <h3>{stats.pending}</h3>
              <p>Pending</p>
            </div>
          </div>
          
          <div className="stat-card in-progress">
            <div className="stat-icon">
              <Truck size={24} />
            </div>
            <div className="stat-content">
              <h3>{stats.inProgress}</h3>
              <p>In Progress</p>
            </div>
          </div>
          
          <div className="stat-card completed">
            <div className="stat-icon">
              <CheckCircle size={24} />
            </div>
            <div className="stat-content">
              <h3>{stats.completed}</h3>
              <p>Completed</p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="filters-section">
          <div className="search-bar">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by customer name, email, or waste type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-dropdown">
            <Filter size={18} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Requests Grid */}
        <div className="requests-section">
          <div className="section-header">
            <h2 className="section-title">Assigned Requests ({filteredRequests.length})</h2>
          </div>
          
          {filteredRequests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-content">
                <Package size={64} />
                <h3>No Requests Found</h3>
                <p>
                  {requests.length === 0 
                    ? "You don't have any assigned requests yet." 
                    : "No requests match your current filters."
                  }
                </p>
                {requests.length > 0 && (
                  <button 
                    className="clear-filters-button"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="requests-grid">
              {filteredRequests.map((req) => (
                <div key={req._id} className="request-card">
                  
                  {/* Card Header */}
                  <div className="card-header">
                    <div className="customer-info">
                      <div className="customer-avatar">
                        <User size={20} />
                      </div>
                      <div className="customer-details">
                        <h3 className="customer-name">{req.user.name}</h3>
                        <div className="customer-contact">
                          <Mail size={14} />
                          <span>{req.user.email}</span>
                        </div>
                        {req.user.phoneNumber && (
                          <div className="customer-contact">
                            <Phone size={14} />
                            <span>{req.user.phoneNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className={`status-badge ${getStatusColor(req.status)}`}>
                      {req.status === 'completed' && <CheckCircle size={16} />}
                      {req.status === 'pending' && <Clock size={16} />}
                      {req.status === 'in-progress' && <Truck size={16} />}
                      <span>{req.status.charAt(0).toUpperCase() + req.status.slice(1)}</span>
                    </div>
                  </div>

                  {/* Request Info */}
                  <div className="request-info">
                    <div className="info-item">
                      <Calendar size={16} />
                      <span>Requested: {formatDate(req.createdAt)}</span>
                    </div>
                    {req.address && (
                      <div className="info-item">
                        <MapPin size={16} />
                        <span>{req.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Waste Items */}
                  <div className="waste-items">
                    <h4 className="waste-title">Waste Items</h4>
                    <div className="waste-list">
                      {req.wasteItems.map((item, index) => (
                        <div key={item._id || index} className="waste-item">
                          <div className="waste-details">
                            <div className="waste-type">
                              <Package size={14} />
                              <span>{item.wasteType.charAt(0).toUpperCase() + item.wasteType.slice(1)}</span>
                            </div>
                            {item.weight && (
                              <div className="waste-weight">
                                <Weight size={14} />
                                <span>{item.weight} kg</span>
                              </div>
                            )}
                          </div>
                          <div className="waste-price">
                            <DollarSign size={14} />
                            <span>{formatCurrency(item.totalPrice)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="total-price">
                      <span>Total: {formatCurrency(req.totalPrice)}</span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="card-actions">
                    {req.status === 'pending' && (
                      <button
                        className="action-button start"
                        onClick={() => markAsInProgress(req._id)}
                      >
                        <Truck size={16} />
                        Start Collection
                      </button>
                    )}
                    
                    {req.status === 'in-progress' && (
                      <button
                        className="action-button complete"
                        onClick={() => markAsCompleted(req._id)}
                      >
                        <CheckCircle size={16} />
                        Mark Completed
                      </button>
                    )}
                    
                    {req.status === 'completed' && (
                      <button className="action-button completed" disabled>
                        <CheckCircle size={16} />
                        Completed
                      </button>
                    )}
                    
                    <button
                      className="action-button secondary"
                      onClick={() => navigate(`/request-details/${req._id}`)}
                    >
                      <Eye size={16} />
                      View Details
                    </button>
                    
                    {req.address && (
                      <button
                        className="action-button navigation"
                        onClick={() => window.open(`https://maps.google.com/maps?q=${encodeURIComponent(req.address)}`, '_blank')}
                      >
                        <Navigation size={16} />
                        Navigate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GarbageCollectorDashboard;
