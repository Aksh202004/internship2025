import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productsApi, categoriesApi } from '../services/api';
import './ProductForm.css';

const METAL_TYPES = ['Gold', 'Silver', 'Platinum', 'Rose Gold', 'White Gold'];
const METAL_PURITY = ['14K', '18K', '22K', '24K', '925 Sterling'];
const GEMSTONES = ['Diamond', 'Ruby', 'Emerald', 'Sapphire', 'Pearl', 'Opal', 'Amethyst', 'None'];
const OCCASIONS = ['Wedding', 'Engagement', 'Anniversary', 'Birthday', 'Daily Wear', 'Party', 'Festival'];
const GENDERS = ['women', 'men', 'unisex'];

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    short_description: '',
    category_id: '',
    price: '',
    compare_at_price: '',
    cost_price: '',
    stock: '',
    low_stock_threshold: 5,
    metal_type: '',
    metal_purity: '',
    metal_weight: '',
    metal_color: '',
    gemstone_type: '',
    gemstone_carat: '',
    gemstone_color: '',
    gemstone_clarity: '',
    size: '',
    gender: 'unisex',
    occasion: [],
    is_featured: false,
    is_new_arrival: false,
    is_bestseller: false,
    status: 'draft',
    images: [],
    existingImages: [],
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [activeTab, setActiveTab] = useState('basic');
  const [errors, setErrors] = useState({});

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const product = await productsApi.getById(id);
      setFormData(prev => ({
        ...prev,
        name: product.name || '',
        sku: product.sku || '',
        description: product.description || '',
        short_description: product.short_description || '',
        category_id: product.category_id || '',
        price: product.price || '',
        compare_at_price: product.compare_at_price || '',
        cost_price: product.cost_price || '',
        stock: product.stock || 0,
        low_stock_threshold: product.low_stock_threshold || 5,
        metal_type: product.metal_type || '',
        metal_purity: product.metal_purity || '',
        metal_weight: product.metal_weight || '',
        metal_color: product.metal_color || '',
        gemstone_type: product.gemstone_type || '',
        gemstone_carat: product.gemstone_carat || '',
        gemstone_color: product.gemstone_color || '',
        gemstone_clarity: product.gemstone_clarity || '',
        size: product.size || '',
        gender: product.gender || 'unisex',
        occasion: product.occasion || [],
        is_featured: product.is_featured || false,
        is_new_arrival: product.is_new_arrival || false,
        is_bestseller: product.is_bestseller || false,
        status: product.status || 'draft',
        existingImages: product.images || [],
      }));
    } catch (err) {
      console.error('Error fetching product:', err);
      alert('Failed to load product');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchProduct();
    }
  }, [isEditing, fetchProduct]);

  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.getAll();
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleOccasionChange = (occasion) => {
    const updated = formData.occasion.includes(occasion)
      ? formData.occasion.filter((o) => o !== occasion)
      : [...formData.occasion, occasion];
    setFormData({ ...formData, occasion: updated });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      url: URL.createObjectURL(file),
      file: file,
      isNew: true
    }));
    setFormData({ ...formData, images: [...formData.images, ...newImages] });
    setImageFiles([...imageFiles, ...files]);
  };

  const removeImage = (image) => {
    if (image.isExisting) {
      // Mark existing image for deletion
      setImagesToDelete([...imagesToDelete, image.id]);
    } else {
      // Remove new image from files
      setImageFiles(imageFiles.filter(f => f.name !== image.name));
    }
    setFormData({
      ...formData,
      images: formData.images.filter((img) => img.id !== image.id),
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Product name is required';
    if (!formData.sku) newErrors.sku = 'SKU is required';
    if (!formData.category_id) newErrors.category_id = 'Category is required';
    if (!formData.price) newErrors.price = 'Price is required';
    if (formData.stock === '' || formData.stock === null) newErrors.stock = 'Stock quantity is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
      
      // Prepare product data
      const productData = {
        name: formData.name,
        sku: formData.sku,
        description: formData.description,
        short_description: formData.short_description,
        category_id: formData.category_id || null,
        price: parseFloat(formData.price),
        compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
        stock: parseInt(formData.stock),
        low_stock_threshold: parseInt(formData.low_stock_threshold) || 5,
        metal_type: formData.metal_type || null,
        metal_purity: formData.metal_purity || null,
        metal_weight: formData.metal_weight ? parseFloat(formData.metal_weight) : null,
        metal_color: formData.metal_color || null,
        gemstone_type: formData.gemstone_type || null,
        gemstone_carat: formData.gemstone_carat ? parseFloat(formData.gemstone_carat) : null,
        gemstone_color: formData.gemstone_color || null,
        gemstone_clarity: formData.gemstone_clarity || null,
        size: formData.size || null,
        gender: formData.gender || 'unisex',
        occasion: formData.occasion,
        is_featured: formData.is_featured,
        is_new_arrival: formData.is_new_arrival,
        is_bestseller: formData.is_bestseller,
        status: formData.status,
      };

      if (isEditing) {
        // Keep existing images that weren't deleted
        productData.images = formData.existingImages.filter(img => !imagesToDelete.includes(img));
        await productsApi.update(id, productData, imageFiles, imagesToDelete);
      } else {
        await productsApi.create(productData, imageFiles);
      }

      navigate('/admin/products');
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Failed to save product: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: 'fas fa-info-circle' },
    { id: 'pricing', label: 'Pricing & Stock', icon: 'fas fa-tag' },
    { id: 'details', label: 'Product Details', icon: 'fas fa-gem' },
    { id: 'media', label: 'Media', icon: 'fas fa-images' },
  ];

  if (loading) {
    return (
      <div className="product-form-loading">
        <div className="loader-spinner"></div>
        <p>Loading product...</p>
      </div>
    );
  }

  return (
    <div className="product-form-page">
      <div className="page-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/admin/products')}>
            <i className="fas fa-arrow-left"></i>
          </button>
          <div>
            <h1>{isEditing ? 'Edit Product' : 'Add New Product'}</h1>
            <p className="page-subtitle">
              {isEditing ? 'Update product information' : 'Create a new jewelry product'}
            </p>
          </div>
        </div>
        <div className="header-actions">
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="status-select"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
          </select>
          <button className="btn btn-secondary" onClick={() => navigate('/admin/products')}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            <i className="fas fa-save"></i> {saving ? 'Saving...' : (isEditing ? 'Update' : 'Save')} Product
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-container">
          {/* Tabs */}
          <div className="form-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`form-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <i className={tab.icon}></i>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Form Content */}
          <div className="form-content">
            {/* Basic Info */}
            {activeTab === 'basic' && (
              <div className="form-section">
                <h2>Basic Information</h2>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Product Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Diamond Solitaire Ring"
                      className={errors.name ? 'error' : ''}
                    />
                    {errors.name && <span className="error-text">{errors.name}</span>}
                  </div>
                  <div className="form-group">
                    <label>SKU *</label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      placeholder="e.g., RING-DIA-001"
                      className={errors.sku ? 'error' : ''}
                    />
                    {errors.sku && <span className="error-text">{errors.sku}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the product in detail..."
                    rows="4"
                  ></textarea>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleInputChange}
                      className={errors.category_id ? 'error' : ''}
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    {errors.category_id && <span className="error-text">{errors.category_id}</span>}
                  </div>
                  <div className="form-group">
                    <label>Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                    >
                      <option value="">Select gender</option>
                      {GENDERS.map((g) => (
                        <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Occasions</label>
                  <div className="checkbox-group">
                    {OCCASIONS.map((occasion) => (
                      <label key={occasion} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.occasion.includes(occasion)}
                          onChange={() => handleOccasionChange(occasion)}
                        />
                        <span>{occasion}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-row toggle-row">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      name="is_featured"
                      checked={formData.is_featured}
                      onChange={handleInputChange}
                    />
                    <span className="toggle-switch"></span>
                    Featured Product
                  </label>
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      name="is_new_arrival"
                      checked={formData.is_new_arrival}
                      onChange={handleInputChange}
                    />
                    <span className="toggle-switch"></span>
                    New Arrival
                  </label>
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      name="is_bestseller"
                      checked={formData.is_bestseller}
                      onChange={handleInputChange}
                    />
                    <span className="toggle-switch"></span>
                    Bestseller
                  </label>
                </div>
              </div>
            )}

            {/* Pricing & Stock */}
            {activeTab === 'pricing' && (
              <div className="form-section">
                <h2>Pricing & Inventory</h2>

                <div className="form-row three-col">
                  <div className="form-group">
                    <label>Selling Price (₹) *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0"
                      className={errors.price ? 'error' : ''}
                    />
                    {errors.price && <span className="error-text">{errors.price}</span>}
                  </div>
                  <div className="form-group">
                    <label>Compare at Price (₹)</label>
                    <input
                      type="number"
                      name="compare_at_price"
                      value={formData.compare_at_price}
                      onChange={handleInputChange}
                      placeholder="0"
                    />
                    <span className="form-hint">Original price before discount</span>
                  </div>
                  <div className="form-group">
                    <label>Cost per Item (₹)</label>
                    <input
                      type="number"
                      name="cost_price"
                      value={formData.cost_price}
                      onChange={handleInputChange}
                      placeholder="0"
                    />
                    <span className="form-hint">For profit calculation</span>
                  </div>
                </div>

                {formData.price && formData.cost_price && (
                  <div className="profit-indicator">
                    <i className="fas fa-chart-line"></i>
                    <span>
                      Profit Margin: ₹{(formData.price - formData.cost_price).toLocaleString()} 
                      ({((formData.price - formData.cost_price) / formData.price * 100).toFixed(1)}%)
                    </span>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label>Stock Quantity *</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                      className={errors.stock ? 'error' : ''}
                    />
                    {errors.stock && <span className="error-text">{errors.stock}</span>}
                  </div>
                  <div className="form-group">
                    <label>Low Stock Alert Threshold</label>
                    <input
                      type="number"
                      name="low_stock_threshold"
                      value={formData.low_stock_threshold}
                      onChange={handleInputChange}
                      min="1"
                    />
                    <span className="form-hint">Alert when stock falls below this</span>
                  </div>
                </div>
              </div>
            )}

            {/* Product Details */}
            {activeTab === 'details' && (
              <div className="form-section">
                <h2>Jewelry Details</h2>

                <div className="detail-card">
                  <h3><i className="fas fa-ring"></i> Metal Information</h3>
                  <div className="form-row three-col">
                    <div className="form-group">
                      <label>Metal Type</label>
                      <select
                        name="metal_type"
                        value={formData.metal_type}
                        onChange={handleInputChange}
                      >
                        <option value="">Select metal</option>
                        {METAL_TYPES.map((metal) => (
                          <option key={metal} value={metal}>{metal}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Purity</label>
                      <select
                        name="metal_purity"
                        value={formData.metal_purity}
                        onChange={handleInputChange}
                      >
                        <option value="">Select purity</option>
                        {METAL_PURITY.map((purity) => (
                          <option key={purity} value={purity}>{purity}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Metal Weight (grams)</label>
                      <input
                        type="number"
                        name="metal_weight"
                        value={formData.metal_weight}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                <div className="detail-card">
                  <h3><i className="fas fa-gem"></i> Gemstone Information</h3>
                  <div className="form-row three-col">
                    <div className="form-group">
                      <label>Gemstone Type</label>
                      <select
                        name="gemstone_type"
                        value={formData.gemstone_type}
                        onChange={handleInputChange}
                      >
                        <option value="">Select gemstone</option>
                        {GEMSTONES.map((gem) => (
                          <option key={gem} value={gem}>{gem}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Carat Weight</label>
                      <input
                        type="number"
                        name="gemstone_carat"
                        value={formData.gemstone_carat}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                    <div className="form-group">
                      <label>Color</label>
                      <input
                        type="text"
                        name="gemstone_color"
                        value={formData.gemstone_color}
                        onChange={handleInputChange}
                        placeholder="e.g., D, E, F"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Clarity</label>
                      <input
                        type="text"
                        name="gemstone_clarity"
                        value={formData.gemstone_clarity}
                        onChange={handleInputChange}
                        placeholder="e.g., VS1, VVS2"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Size</label>
                  <input
                    type="text"
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    placeholder="e.g., 6, 7, 8 (for rings) or 16 inches (for necklaces)"
                  />
                </div>
              </div>
            )}

            {/* Media */}
            {activeTab === 'media' && (
              <div className="form-section">
                <h2>Product Images</h2>
                <p className="section-hint">
                  Upload high-quality images. First image will be the main product image.
                </p>

                <div className="image-upload-area">
                  <input
                    type="file"
                    id="imageUpload"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="imageUpload" className="upload-zone">
                    <i className="fas fa-cloud-upload-alt"></i>
                    <span>Drag & drop images or click to browse</span>
                    <span className="upload-hint">PNG, JPG, AVIF up to 5MB each</span>
                  </label>
                </div>

                {formData.images.length > 0 && (
                  <div className="image-preview-grid">
                    {formData.images.map((image, index) => (
                      <div key={image.id} className={`image-preview ${index === 0 ? 'main' : ''}`}>
                        <img src={image.url} alt={image.name || 'Product'} />
                        {index === 0 && <span className="main-badge">Main</span>}
                        <button
                          type="button"
                          className="remove-image"
                          onClick={() => removeImage(image)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
