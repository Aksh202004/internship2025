import React from 'react';
import './CheckoutPage.css';

const CheckoutPage = () => {
  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-form">
          <h1>Secure Checkout</h1>
          <div className="checkout-steps">
            <span>Shipping</span> &gt; <span>Delivery</span> &gt; <span>Payment</span>
          </div>
          <div className="shipping-address">
            <h2>1. Shipping Address</h2>
            {/* Add shipping address form here */}
          </div>
          <div className="delivery-options">
            <h2>2. Delivery Options</h2>
            {/* Add delivery options here */}
          </div>
          <div className="payment-method">
            <h2>3. Payment Method</h2>
            {/* Add payment method here */}
          </div>
        </div>
        <div className="order-summary">
          <h2>Order Summary</h2>
          {/* Add order summary items here */}
          <div className="summary-total">
            <span>Total</span>
            <span>$3,488.40</span>
          </div>
          <div className="discount-code">
            <input type="text" placeholder="Discount Code" />
            <button>Apply</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;