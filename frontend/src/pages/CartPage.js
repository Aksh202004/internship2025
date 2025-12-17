import React from 'react';
import { Link } from 'react-router-dom';
import './CartPage.css';
import { useCart } from '../context/CartContext';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();

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

  const moveAllToWishlist = () => {
    // Implement this later
    alert('Move all to wishlist functionality');
  };

  return (
    <div className="cart-page">
      <div className="breadcrumb">
        <Link to="/">Home</Link> &gt; <span>Shopping Cart</span>
      </div>

      <h1>My Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="empty-cart-page">
          <i className="fas fa-shopping-cart"></i>
          <p>Your cart is empty</p>
          <Link to="/" className="continue-shopping-btn">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="cart-page-container">
          <div className="cart-items-section">
            <table className="cart-table">
              <thead>
                <tr>
                  <th>PRODUCT</th>
                  <th>QUANTITY</th>
                  <th>PRICE</th>
                  <th>SUBTOTAL</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => {
                  const price = parseFloat(item.price.replace(/[₹$,]/g, ''));
                  const itemSubtotal = price * item.quantity;
                  
                  return (
                    <tr key={item.id} className="cart-table-row">
                      <td className="product-cell">
                        <Link to={`/product/${item.id}`} className="product-info">
                          <img src={item.image} alt={item.name} />
                          <div className="product-details">
                            <h3>{item.name}</h3>
                            {item.size && <p>Size: {item.size}</p>}
                            {item.metalType && <p>Metal: {item.metalType}</p>}
                            <p className="sku">SKU: {item.sku || `${item.id}-SKU`}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="quantity-cell">
                        <div className="quantity-controls">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                            +
                          </button>
                        </div>
                      </td>
                      <td className="price-cell">{item.price}</td>
                      <td className="subtotal-cell">
                        ${itemSubtotal.toFixed(2)}
                        <button 
                          className="remove-btn"
                          onClick={() => removeFromCart(item.id)}
                          title="Remove item"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="cart-actions">
              <button className="action-btn" onClick={moveAllToWishlist}>
                <i className="far fa-heart"></i> Move All to Wishlist
              </button>
              <button className="action-btn remove-all" onClick={clearCart}>
                <i className="fas fa-trash"></i> Remove All
              </button>
            </div>
          </div>

          <div className="order-summary-section">
            <h2>Order Summary</h2>
            <div className="summary-details">
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
                <span>${estimatedTotal.toFixed(2)}</span>
              </div>
            </div>

            <Link to="/checkout" className="checkout-btn">
              <i className="fas fa-lock"></i> Proceed to Checkout
            </Link>

            <Link to="/" className="continue-shopping-link">
              Continue Shopping
            </Link>

            <div className="secure-checkout">
              <i className="fas fa-shield-alt"></i> SSL Secure Transaction
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
