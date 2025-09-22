import React, { useContext, useEffect, useState } from 'react';
import { API_CONFIG } from '../config/api';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  ClipboardList, 
  CheckCircle, 
  Clock, 
  UserCheck, 
  Search,
  Filter,
  Edit3,
  Trash2,
  UserPlus,
  Package,
  Weight,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Eye,
  RefreshCw
} from 'lucide-react';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const { auth } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [garbageCollectors, setGarbageCollectors] = useState([]);
  const [selectedCollector, setSelectedCollector] = useState({});
  const [showCompleted, setShowCompleted] = useState(false);
  const [editing, setEditing] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [requestsRes, collectorsRes] = await Promise.all([
          axios.get(API_CONFIG.REQUEST.ADMIN_REQUESTS, {
            headers: { Authorization: `Bearer ${auth.token}` },
          }),
          axios.get(API_CONFIG.AUTH.GARBAGE_COLLECTORS, {
            headers: { Authorization: `Bearer ${auth.token}` },
          })
        ]);
        
        setRequests(requestsRes.data);
        setGarbageCollectors(collectorsRes.data);
        setError('');
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [auth.token]);

  const assignCollector = async (requestId) => {
    try {
      if (!selectedCollector[requestId]) {
        setError('Please select a garbage collector.');
        return;
      }

      setLoading(true);
      await axios.put(
        `http://localhost:3001/api/request/admin/assign/${requestId}`,
        { collectorId: selectedCollector[requestId] },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );

      // Reload requests after assigning
      const res = await axios.get(API_CONFIG.REQUEST.ADMIN_REQUESTS, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      
      setRequests(res.data);
      setEditing({ ...editing, [requestId]: false });
      setSelectedCollector({ ...selectedCollector, [requestId]: '' });
      setError('');
      setSuccess('Collector assigned successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error assigning collector:', err);
      setError('Failed to assign collector.');
    } finally {
      setLoading(false);
    }
  };

  const handleCollectorChange = (e, requestId) => {
    setSelectedCollector({
      ...selectedCollector,
      [requestId]: e.target.value,
    });
  };

  const deleteRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to delete this request?')) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`http://localhost:3001/api/request/${requestId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      
      // Refresh requests after deletion
      const res = await axios.get(API_CONFIG.REQUEST.ADMIN_REQUESTS, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      
      setRequests(res.data);
      setError('');
      setSuccess('Request deleted successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting request:', err);
      setError('Failed to delete request.');
    } finally {
      setLoading(false);
    }
  };

  // Filter and search functionality
  const filteredRequests = requests.filter((req) => {
    const matchesSearch = req.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.wasteItems.some(item => item.wasteType.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    const matchesTab = showCompleted ? req.status === 'completed' : req.status !== 'completed';
    
    return matchesSearch && matchesStatus && matchesTab;
  });

  // Calculate dashboard statistics
  const stats = {
    totalRequests: requests.length,
    pendingRequests: requests.filter(req => req.status === 'pending').length,
    assignedRequests: requests.filter(req => req.status === 'assigned').length,
    completedRequests: requests.filter(req => req.status === 'completed').length,
    totalRevenue: requests.reduce((sum, req) => sum + (req.totalPrice || 0), 0),
    activeCollectors: garbageCollectors.length
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'assigned': return 'status-assigned';
      case 'completed': return 'status-completed';
      default: return 'status-default';
    }
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_CONFIG.REQUEST.ADMIN_REQUESTS, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setRequests(res.data);
      setSuccess('Data refreshed successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to refresh data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-dashboard-container">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-icon">
            <ClipboardList size={32} />
          </div>
          <div className="header-text">
            <h1 className="dashboard-title">Admin Dashboard</h1>
            <p className="dashboard-subtitle">Manage waste collection requests and monitor system performance</p>
          </div>
        </div>
        <button 
          className="refresh-button"
          onClick={refreshData}
          disabled={loading}
        >
          <RefreshCw size={18} className={loading ? 'spinning' : ''} />
          Refresh
        </button>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          {error}
        </div>
      )}
      
      {success && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          {success}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <ClipboardList size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.totalRequests}</h3>
            <p>Total Requests</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon pending">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.pendingRequests}</h3>
            <p>Pending</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon assigned">
            <UserCheck size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.assignedRequests}</h3>
            <p>Assigned</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon completed">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.completedRequests}</h3>
            <p>Completed</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon revenue">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.totalRevenue.toLocaleString()} LKR</h3>
            <p>Total Revenue</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon collectors">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.activeCollectors}</h3>
            <p>Active Collectors</p>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="controls-section">
        <div className="tab-buttons">
          <button
            className={`tab-button ${!showCompleted ? 'active' : ''}`}
            onClick={() => setShowCompleted(false)}
          >
            <Clock size={18} />
            Active Requests ({stats.totalRequests - stats.completedRequests})
          </button>
          <button
            className={`tab-button ${showCompleted ? 'active' : ''}`}
            onClick={() => setShowCompleted(true)}
          >
            <CheckCircle size={18} />
            Completed Requests ({stats.completedRequests})
          </button>
        </div>

        <div className="filters-section">
          <div className="search-container">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by user name or waste type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-container">
            <Filter size={18} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      )}

      {/* Requests Table */}
      {!loading && (
        <div className="table-container">
          <div className="table-header">
            <h2>
              {showCompleted ? 'Completed Requests' : 'Active Requests'} 
              <span className="count-badge">{filteredRequests.length}</span>
            </h2>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="empty-state">
              <ClipboardList size={48} />
              <h3>No requests found</h3>
              <p>
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'No requests available at the moment'
                }
              </p>
            </div>
          ) : (
            <div className="requests-grid">
              {filteredRequests.map((req) => (
                <div key={req._id} className="request-card">
                  <div className="request-header">
                    <div className="user-info">
                      <div className="user-avatar">
                        <Users size={20} />
                      </div>
                      <div className="user-details">
                        <h3>{req.user.name}</h3>
                        <p>Customer ID: {req.user._id.slice(-6)}</p>
                      </div>
                    </div>
                    <div className={`status-badge ${getStatusColor(req.status)}`}>
                      {req.status === 'pending' && <Clock size={14} />}
                      {req.status === 'assigned' && <UserCheck size={14} />}
                      {req.status === 'completed' && <CheckCircle size={14} />}
                      {req.status}
                    </div>
                  </div>

                  <div className="waste-items">
                    <h4>
                      <Package size={16} />
                      Waste Items ({req.wasteItems.length})
                    </h4>
                    <div className="items-list">
                      {req.wasteItems.map((item, index) => (
                        <div key={item._id || index} className="waste-item">
                          <span className="item-type">{item.wasteType}</span>
                          <span className="item-weight">
                            <Weight size={14} />
                            {item.weight} kg
                          </span>
                          <span className="item-price">{item.totalPrice} LKR</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="request-summary">
                    <div className="summary-item">
                      <span className="summary-label">Total Price:</span>
                      <span className="summary-value">{req.totalPrice} LKR</span>
                    </div>
                  </div>

                  <div className="collector-section">
                    <div className="collector-info">
                      <UserCheck size={16} />
                      <span>Assigned Collector:</span>
                    </div>
                    
                    {editing[req._id] ? (
                      <div className="collector-controls">
                        <select
                          value={selectedCollector[req._id] || ''}
                          onChange={(e) => handleCollectorChange(e, req._id)}
                          className="collector-select"
                        >
                          <option value="">Select Collector</option>
                          {garbageCollectors.map((collector) => (
                            <option key={collector._id} value={collector._id}>
                              {collector.name}
                            </option>
                          ))}
                        </select>
                        <button
                          className="action-button save"
                          onClick={() => assignCollector(req._id)}
                          disabled={!selectedCollector[req._id]}
                        >
                          <CheckCircle size={16} />
                          Save
                        </button>
                        <button
                          className="action-button cancel"
                          onClick={() => setEditing({ ...editing, [req._id]: false })}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="collector-display">
                        <span className="collector-name">
                          {req.assignedCollector ? req.assignedCollector.name : 'Not Assigned'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="request-actions">
                    {req.status === 'completed' ? (
                      <button
                        className="action-button delete"
                        onClick={() => deleteRequest(req._id)}
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    ) : editing[req._id] ? null : req.assignedCollector ? (
                      <button
                        className="action-button edit"
                        onClick={() => setEditing({ ...editing, [req._id]: true })}
                      >
                        <Edit3 size={16} />
                        Edit Assignment
                      </button>
                    ) : (
                      <div className="assignment-controls">
                        <select
                          value={selectedCollector[req._id] || ''}
                          onChange={(e) => handleCollectorChange(e, req._id)}
                          className="collector-select"
                        >
                          <option value="">Select Collector</option>
                          {garbageCollectors.map((collector) => (
                            <option key={collector._id} value={collector._id}>
                              {collector.name}
                            </option>
                          ))}
                        </select>
                        <button
                          className="action-button assign"
                          onClick={() => assignCollector(req._id)}
                          disabled={!selectedCollector[req._id]}
                        >
                          <UserPlus size={16} />
                          Assign
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
