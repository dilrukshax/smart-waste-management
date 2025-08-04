import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import { 
  User, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Package, 
  Plus, 
  Eye, 
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  Recycle
} from 'lucide-react';
import '../styles/UserDashboard.css'; // Import custom CSS

const UserDashboard = () => {
  const { auth } = useContext(AuthContext);
  const [invoices, setInvoices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRequests: 0,
    completedRequests: 0,
    pendingRequests: 0,
    totalSpent: 0,
    totalWaste: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch invoices
        const invoiceRes = await axios.get('http://localhost:5000/api/user/invoices', {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        setInvoices(invoiceRes.data);

        // Fetch user requests
        const requestRes = await axios.get('http://localhost:5000/api/request/user/my-requests', {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        setRequests(requestRes.data);

        // Calculate stats
        const totalRequests = requestRes.data.length;
        const completedRequests = requestRes.data.filter(r => r.status === 'completed').length;
        const pendingRequests = requestRes.data.filter(r => r.status === 'pending').length;
        const totalSpent = requestRes.data.reduce((sum, r) => sum + r.totalPrice, 0);
        const totalWaste = requestRes.data.reduce((sum, r) => 
          sum + r.wasteItems.reduce((wasteSum, item) => wasteSum + item.weight, 0), 0
        );

        setStats({
          totalRequests,
          completedRequests,
          pendingRequests,
          totalSpent,
          totalWaste
        });

      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [auth.token]);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">
          <Recycle className="loading-spinner" size={48} />
          <h3>Loading Dashboard...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="container-inner">
        {/* Welcome Header */}
        <div className="welcome-header">
          <div className="welcome-content">
            <div className="welcome-avatar">
              <User size={32} />
            </div>
            <div className="welcome-text">
              <h1 className="welcome-title">Welcome back, {auth.user.name || 'User'}!</h1>
              <p className="welcome-subtitle">Here's an overview of your waste management activities</p>
            </div>
          </div>
          <div className="current-date">
            <Calendar size={20} />
            <span>{new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon requests">
              <Package size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-number">{stats.totalRequests}</h3>
              <p className="stat-label">Total Requests</p>
              <span className="stat-trend">
                <TrendingUp size={14} />
                All time
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon completed">
              <CheckCircle size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-number">{stats.completedRequests}</h3>
              <p className="stat-label">Completed</p>
              <span className="stat-trend">
                <TrendingUp size={14} />
                {stats.totalRequests > 0 ? Math.round((stats.completedRequests / stats.totalRequests) * 100) : 0}% completion
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pending">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-number">{stats.pendingRequests}</h3>
              <p className="stat-label">Pending</p>
              <span className="stat-trend">
                <AlertCircle size={14} />
                In progress
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon money">
              <DollarSign size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-number">LKR {stats.totalSpent.toLocaleString()}</h3>
              <p className="stat-label">Total Spent</p>
              <span className="stat-trend">
                <TrendingUp size={14} />
                All payments
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon waste">
              <Recycle size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-number">{stats.totalWaste.toFixed(1)} kg</h3>
              <p className="stat-label">Total Waste</p>
              <span className="stat-trend">
                <TrendingUp size={14} />
                Collected
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2 className="section-title">Quick Actions</h2>
          <div className="actions-grid">
            <button className="action-card">
              <Plus size={24} />
              <span>New Request</span>
            </button>
            <button className="action-card">
              <Eye size={24} />
              <span>View Requests</span>
            </button>
            <button className="action-card">
              <Download size={24} />
              <span>Download Reports</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="recent-activity">
          <div className="section-header">
            <h2 className="section-title">Recent Activity</h2>
            <button className="view-all-btn">View All</button>
          </div>
          
          <div className="activity-grid">
            {/* Recent Requests */}
            <div className="activity-section">
              <h3 className="activity-title">Recent Requests</h3>
              <div className="activity-list">
                {requests.slice(0, 3).map((request, index) => (
                  <div key={request._id} className="activity-item">
                    <div className="activity-icon">
                      <Package size={16} />
                    </div>
                    <div className="activity-content">
                      <h4>Request #{index + 1}</h4>
                      <p>{new Date(request.createdAt).toLocaleDateString()}</p>
                      <span className={`status-badge status-${request.status}`}>
                        {request.status}
                      </span>
                    </div>
                    <div className="activity-amount">
                      LKR {request.totalPrice.toLocaleString()}
                    </div>
                  </div>
                ))}
                {requests.length === 0 && (
                  <div className="empty-activity">
                    <Package size={32} />
                    <p>No requests yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Invoices */}
            <div className="activity-section">
              <h3 className="activity-title">Recent Invoices</h3>
              <div className="activity-list">
                {invoices.slice(0, 3).map((invoice, index) => (
                  <div key={invoice._id} className="activity-item">
                    <div className="activity-icon">
                      <DollarSign size={16} />
                    </div>
                    <div className="activity-content">
                      <h4>Invoice #{index + 1}</h4>
                      <p>{new Date(invoice.periodStart).toLocaleDateString()} - {new Date(invoice.periodEnd).toLocaleDateString()}</p>
                      <span className="status-badge status-paid">Paid</span>
                    </div>
                    <div className="activity-amount">
                      LKR {invoice.totalAmount.toLocaleString()}
                    </div>
                  </div>
                ))}
                {invoices.length === 0 && (
                  <div className="empty-activity">
                    <DollarSign size={32} />
                    <p>No invoices yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Invoices Section */}
        {invoices.length > 0 && (
          <div className="invoices-section">
            <div className="section-header">
              <h2 className="section-title">Invoice History</h2>
              <button className="download-all-btn">
                <Download size={16} />
                Download All
              </button>
            </div>
            
            <div className="invoices-grid">
              {invoices.map((invoice, index) => (
                <div key={invoice._id} className="invoice-card">
                  <div className="invoice-header">
                    <div className="invoice-brand">
                      <div className="brand-icon">
                        <Recycle size={20} />
                      </div>
                      <div className="brand-info">
                        <h4>TrashMate</h4>
                        <p>Invoice #{index + 1}</p>
                      </div>
                    </div>
                    <div className="invoice-date">
                      <span className="date-label">Period</span>
                      <span className="date-value">
                        {new Date(invoice.periodStart).toLocaleDateString()} - {new Date(invoice.periodEnd).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="invoice-details">
                    <div className="waste-breakdown">
                      <h5>Waste Breakdown</h5>
                      <div className="breakdown-list">
                        {invoice.wasteDetails.map((detail, idx) => (
                          <div key={idx} className="breakdown-item">
                            <div className="item-info">
                              <span className="waste-type">{detail.wasteType}</span>
                              <span className="waste-weight">{detail.totalWeight} kg</span>
                            </div>
                            <div className="item-cost">
                              <span className="rate">LKR {detail.ratePerKg}/kg</span>
                              <span className="amount">LKR {detail.amount.toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="invoice-footer">
                    <div className="total-amount">
                      <span className="total-label">Total Amount</span>
                      <span className="total-value">LKR {invoice.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="invoice-actions">
                      <button className="action-btn view-btn">
                        <Eye size={16} />
                        View
                      </button>
                      <button className="action-btn download-btn">
                        <Download size={16} />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
