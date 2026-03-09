import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    ordersToday: 0,
    pendingOrders: 0,
    lowStockItems: 0,
    totalProducts: 0,
    totalCustomers: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, ordersData, lowStockData] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getRecentOrders(5),
        dashboardApi.getLowStockProducts(5)
      ]);
      
      setStats(statsData);
      setRecentOrders(ordersData || []);
      setLowStockProducts(lowStockData || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Make sure to run the SQL schema in Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      processing: '#8b5cf6',
      shipped: '#06b6d4',
      delivered: '#10b981',
      cancelled: '#ef4444',
    };
    return colors[status] || '#666';
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <i className="fas fa-exclamation-circle"></i>
        <h3>Setup Required</h3>
        <p>{error}</p>
        <div className="setup-steps">
          <p>Steps to complete setup:</p>
          <ol>
            <li>Go to your <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer">Supabase Dashboard</a></li>
            <li>Open SQL Editor</li>
            <li>Copy contents of <code>supabase-schema.sql</code></li>
            <li>Paste and Run the SQL</li>
            <li>Create a Storage bucket named <code>product-images</code></li>
          </ol>
        </div>
        <button onClick={fetchDashboardData} className="btn btn-primary">Retry</button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="dashboard-subtitle">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon sales">
            <i className="fas fa-rupee-sign"></i>
          </div>
          <div className="stat-info">
            <h3>Total Sales</h3>
            <p className="stat-value">{formatCurrency(stats.totalSales)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orders">
            <i className="fas fa-shopping-bag"></i>
          </div>
          <div className="stat-info">
            <h3>Orders Today</h3>
            <p className="stat-value">{stats.ordersToday}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-info">
            <h3>Pending Orders</h3>
            <p className="stat-value">{stats.pendingOrders}</p>
            <span className="stat-link">
              <Link to="/admin/orders?status=pending">View all →</Link>
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon alert">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="stat-info">
            <h3>Low Stock Items</h3>
            <p className="stat-value">{stats.lowStockItems}</p>
            <span className="stat-link">
              <Link to="/admin/inventory?filter=low">View all →</Link>
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Recent Orders */}
        <div className="dashboard-card recent-orders">
          <div className="card-header">
            <h2>Recent Orders</h2>
            <Link to="/admin/orders" className="view-all-link">View All</Link>
          </div>
          <div className="card-content">
            {recentOrders.length > 0 ? (
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="order-id">
                        <Link to={`/admin/orders/${order.id}`}>{order.order_number}</Link>
                      </td>
                      <td>
                        {order.customer 
                          ? `${order.customer.first_name || ''} ${order.customer.last_name || ''}`
                          : 'Guest'
                        }
                      </td>
                      <td>{formatCurrency(order.total)}</td>
                      <td>
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(order.status) }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td>{formatDate(order.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-data">
                <i className="fas fa-inbox"></i>
                <p>No orders yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="dashboard-card low-stock">
          <div className="card-header">
            <h2>Low Stock Alert</h2>
            <Link to="/admin/inventory" className="view-all-link">Manage Inventory</Link>
          </div>
          <div className="card-content">
            {lowStockProducts.length > 0 ? (
              <ul className="low-stock-list">
                {lowStockProducts.map((item) => (
                  <li key={item.id} className="low-stock-item">
                    <img 
                      src={item.thumbnail_url || 'https://via.placeholder.com/50'} 
                      alt={item.name} 
                    />
                    <div className="item-info">
                      <span className="item-name">{item.name}</span>
                      <span className="item-stock">
                        <i className="fas fa-exclamation-circle"></i>
                        Only {item.stock} left
                      </span>
                    </div>
                    <Link to={`/admin/inventory`} className="restock-btn">Restock</Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="no-data">
                <i className="fas fa-check-circle"></i>
                <p>All products well stocked!</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card quick-actions">
          <div className="card-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="card-content">
            <div className="actions-grid">
              <Link to="/admin/products/new" className="action-btn">
                <i className="fas fa-plus"></i>
                <span>Add Product</span>
              </Link>
              <Link to="/admin/orders" className="action-btn">
                <i className="fas fa-box"></i>
                <span>Process Orders</span>
              </Link>
              <Link to="/admin/coupons" className="action-btn">
                <i className="fas fa-ticket-alt"></i>
                <span>Manage Coupons</span>
              </Link>
              <Link to="/admin/inventory" className="action-btn">
                <i className="fas fa-clipboard-list"></i>
                <span>Update Stock</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
