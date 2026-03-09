import React, { useState } from 'react';
import './Inventory.css';

// Mock data
const MOCK_INVENTORY = [
  {
    id: 1,
    sku: 'RING-DIA-001',
    name: 'Diamond Solitaire Ring 18K',
    category: 'Rings',
    stock: 5,
    lowStockThreshold: 3,
    reserved: 2,
    available: 3,
    location: 'Vault A-1',
    lastRestocked: '2026-01-05',
    cost: 85000,
    price: 125000,
  },
  {
    id: 2,
    sku: 'NECK-GLD-001',
    name: 'Gold Chain Necklace 22K',
    category: 'Necklaces',
    stock: 12,
    lowStockThreshold: 5,
    reserved: 0,
    available: 12,
    location: 'Vault A-2',
    lastRestocked: '2026-01-08',
    cost: 60000,
    price: 85000,
  },
  {
    id: 3,
    sku: 'EAR-PRL-001',
    name: 'Pearl Drop Earrings',
    category: 'Earrings',
    stock: 1,
    lowStockThreshold: 5,
    reserved: 1,
    available: 0,
    location: 'Display Case B',
    lastRestocked: '2025-12-20',
    cost: 22000,
    price: 32000,
  },
  {
    id: 4,
    sku: 'BRAC-RUB-001',
    name: 'Ruby Tennis Bracelet',
    category: 'Bracelets',
    stock: 8,
    lowStockThreshold: 3,
    reserved: 0,
    available: 8,
    location: 'Vault B-1',
    lastRestocked: '2026-01-10',
    cost: 68000,
    price: 95000,
  },
  {
    id: 5,
    sku: 'PEND-SAP-001',
    name: 'Sapphire Pendant',
    category: 'Pendants',
    stock: 0,
    lowStockThreshold: 3,
    reserved: 0,
    available: 0,
    location: 'Vault A-3',
    lastRestocked: '2025-12-15',
    cost: 48000,
    price: 68000,
  },
  {
    id: 6,
    sku: 'EAR-EMR-001',
    name: 'Emerald Stud Earrings',
    category: 'Earrings',
    stock: 4,
    lowStockThreshold: 5,
    reserved: 1,
    available: 3,
    location: 'Display Case A',
    lastRestocked: '2026-01-02',
    cost: 55000,
    price: 78000,
  },
];

