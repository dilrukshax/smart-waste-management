import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Users, 
  Calendar,
  Filter,
  RefreshCw,
  Download,
  Eye,
  EyeOff,
  Maximize2,
  Grid3X3,
  Layout,
  MoreVertical
} from 'lucide-react';
import AdminGarbageChart from '../components/AdminGarbageChart';
import AssignedCollectorChart from '../components/AssignedCollectorChart';
import MonthlyRequestsChart from '../components/MonthlyRequestsChart';
import GarbageCategoryChart from '../components/GarbageCategoryChart';
import '../styles/AdminCharts.css';

const AdminCharts = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [visibleCharts, setVisibleCharts] = useState({
    garbageData: true,
    collectors: true,
    monthly: true,
    categories: true
  });
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  };

  const toggleChartVisibility = (chartKey) => {
    setVisibleCharts(prev => ({
      ...prev,
      [chartKey]: !prev[chartKey]
    }));
  };

  const chartConfigs = [
    {
      key: 'garbageData',
      title: 'Garbage Collection Analytics',
      subtitle: 'Overview of waste collection data by category',
      icon: BarChart3,
      component: <AdminGarbageChart />,
      color: 'blue'
    },
    {
      key: 'collectors',
      title: 'Collector Assignment Statistics',
      subtitle: 'Distribution of assigned collectors and workload',
      icon: Users,
      component: <AssignedCollectorChart />,
      color: 'purple'
    },
    {
      key: 'monthly',
      title: 'Monthly Request Trends',
      subtitle: 'Number of waste collection requests over time',
      icon: TrendingUp,
      component: <MonthlyRequestsChart />,
      color: 'green'
    },
    {
      key: 'categories',
      title: 'Popular Waste Categories',
      subtitle: 'Most requested waste collection categories',
      icon: PieChart,
      component: <GarbageCategoryChart />,
      color: 'orange'
    }
  ];
  return (
    <div className="admin-charts-container">
      {/* Header Section */}
      <div className="charts-header">
        <div className="header-content">
          <div className="header-icon">
            <BarChart3 size={32} />
          </div>
          <div className="header-text">
            <h1 className="charts-title">Analytics Dashboard</h1>
            <p className="charts-subtitle">Comprehensive waste management analytics and insights</p>
          </div>
        </div>
        
        <div className="header-controls">
          <div className="control-group">
            <Filter size={18} />
            <select 
              value={selectedTimeRange} 
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="time-range-select"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
          
          <div className="view-controls">
            <button
              className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <Grid3X3 size={18} />
            </button>
            <button
              className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <Layout size={18} />
            </button>
          </div>
          
          <button 
            className="refresh-button"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw size={18} className={isRefreshing ? 'spinning' : ''} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Charts Grid/List */}
      <div className={`charts-layout ${viewMode}`}>
        {chartConfigs.map((chart) => {
          const IconComponent = chart.icon;
          
          return (
            <div 
              key={chart.key} 
              className={`chart-card ${chart.color} ${!visibleCharts[chart.key] ? 'hidden' : ''}`}
            >
              <div className="chart-card-header">
                <div className="chart-info">
                  <div className={`chart-icon ${chart.color}`}>
                    <IconComponent size={24} />
                  </div>
                  <div className="chart-details">
                    <h3 className="chart-title">{chart.title}</h3>
                    <p className="chart-subtitle">{chart.subtitle}</p>
                  </div>
                </div>
                
                <div className="chart-actions">
                  <button
                    className="action-button"
                    onClick={() => toggleChartVisibility(chart.key)}
                    title={visibleCharts[chart.key] ? 'Hide Chart' : 'Show Chart'}
                  >
                    {visibleCharts[chart.key] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  
                  <button className="action-button" title="Maximize">
                    <Maximize2 size={16} />
                  </button>
                  
                  <button className="action-button" title="Download">
                    <Download size={16} />
                  </button>
                  
                  <div className="dropdown">
                    <button className="action-button dropdown-trigger">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              </div>
              
              {visibleCharts[chart.key] && (
                <div className="chart-content">
                  <div className="chart-wrapper">
                    {chart.component}
                  </div>
                </div>
              )}
              
              {!visibleCharts[chart.key] && (
                <div className="chart-placeholder">
                  <IconComponent size={48} />
                  <p>Chart is hidden</p>
                  <button 
                    className="show-chart-button"
                    onClick={() => toggleChartVisibility(chart.key)}
                  >
                    <Eye size={16} />
                    Show Chart
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Stats Summary */}
      <div className="quick-stats">
        <h3 className="stats-title">
          <TrendingUp size={20} />
          Quick Insights
        </h3>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-icon blue">
              <BarChart3 size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-value">2,847</span>
              <span className="stat-label">Total Collections</span>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon purple">
              <Users size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-value">45</span>
              <span className="stat-label">Active Collectors</span>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon green">
              <TrendingUp size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-value">+12.5%</span>
              <span className="stat-label">Growth Rate</span>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon orange">
              <PieChart size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-value">8</span>
              <span className="stat-label">Categories</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCharts;
