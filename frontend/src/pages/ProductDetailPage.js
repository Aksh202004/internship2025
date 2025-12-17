import React, { useState, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import './ProductDetailPage.css';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import Lens from '../components/Lens';
import ringImage from '../assets/images/ring.webp';
import earRingImage from '../assets/images/ear-ring.avif';
import placeholderImage from '../assets/images/placeholder.png';
import pendantImage from '../assets/images/pendant.avif';

const PRODUCTS_DATABASE = {
  1: { name: 'Girlish Star Shaped Gold Stud Earrings', price: '$1,250.00', image: earRingImage },
  2: { name: 'Breathtaking Onyx Stone Diamond Stud Earrings', price: '$1,899.00', image: placeholderImage },
  3: { name: 'Swirl Pattern Diamond Stud Earrings In Yellow Gold', price: '$1,699.00', image: ringImage },
  4: { name: 'Elegant Diamond Ring', price: '$1,499.00', image: placeholderImage },
  5: { name: 'Classic Gold Band Ring', price: '$2,100.00', image: ringImage },
  6: { name: 'Modern Minimalist Ring Design', price: '$1,850.00', image: placeholderImage },
  101: { name: 'Classic Diamond Studs', price: '$899.00', image: earRingImage },
  102: { name: 'Eternity Tennis Bracelet', price: '$1,299.00', image: placeholderImage },
  103: { name: 'Solitaire Pendant Necklace', price: '$1,699.00', image: pendantImage },
  104: { name: 'Rose Gold Trio Wedding Band', price: '$1,400.00', image: ringImage },
};

const DEFAULT_PRODUCT = {
  name: 'Enchanting Diamond Solitaire Ring',
  price: '$2,499.00',
  image: ringImage
};

const SAMPLE_REVIEWS = [
  {
    id: 1,
    rating: 5,
    title: 'Absolutely stunning!',
    text: 'Absolutely stunning! I love this piece. The diamond sparkle is more than I could have imagined. The customer service was also very quick. Highly recommend!',
    author: 'Sarah T.',
    date: 'October 28, 2023'
  },
  {
    id: 2,
    rating: 4,
    title: 'Beautiful, but sizing was off',
    text: 'The ring is gorgeous and well made, however, I wish the fit would be a bit as pictured. The process was easy though and an nice experience.',
    author: 'Mark D.',
    date: 'September 15, 2023'
  }
];

const RELATED_PRODUCTS = [
  { id: 101, name: 'Classic Diamond Studs', price: '$899.00', image: earRingImage },
  { id: 102, name: 'Eternity Tennis Bracelet', price: '$1,299.00', image: placeholderImage },
  { id: 103, name: 'Solitaire Pendant Necklace', price: '$1,699.00', image: pendantImage },
  { id: 104, name: 'Rose Gold Trio Wedding Band', price: '$1,400.00', image: ringImage },
];

const METAL_TYPES = ['Yellow Gold', '18 KAPH GOLD', 'Platinum'];
const AVAILABLE_SIZES = ['5', '6', '7', '8', '9'];

const ProductDetailPage = () => {
  const { id } = useParams();
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [selectedMetalType, setSelectedMetalType] = useState(METAL_TYPES[0]);
  const [selectedSize, setSelectedSize] = useState(AVAILABLE_SIZES[1]);
  const [addedToCart, setAddedToCart] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [lensEnabled, setLensEnabled] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });

  const productData = useMemo(() => 
    PRODUCTS_DATABASE[parseInt(id)] || DEFAULT_PRODUCT,
    [id]
  );

  const product = useMemo(() => ({
    id: parseInt(id),
    name: productData.name,
    price: productData.price,
    rating: 4.7,
    reviews: 126,
    image: productData.image,
    description: 'A timeless piece designed to capture the essence of everlasting love. This exquisite ring features a brilliant-cut diamond, held in a classic four-prong setting that elevates the stone to catch light from every angle, ensuring maximum sparkle.',
    metalTypes: METAL_TYPES,
    sizes: AVAILABLE_SIZES,
  }), [id, productData]);

  const handleWishlistToggle = useCallback(() => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  }, [isInWishlist, product, removeFromWishlist, addToWishlist]);

  const handleAddToCart = useCallback(() => {
    addToCart(product, 1, {
      metalType: selectedMetalType,
      size: selectedSize,
      sku: `R45-21-GD-${selectedSize}`,
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

  return (
    <div className="product-detail-page">
      <div className="breadcrumb">
        <Link to="/">Home</Link> &gt; <Link to="/rings">Rings</Link> &gt; <span>Engagement Rings</span>
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
              <span className="reviews-count">({product.reviews} Reviews)</span>
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
            <div className="rating-number">{product.rating}</div>
            <div className="stars">{renderStars(product.rating)}</div>
            <div className="based-on">Based on {product.reviews} reviews</div>
          </div>
          <div className="reviews-list">
            {SAMPLE_REVIEWS.map((review) => (
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
      </div>

      <div className="related-products-section">
        <h2>You May Also Like</h2>
        <div className="related-products-grid">
          {RELATED_PRODUCTS.map((relatedProduct) => (
            <Link to={`/product/${relatedProduct.id}`} key={relatedProduct.id} className="related-product-card">
              <img src={relatedProduct.image} alt={relatedProduct.name} />
              <h3>{relatedProduct.name}</h3>
              <p className="related-price">{relatedProduct.price}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;