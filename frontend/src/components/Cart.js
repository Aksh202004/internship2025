import React from 'react';
import { Link } from 'react-router-dom';
import './Cart.css';

const Cart = ({ isOpen, onClose, cartItems = [], updateQuantity, removeFromCart }) => {
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price.replace(/[₹$,]/g, ''));
      return total + (price * item.quantity);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const shipping = subtotal > 0 ? 15.00 : 0;
  const tax = subtotal > 0 ? subtotal * 0.08 : 0;
  const estimatedTotal = subtotal + shipping + tax;

  return (
    <>
      {isOpen && <div className="overlay" onClick={onClose}></div>}
      <div className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>My Shopping Cart ({cartItems.length})</h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="cart-content">
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <i className="fas fa-shopping-cart"></i>
              <p>Your cart is empty</p>
              <span>Start shopping to add items to your cart</span>
            </div>
          ) : (
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <Link to={`/product/${item.id}`} onClick={onClose} className="cart-item-link">
                    <img src={item.image} alt={item.name} className="cart-item-image" />
                    <div className="cart-item-info">
                      <h3 className="cart-item-name">{item.name}</h3>
                      {item.size && <p className="cart-item-meta">Size: {item.size}</p>}
                      {item.metalType && <p className="cart-item-meta">Metal: {item.metalType}</p>}
                      <p className="cart-item-sku">SKU: {item.sku || `${item.id}-SKU`}</p>
                    </div>
                  </Link>
                  <div className="cart-item-details">
                    <div className="cart-item-bottom">
                      <div className="quantity-controls">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                          <i className="fas fa-minus"></i>
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <i className="fas fa-plus"></i>
                        </button>
                      </div>
                      <p className="cart-item-price">{item.price}</p>
                    </div>
                  </div>
                  <button 
                    className="remove-item-btn"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-summary">
              <div className="summary-row">
                <span>Subtotal ({cartItems.length} items)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Estimated Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Estimated Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="summary-total">
                <span>Estimated Total</span>
                <span className="total-amount">${estimatedTotal.toFixed(2)}</span>
              </div>
            </div>
            
            <Link to="/cart" className="view-cart-btn" onClick={onClose}>
              View Full Cart
            </Link>
            <Link to="/checkout" className="checkout-btn" onClick={onClose}>
              <i className="fas fa-lock"></i> Proceed to Checkout
            </Link>
            
            <div className="cart-actions">
              <button className="action-link">
                <i className="far fa-heart"></i> Move All to Wishlist
              </button>
              <button className="action-link remove-all">
                <i className="fas fa-trash"></i> Remove All
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Cart;
