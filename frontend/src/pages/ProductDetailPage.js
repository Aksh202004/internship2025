import React, { useState, useCallback, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './ProductDetailPage.css';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import Lens from '../components/Lens';
import { getProductById, getProductsByCategory } from '../services/productService';
import placeholderImage from '../assets/images/placeholder.png';

const METAL_TYPES = ['Yellow Gold', '18K Gold', 'Platinum', 'White Gold', 'Rose Gold'];
const AVAILABLE_SIZES = ['5', '6', '7', '8', '9', '10'];

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  
  // Product state
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI state
  const [selectedMetalType, setSelectedMetalType] = useState(METAL_TYPES[0]);
  const [selectedSize, setSelectedSize] = useState(AVAILABLE_SIZES[1]);
  const [addedToCart, setAddedToCart] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [lensEnabled, setLensEnabled] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });

  // Format price helper
  const formatPrice = (price) => {
    if (typeof price === 'string' && price.startsWith('$')) return price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price || 0);
  };

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('ProductDetailPage: Fetching product with ID:', id);
        const productData = await getProductById(id);
        console.log('ProductDetailPage: Received data:', productData);
        
        if (!productData) {
          setError('Product not found');
          setLoading(false);
          return;
        }
        
        // Transform product data
        const transformedProduct = {
          id: productData.id,
          name: productData.name,
          price: formatPrice(productData.price),
          originalPrice: productData.original_price ? formatPrice(productData.original_price) : null,
          rating: productData.rating || 4.5,
          reviewCount: productData.review_count || 0,
          image: productData.image_url || productData.image || placeholderImage,
          description: productData.description || 'A beautiful piece of jewelry crafted with precision and care.',
          metalTypes: METAL_TYPES,
          sizes: AVAILABLE_SIZES,
          category: productData.category?.name || productData.category_name || 'Jewelry',
          categorySlug: productData.category?.slug || 'jewelry',
          sku: productData.sku || `SKU-${productData.id}`,
          stock: productData.stock || 0,
          featured: productData.is_featured,
        };
        
        console.log('ProductDetailPage: Transformed product:', transformedProduct);
        setProduct(transformedProduct);
        
        // Fetch related products from same category
        if (productData.category?.name) {
          const related = await getProductsByCategory(productData.category.name);
          const filteredRelated = related
            .filter(p => p.id !== productData.id)
            .slice(0, 4)
            .map(p => ({
              id: p.id,
              name: p.name,
              price: formatPrice(p.price),
              image: p.image_url || placeholderImage
            }));
          setRelatedProducts(filteredRelated);
        }
        
        // Set reviews if available from product data
        if (productData.reviews && productData.reviews.length > 0) {
          setReviews(productData.reviews.map(r => ({
            id: r.id,
            rating: r.rating,
            title: r.title || 'Great product!',
            text: r.comment || r.review_text || '',
            author: r.customer_name || 'Anonymous',
            date: new Date(r.created_at).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })
          })));
        } else {
          // Sample reviews as fallback
          setReviews([
            {
              id: 1,
              rating: 5,
              title: 'Absolutely stunning!',
              text: 'Absolutely stunning! I love this piece. The sparkle is more than I could have imagined. Highly recommend!',
              author: 'Sarah T.',
              date: 'October 28, 2023'
            },
            {
              id: 2,
              rating: 4,
              title: 'Beautiful quality',
              text: 'The piece is gorgeous and well made. The process was easy and a nice experience.',
              author: 'Mark D.',
              date: 'September 15, 2023'
            }
          ]);
        }
        
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleWishlistToggle = useCallback(() => {
    if (!product) return;
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  }, [isInWishlist, product, removeFromWishlist, addToWishlist]);

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    addToCart(product, 1, {
      metalType: selectedMetalType,
      size: selectedSize,
      sku: product.sku,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }, [addToCart, product, selectedMetalType, selectedSize]);

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => {
      const newZoom = Math.max(prev - 0.5, 1);
      if (newZoom === 1) {
        setPanPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  }, []);

  const toggleLens = useCallback(() => {
    setLensEnabled(prev => !prev);
  }, []);

  const handleMouseDown = useCallback((e) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
    }
  }, [zoomLevel, panPosition]);

  const handleMouseMove = useCallback((e) => {
    if (isDragging && zoomLevel > 1) {
      setPanPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart, zoomLevel]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback((e) => {
    if (zoomLevel > 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - panPosition.x, y: touch.clientY - panPosition.y });
    }
  }, [zoomLevel, panPosition]);

  const handleTouchMove = useCallback((e) => {
    if (isDragging && zoomLevel > 1) {
      const touch = e.touches[0];
      setPanPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart, zoomLevel]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const renderStars = useCallback((rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

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
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="loading-container" style={{ textAlign: 'center', padding: '100px 20px' }}>
          <div className="loading-spinner" style={{ 
            width: '50px', 
            height: '50px', 
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #8B7355',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="product-detail-page">
        <div className="error-container" style={{ textAlign: 'center', padding: '100px 20px' }}>
          <i className="fas fa-exclamation-circle" style={{ fontSize: '48px', color: '#dc3545', marginBottom: '20px' }}></i>
          <h2>{error || 'Product not found'}</h2>
          <p>The product you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate('/')} 
            style={{ 
              marginTop: '20px', 
              padding: '12px 24px', 
              background: '#8B7355', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="breadcrumb">
        <Link to="/">Home</Link> &gt; <Link to={`/${product.categorySlug || 'jewelry'}`}>{product.category}</Link> &gt; <span>{product.name}</span>
      </div>

      <div className="product-detail-container">
        <div className="product-image-section">
          <div className="zoom-controls">
            <button 
              className="zoom-btn zoom-in" 
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3}
              title="Zoom In"
            >
              <i className="fas fa-plus"></i>
            </button>
            <button 
              className="zoom-btn zoom-out" 
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1}
              title="Zoom Out"
            >
              <i className="fas fa-minus"></i>
            </button>
            <button 
              className={`zoom-btn lens-toggle ${!lensEnabled ? 'disabled' : ''}`}
              onClick={toggleLens}
              title={lensEnabled ? "Disable Lens" : "Enable Lens"}
            >
              <i className={`fas ${lensEnabled ? 'fa-search' : 'fa-search-minus'}`}></i>
            </button>
          </div>
          {lensEnabled ? (
            <Lens zoomFactor={5} lensSize={200}>
              <img 
                src={product.image} 
                alt={product.name} 
                className="product-main-image" 
                style={{ 
                  transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`, 
                  transformOrigin: 'center', 
                  transition: isDragging ? 'none' : 'transform 0.3s ease',
                  cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              />
            </Lens>
          ) : (
            <img 
              src={product.image} 
              alt={product.name} 
              className="product-main-image" 
              style={{ 
                transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`, 
                transformOrigin: 'center', 
                transition: isDragging ? 'none' : 'transform 0.3s ease',
                cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />
          )}
        </div>

        <div className="product-info-section">
          <h1>{product.name}</h1>
          <p className="product-subtitle">A timeless piece for all of life's unforgettable moments</p>
          
          <div className="product-price-rating">
            <span className="price">{product.price}</span>
            <div className="rating-section">
              <div className="stars">{renderStars(product.rating)}</div>
              <span className="reviews-count">({product.reviewCount} Reviews)</span>
            </div>
          </div>

          <div className="product-options">
            <div className="option-group">
              <label>Metal Type</label>
              <div className="button-group">
                {product.metalTypes.map((type) => (
                  <button
                    key={type}
                    className={`option-btn ${selectedMetalType === type ? 'active' : ''}`}
                    onClick={() => setSelectedMetalType(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="option-group">
              <label>Ring Size</label>
              <select 
                value={selectedSize} 
                onChange={(e) => setSelectedSize(e.target.value)}
                className="size-select"
              >
                {product.sizes.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="action-buttons">
            <button 
              className="add-to-cart-btn"
              onClick={handleAddToCart}
            >
              {addedToCart ? (
                <>
                  <i className="fas fa-check"></i> Added to Cart
                </>
              ) : (
                'Add to Cart'
              )}
            </button>
            <button 
              className={`wishlist-icon-btn ${isInWishlist(product.id) ? 'active' : ''}`}
              onClick={handleWishlistToggle}
            >
              <i className={isInWishlist(product.id) ? 'fas fa-heart' : 'far fa-heart'}></i>
            </button>
          </div>

          <div className="collapsible-section">
            <details open>
              <summary>Product Description</summary>
              <p>{product.description}</p>
            </details>
          </div>

          <div className="collapsible-section">
            <details>
              <summary>Shipping & Returns</summary>
              <p>Free shipping on all orders over $500. Returns accepted within 30 days of purchase.</p>
            </details>
          </div>
        </div>
      </div>

      <div className="customer-reviews-section">
        <h2>Customer Reviews</h2>
        <div className="reviews-summary">
          <div className="overall-rating">
            <div className="stars">{renderStars(product.rating)}</div>
            <div className="rating-text">{product.rating} out of 5</div>
            <div className="based-on">Based on {product.reviewCount || reviews.length} reviews</div>
          </div>
          <div className="rating-breakdown">
            {[5, 4, 3, 2, 1].map((star) => {
              const reviewTotal = product.reviewCount || reviews.length || 1;
              const counts = { 5: Math.floor(reviewTotal * 0.65), 4: Math.floor(reviewTotal * 0.20), 3: Math.floor(reviewTotal * 0.10), 2: Math.floor(reviewTotal * 0.03), 1: Math.floor(reviewTotal * 0.02) };
              const percent = (counts[star] / reviewTotal) * 100;
              return (
                <div key={star} className="rating-row">
                  <div className="row-stars">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <i key={s} className={`${s <= star ? 'fas' : 'far'} fa-star ${s > star ? 'empty' : ''}`}></i>
                    ))}
                  </div>
                  <div className="rating-bar">
                    <div className="rating-bar-fill" style={{ width: `${percent}%` }}></div>
                  </div>
                  <span className="rating-count">{counts[star]}</span>
                </div>
              );
            })}
          </div>
          <div className="write-review-section">
            <button className="write-review-btn">Write a review</button>
          </div>
        </div>
        <div className="reviews-list">
          {reviews.map((review) => (
            <div key={review.id} className="review-item">
              <div className="review-stars">{renderStars(review.rating)}</div>
              <h4 className="review-title">{review.title}</h4>
              <p className="review-text">{review.text}</p>
              <div className="review-meta">
                <span className="review-author">{review.author}</span>
                <span className="review-date">{review.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="related-products-section">
          <h2>You May Also Like</h2>
          <div className="related-products-grid">
            {relatedProducts.map((relatedProduct) => (
              <Link to={`/product/${relatedProduct.id}`} key={relatedProduct.id} className="related-product-card">
                <img src={relatedProduct.image} alt={relatedProduct.name} />
                <h3>{relatedProduct.name}</h3>
                <p className="related-price">{relatedProduct.price}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;