const Inventory = () => {
  const [inventory, setInventory] = useState(MOCK_INVENTORY);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [restockQty, setRestockQty] = useState(0);
  const [adjustmentQty, setAdjustmentQty] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState('');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'low') return matchesSearch && item.stock <= item.lowStockThreshold && item.stock > 0;
    if (filterType === 'out') return matchesSearch && item.stock === 0;
    if (filterType === 'reserved') return matchesSearch && item.reserved > 0;
    return matchesSearch;
  });

  const getStockStatus = (item) => {
    if (item.stock === 0) return { label: 'Out of Stock', class: 'out' };
    if (item.stock <= item.lowStockThreshold) return { label: 'Low Stock', class: 'low' };
    return { label: 'In Stock', class: 'ok' };
  };

  const handleRestockClick = (item) => {
    setSelectedItem(item);
    setRestockQty(10);
    setShowRestockModal(true);
  };

  const handleAdjustClick = (item) => {
    setSelectedItem(item);
    setAdjustmentQty(0);
    setAdjustmentReason('');
    setShowAdjustModal(true);
  };

  const handleRestock = () => {
    setInventory(inventory.map((item) => {
      if (item.id === selectedItem.id) {
        return {
          ...item,
          stock: item.stock + restockQty,
          available: item.available + restockQty,
          lastRestocked: new Date().toISOString().split('T')[0],
        };
      }
      return item;
    }));
    setShowRestockModal(false);
    setSelectedItem(null);
  };

  const handleAdjust = () => {
    setInventory(inventory.map((item) => {
      if (item.id === selectedItem.id) {
        const newStock = Math.max(0, item.stock + adjustmentQty);
        const newAvailable = Math.max(0, item.available + adjustmentQty);
        return {
          ...item,
          stock: newStock,
          available: newAvailable,
        };
      }
      return item;
    }));
    setShowAdjustModal(false);
    setSelectedItem(null);
  };

  const getInventoryStats = () => {
    const totalValue = inventory.reduce((sum, item) => sum + (item.stock * item.cost), 0);
    const lowStockCount = inventory.filter((item) => item.stock <= item.lowStockThreshold && item.stock > 0).length;
    const outOfStockCount = inventory.filter((item) => item.stock === 0).length;
    const totalItems = inventory.reduce((sum, item) => sum + item.stock, 0);
    
    return { totalValue, lowStockCount, outOfStockCount, totalItems };
  };

  const stats = getInventoryStats();

  return (
    <div className="inventory-page">
      <div className="page-header">
        <div className="header-left">
          <h1>Inventory Management</h1>
          <p className="page-subtitle">Track and manage product stock levels</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary">
            <i className="fas fa-file-export"></i> Export Report
          </button>
          <button className="btn btn-primary">
            <i className="fas fa-plus"></i> Bulk Restock
          </button>
        </div>
      </div>

      {/* Inventory Stats */}
      <div className="inventory-stats">
        <div className="inv-stat-card">
          <div className="inv-stat-icon">
            <i className="fas fa-boxes"></i>
          </div>
          <div className="inv-stat-info">
            <span className="inv-stat-value">{stats.totalItems}</span>
            <span className="inv-stat-label">Total Units</span>
          </div>
        </div>
        <div className="inv-stat-card">
          <div className="inv-stat-icon value">
            <i className="fas fa-rupee-sign"></i>
          </div>
          <div className="inv-stat-info">
            <span className="inv-stat-value">{formatCurrency(stats.totalValue)}</span>
            <span className="inv-stat-label">Inventory Value</span>
          </div>
        </div>
        <div className="inv-stat-card warning">
          <div className="inv-stat-icon warning">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="inv-stat-info">
            <span className="inv-stat-value">{stats.lowStockCount}</span>
            <span className="inv-stat-label">Low Stock Items</span>
          </div>
        </div>
        <div className="inv-stat-card danger">
          <div className="inv-stat-icon danger">
            <i className="fas fa-times-circle"></i>
          </div>
          <div className="inv-stat-info">
            <span className="inv-stat-value">{stats.outOfStockCount}</span>
            <span className="inv-stat-label">Out of Stock</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            All Items
          </button>
          <button
            className={`filter-tab ${filterType === 'low' ? 'active' : ''}`}
            onClick={() => setFilterType('low')}
          >
            <i className="fas fa-exclamation-triangle"></i> Low Stock
          </button>
          <button
            className={`filter-tab ${filterType === 'out' ? 'active' : ''}`}
            onClick={() => setFilterType('out')}
          >
            <i className="fas fa-times-circle"></i> Out of Stock
          </button>
          <button
            className={`filter-tab ${filterType === 'reserved' ? 'active' : ''}`}
            onClick={() => setFilterType('reserved')}
          >
            <i className="fas fa-lock"></i> Reserved
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="inventory-table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Location</th>
              <th>Stock</th>
              <th>Reserved</th>
              <th>Available</th>
              <th>Status</th>
              <th>Last Restocked</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map((item) => {
              const status = getStockStatus(item);
              return (
                <tr key={item.id} className={status.class === 'out' ? 'row-out' : ''}>
                  <td>
                    <div className="product-cell">
                      <span className="product-name">{item.name}</span>
                      <span className="product-category">{item.category}</span>
                    </div>
                  </td>
                  <td className="sku-cell">{item.sku}</td>
                  <td>{item.location}</td>
                  <td className="stock-cell">
                    <span className={item.stock <= item.lowStockThreshold ? 'stock-warning' : ''}>
                      {item.stock}
                    </span>
                    <span className="threshold">/ {item.lowStockThreshold} min</span>
                  </td>
                  <td>
                    {item.reserved > 0 ? (
                      <span className="reserved-badge">{item.reserved}</span>
                    ) : (
                      <span className="no-reserved">-</span>
                    )}
                  </td>
                  <td className="available-cell">{item.available}</td>
                  <td>
                    <span className={`status-badge ${status.class}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="date-cell">{item.lastRestocked}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn restock"
                        title="Restock"
                        onClick={() => handleRestockClick(item)}
                      >
                        <i className="fas fa-plus-circle"></i>
                      </button>
                      <button
                        className="action-btn"
                        title="Adjust Stock"
                        onClick={() => handleAdjustClick(item)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="action-btn" title="View History">
                        <i className="fas fa-history"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredInventory.length === 0 && (
          <div className="no-results">
            <i className="fas fa-box-open"></i>
            <p>No inventory items found</p>
          </div>
        )}
      </div>

      {/* Restock Modal */}
      {showRestockModal && selectedItem && (
        <div className="modal-overlay" onClick={() => setShowRestockModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Restock Product</h3>
              <button className="modal-close" onClick={() => setShowRestockModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="restock-product-info">
                <p className="product-name">{selectedItem.name}</p>
                <p className="product-sku">{selectedItem.sku}</p>
              </div>
              <div className="current-stock-info">
                <div className="stock-info-item">
                  <span className="label">Current Stock</span>
                  <span className="value">{selectedItem.stock}</span>
                </div>
                <div className="stock-info-item">
                  <span className="label">After Restock</span>
                  <span className="value highlight">{selectedItem.stock + restockQty}</span>
                </div>
              </div>
              <div className="form-group">
                <label>Quantity to Add</label>
                <div className="qty-input-group">
                  <button
                    className="qty-btn"
                    onClick={() => setRestockQty(Math.max(1, restockQty - 1))}
                  >
                    <i className="fas fa-minus"></i>
                  </button>
                  <input
                    type="number"
                    value={restockQty}
                    onChange={(e) => setRestockQty(Math.max(1, parseInt(e.target.value) || 0))}
                    min="1"
                  />
                  <button
                    className="qty-btn"
                    onClick={() => setRestockQty(restockQty + 1)}
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              </div>
              <div className="quick-qty-buttons">
                <button onClick={() => setRestockQty(5)}>+5</button>
                <button onClick={() => setRestockQty(10)}>+10</button>
                <button onClick={() => setRestockQty(25)}>+25</button>
                <button onClick={() => setRestockQty(50)}>+50</button>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowRestockModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleRestock}>
                <i className="fas fa-plus"></i> Add Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {showAdjustModal && selectedItem && (
        <div className="modal-overlay" onClick={() => setShowAdjustModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Adjust Stock</h3>
              <button className="modal-close" onClick={() => setShowAdjustModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="restock-product-info">
                <p className="product-name">{selectedItem.name}</p>
                <p className="product-sku">Current Stock: {selectedItem.stock}</p>
              </div>
              <div className="form-group">
                <label>Adjustment (+/-)</label>
                <input
                  type="number"
                  value={adjustmentQty}
                  onChange={(e) => setAdjustmentQty(parseInt(e.target.value) || 0)}
                  placeholder="Enter positive or negative number"
                />
                <span className="form-hint">
                  New stock will be: {Math.max(0, selectedItem.stock + adjustmentQty)}
                </span>
              </div>
              <div className="form-group">
                <label>Reason for Adjustment</label>
                <select
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                >
                  <option value="">Select a reason</option>
                  <option value="damaged">Damaged/Defective</option>
                  <option value="lost">Lost/Missing</option>
                  <option value="returned">Customer Return</option>
                  <option value="audit">Inventory Audit</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAdjustModal(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAdjust}
                disabled={!adjustmentReason || adjustmentQty === 0}
              >
                Apply Adjustment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
