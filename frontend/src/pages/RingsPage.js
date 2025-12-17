import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './RingsPage.css';
import ringImage from '../assets/images/ring.webp';
import earRingImage from '../assets/images/ear-ring.avif';
import placeholderImage from '../assets/images/placeholder.png';
import { useWishlist } from '../context/WishlistContext';

const INITIAL_FILTERS = {
  category: ['Drops'],
  material: ['Diamond'],
  priceRange: [50000, 500000],
  occasion: []
};

const FILTER_OPTIONS = {
  categories: ['Studs', 'Hoops', 'Drops'],
  materials: ['Gold', 'Silver', 'Platinum', 'Diamond'],
  occasions: ['Wedding', 'Everyday Wear', 'Gifting']
};

const SAMPLE_PRODUCTS = [
  { 
    id: 1, 
    name: 'Girlish Star Shaped Gold Stud Earrings', 
    price: '₹ 30894', 
    image: earRingImage,
    bestseller: true,
    stockMessage: 'Only 1 left!'
  },
  { 
    id: 2, 
    name: 'Breathtaking Onyx Stone Diamond Stud Earrings', 
    price: '₹ 47578', 
    image: placeholderImage 
  },
  { 
    id: 3, 
    name: 'Swirl Pattern Diamond Stud Earrings In Yellow Gold', 
    price: '₹ 41674', 
    image: ringImage 
  },
  { 
    id: 4, 
    name: 'Elegant Diamond Ring', 
    price: '₹ 35000', 
    image: placeholderImage 
  },
  { 
    id: 5, 
    name: 'Classic Gold Band Ring', 
    price: '₹ 50000', 
    image: ringImage 
  },
  { 
    id: 6, 
    name: 'Modern Minimalist Ring Design', 
    price: '₹ 45000', 
    image: placeholderImage 
  }
];

const RingsPage = () => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [showFilterModal, setShowFilterModal] = useState(false);

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
          
          <div className="product-grid">
            {SAMPLE_PRODUCTS.map(product => (
              <div key={product.id} className="product-card">
                <Link to={`/product/${product.id}`} className="product-link">
                  <div className="product-image-container">
                    <img src={product.image} alt={product.name} />
                    {product.bestseller && (
                      <span className="bestseller-badge">
                        <i className="fas fa-star"></i> BESTSELLERS
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
                    <p className="product-price">{product.price}</p>
                    {product.stockMessage && (
                      <span className="stock-badge">{product.stockMessage}</span>
                    )}
                    <button className="view-similar-btn" onClick={(e) => e.preventDefault()}>
                      <i className="fas fa-cube"></i>
                      View Similar
                    </button>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          <div className="pagination">
            <button className="page-btn prev-btn">
              <i className="fas fa-chevron-left"></i>
            </button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <span className="page-dots">...</span>
            <button className="page-btn">10</button>
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