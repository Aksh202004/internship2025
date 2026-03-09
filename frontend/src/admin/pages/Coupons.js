import React, { useState, useEffect } from 'react';
import { couponsApi } from '../services/api';
import './Coupons.css';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    minimum_purchase: '',
    maximum_discount: '',
    usage_limit: '',
    start_date: '',
    end_date: '',
    description: '',
    is_active: true,
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await couponsApi.getAll();
      setCoupons(data || []);
    } catch (err) {
      console.error('Error fetching coupons:', err);
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

  const getCouponStatus = (coupon) => {
    if (!coupon.is_active) return 'inactive';
    const now = new Date();
    const start = coupon.start_date ? new Date(coupon.start_date) : null;
    const end = coupon.end_date ? new Date(coupon.end_date) : null;
    
    if (end && end < now) return 'expired';
    if (start && start > now) return 'scheduled';
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) return 'expired';
    return 'active';
  };

  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch = coupon.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const status = getCouponStatus(coupon);
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreateNew = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      discount_type: 'percentage',
      discount_value: '',
      minimum_purchase: '',
      maximum_discount: '',
      usage_limit: '',
      start_date: '',
      end_date: '',
      description: '',
      is_active: true,
    });
    setShowModal(true);
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code || '',
      discount_type: coupon.discount_type || 'percentage',
      discount_value: coupon.discount_value || '',
      minimum_purchase: coupon.minimum_purchase || '',
      maximum_discount: coupon.maximum_discount || '',
      usage_limit: coupon.usage_limit || '',
      start_date: coupon.start_date ? coupon.start_date.split('T')[0] : '',
      end_date: coupon.end_date ? coupon.end_date.split('T')[0] : '',
      description: coupon.description || '',
      is_active: coupon.is_active !== false,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const couponData = {
        code: formData.code.toUpperCase(),
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        minimum_purchase: formData.minimum_purchase ? parseFloat(formData.minimum_purchase) : 0,
        maximum_discount: formData.maximum_discount ? parseFloat(formData.maximum_discount) : null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        description: formData.description,
        is_active: formData.is_active,
      };

      if (editingCoupon) {
        await couponsApi.update(editingCoupon.id, couponData);
      } else {
        await couponsApi.create(couponData);
      }
      
      await fetchCoupons();
      setShowModal(false);
    } catch (err) {
      console.error('Error saving coupon:', err);
      alert('Failed to save coupon: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await couponsApi.delete(id);
        setCoupons(coupons.filter((c) => c.id !== id));
      } catch (err) {
        console.error('Error deleting coupon:', err);
        alert('Failed to delete coupon');
      }
    }
  };

  const handleToggleStatus = async (coupon) => {
    try {
      await couponsApi.toggleActive(coupon.id, !coupon.is_active);
      setCoupons(coupons.map((c) =>
        c.id === coupon.id ? { ...c, is_active: !c.is_active } : c
      ));
    } catch (err) {
      console.error('Error toggling coupon status:', err);
    }
  };

  const getStatusBadge = (coupon) => {
    const status = getCouponStatus(coupon);
    const statusMap = {
      active: { label: 'Active', class: 'active' },
      inactive: { label: 'Inactive', class: 'inactive' },
      expired: { label: 'Expired', class: 'expired' },
      scheduled: { label: 'Scheduled', class: 'scheduled' },
    };
    const info = statusMap[status] || statusMap.inactive;
    return <span className={`status-badge ${info.class}`}>{info.label}</span>;
  };

  const getCouponStats = () => {
    return {
      total: coupons.length,
      active: coupons.filter((c) => getCouponStatus(c) === 'active').length,
      expired: coupons.filter((c) => getCouponStatus(c) === 'expired').length,
      totalUsed: coupons.reduce((sum, c) => sum + (c.usage_count || 0), 0),
    };
  };

  const stats = getCouponStats();

  if (loading) {
    return (
      <div className="coupons-loading">
        <div className="loader-spinner"></div>
        <p>Loading coupons...</p>
      </div>
    );
  }

  return (
    <div className="coupons-page">
      <div className="page-header">
        <div className="header-left">
          <h1>Coupons & Discounts</h1>
          <p className="page-subtitle">Create and manage promotional codes</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={fetchCoupons}>
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
          <button className="btn btn-primary" onClick={handleCreateNew}>
            <i className="fas fa-plus"></i> Create Coupon
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="coupon-stats">
        <div className="coupon-stat">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total Coupons</span>
        </div>
        <div className="coupon-stat active">
          <span className="stat-value">{stats.active}</span>
          <span className="stat-label">Active</span>
        </div>
        <div className="coupon-stat expired">
          <span className="stat-value">{stats.expired}</span>
          <span className="stat-label">Expired</span>
        </div>
        <div className="coupon-stat">
          <span className="stat-value">{stats.totalUsed}</span>
          <span className="stat-label">Times Used</span>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search by coupon code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="status-select"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="expired">Expired</option>
          <option value="scheduled">Scheduled</option>
        </select>
      </div>

      {/* Coupons Grid */}
      <div className="coupons-grid">
        {filteredCoupons.map((coupon) => {
          const status = getCouponStatus(coupon);
          const usagePercent = coupon.usage_limit 
            ? (coupon.usage_count / coupon.usage_limit) * 100 
            : 0;
          return (
            <div key={coupon.id} className={`coupon-card ${status}`}>
              <div className="coupon-header">
                <div className="coupon-code">{coupon.code}</div>
                {getStatusBadge(coupon)}
              </div>
              <div className="coupon-value">
                {coupon.discount_type === 'percentage' ? (
                  <span>{coupon.discount_value}% OFF</span>
                ) : (
                  <span>{formatCurrency(coupon.discount_value)} OFF</span>
                )}
              </div>
              <p className="coupon-description">{coupon.description || 'No description'}</p>
              <div className="coupon-details">
                <div className="detail-row">
                  <span className="detail-label">Min. Order:</span>
                  <span className="detail-value">{formatCurrency(coupon.minimum_purchase)}</span>
                </div>
                {coupon.maximum_discount && (
                  <div className="detail-row">
                    <span className="detail-label">Max Discount:</span>
                    <span className="detail-value">{formatCurrency(coupon.maximum_discount)}</span>
                  </div>
                )}
                <div className="detail-row">
                  <span className="detail-label">Usage:</span>
                  <span className="detail-value">
                    {coupon.usage_count || 0} / {coupon.usage_limit || '∞'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Valid:</span>
                  <span className="detail-value">
                    {formatDate(coupon.start_date)} to {formatDate(coupon.end_date)}
                  </span>
                </div>
              </div>
              {coupon.usage_limit && (
                <div className="coupon-progress">
                  <div
                    className="progress-bar"
                    style={{ width: `${Math.min(usagePercent, 100)}%` }}
                  ></div>
                </div>
              )}
              <div className="coupon-actions">
                <button
                  className="action-btn"
                  title="Edit"
                  onClick={() => handleEdit(coupon)}
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button
                  className="action-btn"
                  title={coupon.is_active ? 'Deactivate' : 'Activate'}
                  onClick={() => handleToggleStatus(coupon)}
                  disabled={status === 'expired'}
                >
                  <i className={`fas fa-${coupon.is_active ? 'pause' : 'play'}`}></i>
                </button>
                <button
                  className="action-btn delete"
                  title="Delete"
                  onClick={() => handleDelete(coupon.id)}
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCoupons.length === 0 && (
        <div className="no-results">
          <i className="fas fa-ticket-alt"></i>
          <p>No coupons found</p>
          <button className="btn btn-primary" onClick={handleCreateNew}>
            Create Your First Coupon
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal coupon-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Coupon Code *</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="e.g., SUMMER20"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
                <div className="form-group">
                  <label>Discount Type *</label>
                  <select 
                    name="discount_type" 
                    value={formData.discount_type} 
                    onChange={handleInputChange}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Discount Value *</label>
                  <input
                    type="number"
                    name="discount_value"
                    value={formData.discount_value}
                    onChange={handleInputChange}
                    placeholder={formData.discount_type === 'percentage' ? 'e.g., 20' : 'e.g., 5000'}
                  />
                </div>
                <div className="form-group">
                  <label>Min. Order Value</label>
                  <input
                    type="number"
                    name="minimum_purchase"
                    value={formData.minimum_purchase}
                    onChange={handleInputChange}
                    placeholder="e.g., 5000"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Max Discount (for %)</label>
                  <input
                    type="number"
                    name="maximum_discount"
                    value={formData.maximum_discount}
                    onChange={handleInputChange}
                    placeholder="e.g., 2000"
                    disabled={formData.discount_type === 'fixed'}
                  />
                </div>
                <div className="form-group">
                  <label>Usage Limit</label>
                  <input
                    type="number"
                    name="usage_limit"
                    value={formData.usage_limit}
                    onChange={handleInputChange}
                    placeholder="Leave empty for unlimited"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of the coupon"
                  rows="2"
                ></textarea>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  Active (coupon can be used)
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : (editingCoupon ? 'Save Changes' : 'Create Coupon')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;
