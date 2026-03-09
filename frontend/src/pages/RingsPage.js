import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './RingsPage.css';
import placeholderImage from '../assets/images/placeholder.png';
import { useWishlist } from '../context/WishlistContext';
import { getProductsByCategory } from '../services/productService';

const INITIAL_FILTERS = {
  category: [],
  material: [],
  priceRange: [0, 500000],
  occasion: []
};

const FILTER_OPTIONS = {
  categories: ['Engagement', 'Wedding', 'Fashion'],
  materials: ['Gold', 'Silver', 'Platinum', 'Diamond'],
  occasions: ['Wedding', 'Everyday Wear', 'Gifting']
};

const RingsPage = () => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [showFilterModal, setShowFilterModal] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProductsByCategory('Rings');
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching rings:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const toggleFilter = useCallback((filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(item => item !== value)
        : [...prev[filterType], value]
    }));
  }, []);

  const handleCategoryFilter = useCallback((category) => {
    toggleFilter('category', category);
  }, [toggleFilter]);

  const handleMaterialFilter = useCallback((material) => {
    toggleFilter('material', material);
  }, [toggleFilter]);

  const handleOccasionFilter = useCallback((occasion) => {
    toggleFilter('occasion', occasion);
  }, [toggleFilter]);

  const clearAllFilters = useCallback(() => {
    setFilters({
      category: [],
      material: [],
      priceRange: [50000, 500000],
      occasion: []
    });
  }, []);

  const handleWishlistClick = useCallback((product, e) => {
    e.stopPropagation();
    e.preventDefault();
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  }, [isInWishlist, removeFromWishlist, addToWishlist]);

  const FilterCheckbox = ({ checked, onChange, label, showCheck }) => (
    <label className="filter-checkbox">
      <input type="checkbox" checked={checked} onChange={onChange} />
      {showCheck && <span className="checked-icon">✓</span>}
      <span>{label}</span>
    </label>
  );

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={`full-${i}`} className="fas fa-star"></i>);
    }
    if (hasHalfStar) {
      stars.push(<i key="half" className="fas fa-star-half-alt"></i>);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<i key={`empty-${i}`} className="far fa-star"></i>);
    }
    return stars;
  };

  return (
    <div className="category-page">
      <div className="page-header">
          <div className="breadcrumbs">
              Home / Rings / Engagement Rings
          </div>
          <h1>Engagement Rings</h1>
      </div>

      {/* Mobile Filter/Sort Buttons */}
      <div className="mobile-filter-buttons">
        <button className="mobile-filter-btn" onClick={() => setShowFilterModal(true)}>
          <i className="fas fa-filter"></i>
          <span>Filter By</span>
        </button>
      </div>

      {/* Filter Modal for Mobile */}
      {showFilterModal && (
        <div className="filter-modal-overlay" onClick={() => setShowFilterModal(false)}>
          <div className="filter-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Filter By</h2>
              <button className="close-modal-btn" onClick={() => setShowFilterModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-content">
              <div className="filter-section">
                <h3>Price</h3>
                <div className="price-range">
                  <div className="price-inputs">
                    <div className="price-input-group">
                      <span className="rupee-symbol">₹</span>
                      <input 
                        type="text" 
                        value={filters.priceRange[0].toLocaleString('en-IN')}
                        readOnly
                      />
                    </div>
                    <div className="price-input-group">
                      <span className="rupee-symbol">₹</span>
                      <input 
                        type="text" 
                        value={filters.priceRange[1].toLocaleString('en-IN')}
                        readOnly
                      />
                    </div>
                  </div>
                  <input 
                    type="range" 
                    min="50000" 
                    max="500000" 
                    value={filters.priceRange[0]}
                    className="price-slider"
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      priceRange: [parseInt(e.target.value), prev.priceRange[1]]
                    }))}
                  />
                </div>
              </div>

              <div className="filter-section">
                <h3>Jewellery Type</h3>
                <div className="filter-options">
                  {FILTER_OPTIONS.categories.map((category) => (
                    <FilterCheckbox
                      key={category}
                      checked={filters.category.includes(category)}
                      onChange={() => handleCategoryFilter(category)}
                      label={category}
                      showCheck={filters.category.includes(category)}
                    />
                  ))}
                </div>
              </div>

              <div className="filter-section">
                <h3>Material</h3>
                <div className="filter-options">
                  {FILTER_OPTIONS.materials.map((material) => (
                    <FilterCheckbox
                      key={material}
                      checked={filters.material.includes(material)}
                      onChange={() => handleMaterialFilter(material)}
                      label={material}
                      showCheck={filters.material.includes(material)}
                    />
                  ))}
                </div>
              </div>

              <div className="filter-section">
                <h3>Occasion</h3>
                <div className="filter-options">
                  {FILTER_OPTIONS.occasions.map((occasion) => (
                    <FilterCheckbox
                      key={occasion}
                      checked={filters.occasion.includes(occasion)}
                      onChange={() => handleOccasionFilter(occasion)}
                      label={occasion}
                      showCheck={filters.occasion.includes(occasion)}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="clear-filters-btn" onClick={clearAllFilters}>
                Clear Filters
              </button>
              <button className="apply-filters-btn" onClick={() => setShowFilterModal(false)}>
                Show Result (440)
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="page-content">
        <aside className="filters-sidebar">
          <div className="filters-header">
            <h2>Filters</h2>
            <button className="clear-all-btn" onClick={clearAllFilters}>Clear All</button>
          </div>

          <div className="filter-section">
            <h3>Category</h3>
            <div className="filter-options">
              {FILTER_OPTIONS.categories.map((category) => (
                <FilterCheckbox
                  key={category}
                  checked={filters.category.includes(category)}
                  onChange={() => handleCategoryFilter(category)}
                  label={category}
                  showCheck={filters.category.includes(category)}
                />
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3>Material</h3>
            <div className="filter-options">
              {FILTER_OPTIONS.materials.map((material) => (
                <FilterCheckbox
                  key={material}
                  checked={filters.material.includes(material)}
                  onChange={() => handleMaterialFilter(material)}
                  label={material}
                  showCheck={filters.material.includes(material)}
                />
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3>Price</h3>
            <div className="price-range">
              <div className="price-inputs">
                <div className="price-input-group">
                  <span className="rupee-symbol">₹</span>
                  <input 
                    type="text" 
                    value={filters.priceRange[0].toLocaleString('en-IN')}
                    readOnly
                  />
                </div>
                <div className="price-input-group">
                  <span className="rupee-symbol">₹</span>
                  <input 
                    type="text" 
                    value={filters.priceRange[1].toLocaleString('en-IN')}
                    readOnly
                  />
                </div>
              </div>
              <input 
                type="range" 
                min="50000" 
                max="500000" 
                value={filters.priceRange[0]}
                className="price-slider"
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  priceRange: [parseInt(e.target.value), prev.priceRange[1]]
                }))}
              />
            </div>
          </div>

          <div className="filter-section">
            <h3>Occasion</h3>
            <div className="filter-options">
              {FILTER_OPTIONS.occasions.map((occasion) => (
                <FilterCheckbox
                  key={occasion}
                  checked={filters.occasion.includes(occasion)}
                  onChange={() => handleOccasionFilter(occasion)}
                  label={occasion}
                  showCheck={filters.occasion.includes(occasion)}
                />
              ))}
            </div>
          </div>
        </aside>

        <main className="products-main">
          <div className="products-header">
            <p className="products-count">{products.length} products found</p>
            <div className="sort-dropdown">
              <label>Sort by:</label>
              <select>
                <option>Recommended</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest First</option>
              </select>
            </div>
          </div>
          
          {loading ? (
            <div className="loading-container">
              <div className="loader-spinner"></div>
              <p>Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="no-products">
              <i className="fas fa-gem"></i>
              <p>No rings found</p>
            </div>
          ) : (
            <div className="product-grid">
              {products.map(product => (
                <div key={product.id} className="product-card">
                  <Link to={`/product/${product.id}`} className="product-link">
                    <div className="product-image-container">
                      <img src={product.image || placeholderImage} alt={product.name} />
                      {product.is_featured && (
                        <span className="bestseller-badge">
                          <i className="fas fa-star"></i> FEATURED
                        </span>
                      )}
                      <button 
                        className={`wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}`}
                        onClick={(e) => handleWishlistClick(product, e)}
                        aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                      >
                        <i className={isInWishlist(product.id) ? 'fas fa-heart' : 'far fa-heart'}></i>
                      </button>
                    </div>
                    <div className="product-info">
                      <h3 className="product-name">{product.name}</h3>
                      <div className="product-rating">
                        <div className="product-stars">{renderStars(product.rating || 0)}</div>
                        <span className="rating-value">{product.rating || 0}</span>
                        <span className="review-count">({product.reviewCount || 0} reviews)</span>
                      </div>
                      <p className="product-price">{formatPrice(product.price)}</p>
                      {!product.inStock && (
                        <span className="stock-badge out-of-stock">Out of Stock</span>
                      )}
                      {product.inStock && product.stock_quantity <= 5 && (
                        <span className="stock-badge">Only {product.stock_quantity} left!</span>
                      )}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}

          <div className="pagination">
            <button className="page-btn prev-btn">
              <i className="fas fa-chevron-left"></i>
            </button>
            <button className="page-btn active">1</button>
            <button className="page-btn next-btn">
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RingsPage;