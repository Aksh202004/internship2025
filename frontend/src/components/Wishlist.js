import React from 'react';
import { Link } from 'react-router-dom';
import './Wishlist.css';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const Wishlist = ({ isOpen, onClose }) => {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (item) => {
    addToCart(item, 1, {
      metalType: 'Yellow Gold',
      size: '6',
      sku: `${item.id}-SKU`,
    });
    removeFromWishlist(item.id);
  };

  return (
    <>
      {isOpen && <div className="overlay" onClick={onClose}></div>}
      <div className={`wishlist-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="wishlist-header">
          <h2>My Wishlist ({wishlistItems.length})</h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="wishlist-content">
          {wishlistItems.length === 0 ? (
            <div className="empty-wishlist">
              <i className="far fa-heart"></i>
              <p>Your wishlist is empty</p>
              <span>Add items you love to your wishlist</span>
            </div>
          ) : (
            <div className="wishlist-items">
              {wishlistItems.map((item) => (
                <div key={item.id} className="wishlist-item">
                  <Link to={`/product/${item.id}`} onClick={onClose} className="wishlist-item-link">
                    <img src={item.image} alt={item.name} className="wishlist-item-image" />
                    <div className="wishlist-item-details">
                      <h3 className="wishlist-item-name">{item.name}</h3>
                      <p className="wishlist-item-price">{item.price}</p>
                    </div>
                  </Link>
                  <button 
                    className="wishlist-remove-btn"
                    onClick={() => removeFromWishlist(item.id)}
                    title="Remove from wishlist"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                  <div className="wishlist-item-actions">
                    <button onClick={() => handleAddToCart(item)}>Add to Cart</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Wishlist;
