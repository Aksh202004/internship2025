import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { getProductsByCategory } from '../services/productService';
import placeholderImage from '../assets/images/placeholder.png';
import '../pages/RingsPage.css'; // Reuse the same CSS

const CategoryPage = ({ categoryName, title, breadcrumb }) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recommended');

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProductsByCategory(categoryName);
      setProducts(data || []);
    } catch (err) {
      console.error(`Error fetching ${categoryName}:`, err);
    } finally {
      setLoading(false);
    }
  }, [categoryName]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleWishlistClick = useCallback((product, e) => {
    e.stopPropagation();
    e.preventDefault();
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  }, [isInWishlist, removeFromWishlist, addToWishlist]);

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

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'newest':
        return new Date(b.created_at) - new Date(a.created_at);
      default:
        return 0;
    }
  });

  return (
    <div className="category-page">
      <div className="page-header">
        <div className="breadcrumbs">
          {breadcrumb || `Home / ${categoryName}`}
        </div>
        <h1>{title || categoryName}</h1>
      </div>

      <div className="category-content">
        <main className="products-main" style={{ width: '100%' }}>
          <div className="products-header">
            <p className="products-count">{products.length} products found</p>
            <div className="sort-dropdown">
              <label>Sort by:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="recommended">Recommended</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>
          
          {loading ? (
            <div className="loading-container" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              minHeight: '300px' 
            }}>
              <div className="loader-spinner" style={{
                width: '40px',
                height: '40px',
                border: '3px solid #f3f3f3',
                borderTop: '3px solid #832729',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ marginTop: '1rem', color: '#666' }}>Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="no-products" style={{ 
              textAlign: 'center', 
              padding: '3rem',
              color: '#666'
            }}>
              <i className="fas fa-gem" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}></i>
              <p>No {categoryName.toLowerCase()} found</p>
              <p style={{ fontSize: '0.9rem' }}>Check back later for new arrivals!</p>
            </div>
          ) : (
            <div className="product-grid">
              {sortedProducts.map(product => (
                <div key={product.id} className="product-card">
                  <Link to={`/product/${product.id}`} className="product-link">
                    <div className="product-image-container">
                      <img 
                        src={product.image || placeholderImage} 
                        alt={product.name}
                        onError={(e) => { e.target.src = placeholderImage; }}
                      />
                      {product.is_featured && (
                        <span className="bestseller-badge">
                          <i className="fas fa-star"></i> FEATURED
                        </span>
                      )}
                      {product.discount > 0 && (
                        <span className="discount-badge">-{product.discount}%</span>
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
                        <span className="rating-value">{(product.rating || 0).toFixed(1)}</span>
                        <span className="review-count">({product.reviewCount || 0})</span>
                      </div>
                      <div className="product-price-container">
                        <p className="product-price">{formatPrice(product.price)}</p>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <p className="original-price">{formatPrice(product.originalPrice)}</p>
                        )}
                      </div>
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
        </main>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .discount-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          background: #e53935;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .product-price-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .original-price {
          color: #999;
          text-decoration: line-through;
          font-size: 0.85rem;
        }
        .out-of-stock {
          background: #f44336 !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
};

export default CategoryPage;
