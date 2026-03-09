import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/orderService';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user, isSignedIn } = useUser();
  const { 
    cartItems, 
    getCartTotal, 
    appliedCoupon, 
    couponDiscount, 
    applyCoupon, 
    removeCoupon,
    clearCart 
  } = useCart();

  const [step, setStep] = useState(1);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');

  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [errors, setErrors] = useState({});

  // Pre-fill email if user is signed in
  useEffect(() => {
    if (isSignedIn && user) {
      setShippingAddress(prev => ({
        ...prev,
        email: user.primaryEmailAddress?.emailAddress || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      }));
    }
  }, [isSignedIn, user]);

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0 && step !== 3) {
      navigate('/cart');
    }
  }, [cartItems, navigate, step]);

  // Calculate totals
  const subtotal = getCartTotal();
  const shipping = subtotal > 5000 ? 0 : 99; // Free shipping over ₹5000
  const tax = Math.round(subtotal * 0.03); // 3% GST
  const total = subtotal + shipping + tax - couponDiscount;

  // Handle coupon application
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setApplyingCoupon(true);
    setCouponError('');
    setCouponSuccess('');

    const result = await applyCoupon(couponCode.trim());

    if (result.success) {
      setCouponSuccess(result.message);
      setCouponCode('');
    } else {
      setCouponError(result.error);
    }

    setApplyingCoupon(false);
  };

  // Handle coupon removal
  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponSuccess('');
    setCouponError('');
  };

  // Validate shipping form
  const validateShipping = () => {
    const newErrors = {};
    
    if (!shippingAddress.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!shippingAddress.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!shippingAddress.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(shippingAddress.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!shippingAddress.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(shippingAddress.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Invalid phone number';
    }
    if (!shippingAddress.address.trim()) newErrors.address = 'Address is required';
    if (!shippingAddress.city.trim()) newErrors.city = 'City is required';
    if (!shippingAddress.state.trim()) newErrors.state = 'State is required';
    if (!shippingAddress.pincode.trim()) {
      newErrors.pincode = 'PIN code is required';
    } else if (!/^\d{6}$/.test(shippingAddress.pincode)) {
      newErrors.pincode = 'Invalid PIN code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Proceed to next step
  const handleContinue = () => {
    if (step === 1 && validateShipping()) {
      setStep(2);
    }
  };

  // Place order
  const handlePlaceOrder = async () => {
    setPlacingOrder(true);
    setOrderError('');

    const result = await createOrder({
      cartItems,
      shippingAddress,
      customerEmail: shippingAddress.email,
      subtotal,
      shippingCost: shipping,
      tax,
      discount: couponDiscount,
      total,
      coupon: appliedCoupon,
    });

    if (result.success) {
      clearCart();
      setStep(3);
      // Store order for success page
      sessionStorage.setItem('lastOrder', JSON.stringify(result.order));
    } else {
      setOrderError(result.error);
    }

    setPlacingOrder(false);
  };

  // Order success view
  if (step === 3) {
    const lastOrder = JSON.parse(sessionStorage.getItem('lastOrder') || '{}');
    return (
      <div className="checkout-page">
        <div className="order-success">
          <div className="success-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <h1>Order Placed Successfully!</h1>
          <p className="order-number">Order Number: <strong>{lastOrder.order_number}</strong></p>
          <p className="success-message">
            Thank you for your order. We've sent a confirmation email to <strong>{lastOrder.customer_email}</strong>
          </p>
          <div className="success-actions">
            <Link to="/" className="btn-primary">Continue Shopping</Link>
            <Link to="/profile" className="btn-secondary">View My Orders</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <Link to="/cart" className="back-link">
          <i className="fas fa-arrow-left"></i> Back to Cart
        </Link>
        <h1>Checkout</h1>
      </div>

      <div className="checkout-steps">
        <div className={`step ${step >= 1 ? 'active' : ''}`}>
          <span className="step-number">1</span>
          <span className="step-label">Shipping</span>
        </div>
        <div className="step-line"></div>
        <div className={`step ${step >= 2 ? 'active' : ''}`}>
          <span className="step-number">2</span>
          <span className="step-label">Review & Pay</span>
        </div>
      </div>

      <div className="checkout-container">
        {/* Left: Form Section */}
        <div className="checkout-form-section">
          {step === 1 && (
            <div className="shipping-form">
              <h2>Shipping Address</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={shippingAddress.firstName}
                    onChange={handleInputChange}
                    className={errors.firstName ? 'error' : ''}
                  />
                  {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={shippingAddress.lastName}
                    onChange={handleInputChange}
                    className={errors.lastName ? 'error' : ''}
                  />
                  {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={shippingAddress.email}
                    onChange={handleInputChange}
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleInputChange}
                    placeholder="10-digit mobile number"
                    className={errors.phone ? 'error' : ''}
                  />
                  {errors.phone && <span className="error-text">{errors.phone}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Address *</label>
                <input
                  type="text"
                  name="address"
                  value={shippingAddress.address}
                  onChange={handleInputChange}
                  placeholder="House number, building, street"
                  className={errors.address ? 'error' : ''}
                />
                {errors.address && <span className="error-text">{errors.address}</span>}
              </div>

              <div className="form-group">
                <label>Apartment, suite, etc. (optional)</label>
                <input
                  type="text"
                  name="apartment"
                  value={shippingAddress.apartment}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-row form-row-3">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleInputChange}
                    className={errors.city ? 'error' : ''}
                  />
                  {errors.city && <span className="error-text">{errors.city}</span>}
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <select
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleInputChange}
                    className={errors.state ? 'error' : ''}
                  >
                    <option value="">Select State</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Bihar">Bihar</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Odisha">Odisha</option>
                    <option value="Assam">Assam</option>
                    <option value="Jharkhand">Jharkhand</option>
                    <option value="Chhattisgarh">Chhattisgarh</option>
                    <option value="Uttarakhand">Uttarakhand</option>
                    <option value="Himachal Pradesh">Himachal Pradesh</option>
                    <option value="Goa">Goa</option>
                  </select>
                  {errors.state && <span className="error-text">{errors.state}</span>}
                </div>
                <div className="form-group">
                  <label>PIN Code *</label>
                  <input
                    type="text"
                    name="pincode"
                    value={shippingAddress.pincode}
                    onChange={handleInputChange}
                    placeholder="6-digit PIN"
                    maxLength="6"
                    className={errors.pincode ? 'error' : ''}
                  />
                  {errors.pincode && <span className="error-text">{errors.pincode}</span>}
                </div>
              </div>

              <button className="btn-continue" onClick={handleContinue}>
                Continue to Review <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="review-section">
              <div className="shipping-review">
                <div className="review-header">
                  <h2>Shipping Address</h2>
                  <button className="edit-btn" onClick={() => setStep(1)}>Edit</button>
                </div>
                <div className="address-card">
                  <p><strong>{shippingAddress.firstName} {shippingAddress.lastName}</strong></p>
                  <p>{shippingAddress.address}</p>
                  {shippingAddress.apartment && <p>{shippingAddress.apartment}</p>}
                  <p>{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}</p>
                  <p>{shippingAddress.phone}</p>
                  <p>{shippingAddress.email}</p>
                </div>
              </div>

              <div className="items-review">
                <h2>Order Items ({cartItems.length})</h2>
                <div className="items-list">
                  {cartItems.map(item => {
                    const price = parseFloat(item.price.replace(/[₹$,]/g, ''));
                    return (
                      <div key={item.id} className="order-item">
                        <img src={item.image} alt={item.name} />
                        <div className="item-details">
                          <h4>{item.name}</h4>
                          {item.metalType && <p>Metal: {item.metalType}</p>}
                          {item.size && <p>Size: {item.size}</p>}
                          <p>Qty: {item.quantity}</p>
                        </div>
                        <div className="item-price">
                          ₹{(price * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="payment-section">
                <h2>Payment</h2>
                <div className="payment-info">
                  <i className="fas fa-info-circle"></i>
                  <p>Payment gateway (Razorpay) will be integrated soon. For now, orders are placed as "Pay on Delivery".</p>
                </div>
              </div>

              {orderError && (
                <div className="order-error">
                  <i className="fas fa-exclamation-circle"></i> {orderError}
                </div>
              )}

              <button 
                className="btn-place-order" 
                onClick={handlePlaceOrder}
                disabled={placingOrder}
              >
                {placingOrder ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Placing Order...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check"></i> Place Order - ₹{total.toLocaleString()}
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Right: Order Summary */}
        <div className="order-summary-section">
          <h2>Order Summary</h2>
          
          <div className="summary-items">
            {cartItems.slice(0, 3).map(item => (
              <div key={item.id} className="summary-item">
                <img src={item.image} alt={item.name} />
                <div className="item-info">
                  <p className="item-name">{item.name}</p>
                  <p className="item-qty">Qty: {item.quantity}</p>
                </div>
                <p className="item-price">{item.price}</p>
              </div>
            ))}
            {cartItems.length > 3 && (
              <p className="more-items">+{cartItems.length - 3} more items</p>
            )}
          </div>

          <div className="coupon-section">
            {appliedCoupon ? (
              <div className="applied-coupon">
                <div className="coupon-badge">
                  <i className="fas fa-tag"></i>
                  <span>{appliedCoupon.code}</span>
                </div>
                <div className="coupon-details">
                  <span className="discount-amount">-₹{couponDiscount.toLocaleString()}</span>
                  <button className="remove-coupon" onClick={handleRemoveCoupon}>
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
            ) : (
              <div className="coupon-input">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                />
                <button onClick={handleApplyCoupon} disabled={applyingCoupon}>
                  {applyingCoupon ? '...' : 'Apply'}
                </button>
              </div>
            )}
            {couponError && <p className="coupon-error">{couponError}</p>}
            {couponSuccess && <p className="coupon-success">{couponSuccess}</p>}
          </div>

          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="summary-row discount">
                <span>Discount</span>
                <span>-₹{couponDiscount.toLocaleString()}</span>
              </div>
            )}
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
            </div>
            <div className="summary-row">
              <span>Tax (GST 3%)</span>
              <span>₹{tax.toLocaleString()}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
          </div>

          {shipping === 0 && (
            <div className="free-shipping-badge">
              <i className="fas fa-truck"></i> Free shipping on orders above ₹5,000
            </div>
          )}

          <div className="secure-badge">
            <i className="fas fa-shield-alt"></i>
            <span>Secure Checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;