import React, { useState, useEffect } from 'react';
import { ordersApi } from '../services/api';
import './Orders.css';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: '#f59e0b' },
  { value: 'processing', label: 'Processing', color: '#8b5cf6' },
  { value: 'shipped', label: 'Shipped', color: '#06b6d4' },
  { value: 'delivered', label: 'Delivered', color: '#10b981' },
  { value: 'cancelled', label: 'Cancelled', color: '#ef4444' },
];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersApi.getAll();
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredOrders = orders.filter((order) => {
    const orderNumber = order.order_number || '';
    const customerName = order.customers?.name || '';
    const customerEmail = order.customers?.email || '';
    
    const matchesSearch =
      orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    const statusOption = STATUS_OPTIONS.find((s) => s.value === status);
    return statusOption?.color || '#666';
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleUpdateStatusClick = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setTrackingNumber(order.tracking_number || '');
    setShowStatusModal(true);
  };

  const handleStatusUpdate = async () => {
    try {
      setUpdating(true);
      const updateData = {
        status: newStatus,
        tracking_number: newStatus === 'shipped' ? trackingNumber : selectedOrder.tracking_number,
      };
      
      await ordersApi.updateStatus(selectedOrder.id, updateData);
      
      setOrders(orders.map((order) => {
        if (order.id === selectedOrder.id) {
          return { ...order, ...updateData };
        }
        return order;
      }));
      
      setShowStatusModal(false);
      setSelectedOrder(null);
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const getOrderStats = () => {
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === 'pending').length,
      processing: orders.filter((o) => o.status === 'processing').length,
      shipped: orders.filter((o) => o.status === 'shipped').length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
    };
  };

  const stats = getOrderStats();

  if (loading) {
    return (
      <div className="orders-loading">
        <div className="loader-spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="page-header">
        <div className="header-left">
          <h1>Orders</h1>
          <p className="page-subtitle">Manage and track customer orders</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={fetchOrders}>
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
          <button className="btn btn-secondary">
            <i className="fas fa-file-export"></i> Export
          </button>
        </div>
      </div>

      {/* Order Stats */}
      <div className="order-stats">
        <div className="stat-pill" onClick={() => setStatusFilter('all')}>
          <span className="stat-count">{stats.total}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-pill pending" onClick={() => setStatusFilter('pending')}>
          <span className="stat-count">{stats.pending}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-pill processing" onClick={() => setStatusFilter('processing')}>
          <span className="stat-count">{stats.processing}</span>
          <span className="stat-label">Processing</span>
        </div>
        <div className="stat-pill shipped" onClick={() => setStatusFilter('shipped')}>
          <span className="stat-count">{stats.shipped}</span>
          <span className="stat-label">Shipped</span>
        </div>
        <div className="stat-pill delivered" onClick={() => setStatusFilter('delivered')}>
          <span className="stat-count">{stats.delivered}</span>
          <span className="stat-label">Delivered</span>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search by order ID, customer name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-select"
          >
            <option value="all">All Status</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td className="order-id">{order.order_number}</td>
                <td>
                  <div className="customer-cell">
                    <span className="customer-name">{order.customers?.name || 'Unknown'}</span>
                    <span className="customer-email">{order.customers?.email || '-'}</span>
                  </div>
                </td>
                <td>{order.order_items?.length || 0} item(s)</td>
                <td className="total-cell">{formatCurrency(order.total_amount)}</td>
                <td>
                  <span className={`payment-badge ${order.payment_status}`}>
                    {order.payment_status}
                  </span>
                </td>
                <td>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="date-cell">{formatDate(order.created_at)}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn"
                      title="View Details"
                      onClick={() => handleViewOrder(order)}
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <button
                      className="action-btn"
                      title="Update Status"
                      onClick={() => handleUpdateStatusClick(order)}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="action-btn" title="Print Invoice">
                      <i className="fas fa-print"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredOrders.length === 0 && (
          <div className="no-results">
            <i className="fas fa-inbox"></i>
            <p>No orders found</p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
          <div className="modal order-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order Details - {selectedOrder.order_number}</h3>
              <button className="modal-close" onClick={() => setShowOrderModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="order-detail-grid">
                <div className="detail-section">
                  <h4>Customer Information</h4>
                  <p><strong>Name:</strong> {selectedOrder.customers?.name || 'Unknown'}</p>
                  <p><strong>Email:</strong> {selectedOrder.customers?.email || '-'}</p>
                  <p><strong>Phone:</strong> {selectedOrder.customers?.phone || '-'}</p>
                </div>
                <div className="detail-section">
                  <h4>Shipping Address</h4>
                  <p>{selectedOrder.shipping_address || 'Not provided'}</p>
                </div>
                <div className="detail-section">
                  <h4>Payment Information</h4>
                  <p><strong>Method:</strong> {selectedOrder.payment_method || '-'}</p>
                  <p><strong>Status:</strong> 
                    <span className={`payment-badge ${selectedOrder.payment_status}`}>
                      {selectedOrder.payment_status}
                    </span>
                  </p>
                </div>
                <div className="detail-section">
                  <h4>Order Status</h4>
                  <p>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(selectedOrder.status) }}
                    >
                      {selectedOrder.status}
                    </span>
                  </p>
                  {selectedOrder.tracking_number && (
                    <p><strong>Tracking:</strong> {selectedOrder.tracking_number}</p>
                  )}
                </div>
              </div>

              <div className="order-items-section">
                <h4>Order Items</h4>
                <table className="order-items-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedOrder.order_items || []).map((item, index) => (
                      <tr key={index}>
                        <td>{item.products?.name || 'Unknown Product'}</td>
                        <td>{item.quantity}</td>
                        <td>{formatCurrency(item.price_at_time)}</td>
                        <td>{formatCurrency(item.price_at_time * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3"><strong>Total</strong></td>
                      <td><strong>{formatCurrency(selectedOrder.total_amount)}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {selectedOrder.notes && (
                <div className="order-notes">
                  <h4>Notes</h4>
                  <p>{selectedOrder.notes}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowOrderModal(false)}>
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setShowOrderModal(false);
                  handleUpdateStatusClick(selectedOrder);
                }}
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showStatusModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Update Order Status</h3>
              <button className="modal-close" onClick={() => setShowStatusModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Order ID</label>
                <input type="text" value={selectedOrder.order_number} disabled />
              </div>
              <div className="form-group">
                <label>New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
              {newStatus === 'shipped' && (
                <div className="form-group">
                  <label>Tracking Number</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                  />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowStatusModal(false)}>
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleStatusUpdate}
                disabled={updating}
              >
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
