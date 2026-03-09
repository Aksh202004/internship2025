import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productsApi, categoriesApi } from '../services/api';
import './Products.css';

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching products and categories...');
      const [productsData, categoriesData] = await Promise.all([
        productsApi.getAll(),
        categoriesApi.getAll()
      ]);
      console.log('Products received:', productsData);
      console.log('Categories received:', categoriesData);
      setProducts(productsData || []);
      setCategories(categoriesData || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      alert('Error loading products: ' + err.message);
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

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || product.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(filteredProducts.map((p) => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (id) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      try {
        setDeleting(true);
        await productsApi.delete(productToDelete.id);
        setProducts(products.filter((p) => p.id !== productToDelete.id));
        setShowDeleteModal(false);
        setProductToDelete(null);
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('Failed to delete product');
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Delete ${selectedProducts.length} products?`)) {
      try {
        setDeleting(true);
        await productsApi.bulkDelete(selectedProducts);
        setProducts(products.filter((p) => !selectedProducts.includes(p.id)));
        setSelectedProducts([]);
      } catch (err) {
        console.error('Error deleting products:', err);
        alert('Failed to delete some products');
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleStatusChange = async (productId, newStatus) => {
    try {
      await productsApi.updateStatus(productId, newStatus);
      setProducts(products.map(p => 
        p.id === productId ? { ...p, status: newStatus } : p
      ));
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update product status');
    }
  };

  if (loading) {
    return (
      <div className="products-loading">
        <div className="loader-spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="page-header">
        <div className="header-left">
          <h1>Products</h1>
          <p className="page-subtitle">{products.length} total products</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={fetchData}>
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
          <Link to="/admin/products/new" className="btn btn-primary">
            <i className="fas fa-plus"></i> Add Product
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="category-filter">
          <button
            className={`filter-btn ${selectedCategory === 'All' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('All')}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              className={`filter-btn ${selectedCategory === category.name ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.name)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="bulk-actions">
          <span>{selectedProducts.length} selected</span>
          <button 
            className="btn btn-ghost btn-danger"
            onClick={handleBulkDelete}
            disabled={deleting}
          >
            <i className="fas fa-trash"></i> Delete Selected
          </button>
        </div>
      )}

      {/* Products Table */}
      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={
                    selectedProducts.length === filteredProducts.length &&
                    filteredProducts.length > 0
                  }
                />
              </th>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => handleSelectProduct(product.id)}
                  />
                </td>
                <td>
                  <div className="product-cell">
                    <img 
                      src={product.thumbnail_url || 'https://via.placeholder.com/60'} 
                      alt={product.name} 
                    />
                    <div className="product-info">
                      <span className="product-name">{product.name}</span>
                      <span className="product-meta">
                        {product.metal_type && `${product.metal_purity || ''} ${product.metal_type}`}
                        {product.gemstone_type && ` • ${product.gemstone_type}`}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="sku-cell">{product.sku}</td>
                <td>{product.category?.name || '-'}</td>
                <td className="price-cell">{formatCurrency(product.price)}</td>
                <td>
                  <span className={product.stock <= (product.low_stock_threshold || 5) ? 'stock-low' : ''}>
                    {product.stock}
                  </span>
                </td>
                <td>
                  <select
                    className={`status-select status-${product.status || 'draft'}`}
                    value={product.status || 'draft'}
                    onChange={(e) => handleStatusChange(product.id, e.target.value)}
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="action-btn" 
                      title="Edit"
                      onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="action-btn delete"
                      title="Delete"
                      onClick={() => handleDeleteClick(product)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <div className="no-results">
            <i className="fas fa-box-open"></i>
            <p>No products found</p>
            <Link to="/admin/products/new" className="btn btn-primary">
              Add Your First Product
            </Link>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Product</h3>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete <strong>{productToDelete?.name}</strong>?
              </p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
