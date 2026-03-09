import React, { useState, useEffect } from 'react';
import { customersApi } from '../services/api';
import './Customers.css';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await customersApi.getAll();
      setCustomers(data || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
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
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredCustomers = customers.filter((customer) => {
    const name = customer.name || '';
    const email = customer.email || '';
    const phone = customer.phone || '';
    
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm);
    const matchesTier = tierFilter === 'all' || customer.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const getTierBadge = (tier) => {
    const tiers = {
      bronze: { label: 'Bronze', class: 'bronze' },
      silver: { label: 'Silver', class: 'silver' },
      gold: { label: 'Gold', class: 'gold' },
      platinum: { label: 'Platinum', class: 'platinum' },
    };
    const info = tiers[tier] || tiers.bronze;
    return <span className={`tier-badge ${info.class}`}>{info.label}</span>;
  };

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  const getCustomerStats = () => {
    return {
      total: customers.length,
      active: customers.filter((c) => c.status === 'active').length,
      platinum: customers.filter((c) => c.tier === 'platinum').length,
      totalRevenue: customers.reduce((sum, c) => sum + (c.total_spent || 0), 0),
    };
  };

  const stats = getCustomerStats();

  if (loading) {
    return (
      <div className="customers-loading">
        <div className="loader-spinner"></div>
        <p>Loading customers...</p>
      </div>
    );
  }

  return (
    <div className="customers-page">
      <div className="page-header">
        <div className="header-left">
          <h1>Customers</h1>
          <p className="page-subtitle">Manage customer accounts and history</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={fetchCustomers}>
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
          <button className="btn btn-secondary">
            <i className="fas fa-file-export"></i> Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="customer-stats">
        <div className="cust-stat-card">
          <div className="cust-stat-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="cust-stat-info">
            <span className="cust-stat-value">{stats.total}</span>
            <span className="cust-stat-label">Total Customers</span>
          </div>
        </div>
        <div className="cust-stat-card">
          <div className="cust-stat-icon active">
            <i className="fas fa-user-check"></i>
          </div>
          <div className="cust-stat-info">
            <span className="cust-stat-value">{stats.active}</span>
            <span className="cust-stat-label">Active</span>
          </div>
        </div>
        <div className="cust-stat-card">
          <div className="cust-stat-icon platinum">
            <i className="fas fa-crown"></i>
          </div>
          <div className="cust-stat-info">
            <span className="cust-stat-value">{stats.platinum}</span>
            <span className="cust-stat-label">Platinum Members</span>
          </div>
        </div>
        <div className="cust-stat-card">
          <div className="cust-stat-icon revenue">
            <i className="fas fa-rupee-sign"></i>
          </div>
          <div className="cust-stat-info">
            <span className="cust-stat-value">{formatCurrency(stats.totalRevenue)}</span>
            <span className="cust-stat-label">Total Revenue</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="tier-filter">
          <button
            className={`filter-btn ${tierFilter === 'all' ? 'active' : ''}`}
            onClick={() => setTierFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn bronze ${tierFilter === 'bronze' ? 'active' : ''}`}
            onClick={() => setTierFilter('bronze')}
          >
            Bronze
          </button>
          <button
            className={`filter-btn silver ${tierFilter === 'silver' ? 'active' : ''}`}
            onClick={() => setTierFilter('silver')}
          >
            Silver
          </button>
          <button
            className={`filter-btn gold ${tierFilter === 'gold' ? 'active' : ''}`}
            onClick={() => setTierFilter('gold')}
          >
            Gold
          </button>
          <button
            className={`filter-btn platinum ${tierFilter === 'platinum' ? 'active' : ''}`}
            onClick={() => setTierFilter('platinum')}
          >
            Platinum
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="customers-table-container">
        <table className="customers-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Contact</th>
              <th>Tier</th>
              <th>Orders</th>
              <th>Total Spent</th>
              <th>Last Order</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => (
              <tr key={customer.id}>
                <td>
                  <div className="customer-cell">
                    <div className="customer-avatar">
                      {customer.avatar ? (
                        <img src={customer.avatar} alt={customer.name} />
                      ) : (
                        <span>{getInitials(customer.name)}</span>
                      )}
                    </div>
                    <div className="customer-info">
                      <span className="customer-name">{customer.name}</span>
                      <span className="customer-since">
                        Member since {new Date(customer.created_at).getFullYear()}
                      </span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="contact-cell">
                    <span className="customer-email">{customer.email}</span>
                    <span className="customer-phone">{customer.phone || '-'}</span>
                  </div>
                </td>
                <td>{getTierBadge(customer.tier)}</td>
                <td>{customer.total_orders || 0}</td>
                <td className="spent-cell">{formatCurrency(customer.total_spent)}</td>
                <td className="date-cell">
                  {customer.last_order_date ? formatDate(customer.last_order_date) : <span className="no-order">No orders yet</span>}
                </td>
                <td>
                  <span className={`status-badge ${customer.status}`}>
                    {customer.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn"
                      title="View Details"
                      onClick={() => handleViewCustomer(customer)}
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <button className="action-btn" title="View Orders">
                      <i className="fas fa-shopping-bag"></i>
                    </button>
                    <button className="action-btn" title="Send Email">
                      <i className="fas fa-envelope"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCustomers.length === 0 && (
          <div className="no-results">
            <i className="fas fa-users"></i>
            <p>No customers found</p>
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      {showModal && selectedCustomer && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal customer-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Customer Details</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="customer-profile">
                <div className="profile-avatar">
                  {selectedCustomer.avatar ? (
                    <img src={selectedCustomer.avatar} alt={selectedCustomer.name} />
                  ) : (
                    <span>{getInitials(selectedCustomer.name)}</span>
                  )}
                </div>
                <div className="profile-info">
                  <h2>{selectedCustomer.name}</h2>
                  {getTierBadge(selectedCustomer.tier)}
                </div>
              </div>

              <div className="customer-detail-grid">
                <div className="detail-card">
                  <i className="fas fa-envelope"></i>
                  <div>
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{selectedCustomer.email}</span>
                  </div>
                </div>
                <div className="detail-card">
                  <i className="fas fa-phone"></i>
                  <div>
                    <span className="detail-label">Phone</span>
                    <span className="detail-value">{selectedCustomer.phone}</span>
                  </div>
                </div>
                <div className="detail-card">
                  <i className="fas fa-map-marker-alt"></i>
                  <div>
                    <span className="detail-label">Address</span>
                    <span className="detail-value">{selectedCustomer.address || 'Not provided'}</span>
                  </div>
                </div>
                <div className="detail-card">
                  <i className="fas fa-calendar"></i>
                  <div>
                    <span className="detail-label">Member Since</span>
                    <span className="detail-value">{formatDate(selectedCustomer.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className="customer-stats-row">
                <div className="stat-box">
                  <span className="stat-number">{selectedCustomer.total_orders || 0}</span>
                  <span className="stat-text">Total Orders</span>
                </div>
                <div className="stat-box">
                  <span className="stat-number">{formatCurrency(selectedCustomer.total_spent)}</span>
                  <span className="stat-text">Total Spent</span>
                </div>
                <div className="stat-box">
                  <span className="stat-number">
                    {selectedCustomer.total_orders > 0
                      ? formatCurrency((selectedCustomer.total_spent || 0) / selectedCustomer.total_orders)
                      : '₹0'}
                  </span>
                  <span className="stat-text">Avg. Order Value</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Close
              </button>
              <button className="btn btn-primary">
                <i className="fas fa-shopping-bag"></i> View Orders
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
