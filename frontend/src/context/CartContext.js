import React, { createContext, useState, useContext, useEffect } from 'react';
import { validateCoupon } from '../services/couponService';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = sessionStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    const saved = sessionStorage.getItem('appliedCoupon');
    return saved ? JSON.parse(saved) : null;
  });

  const [couponDiscount, setCouponDiscount] = useState(() => {
    const saved = sessionStorage.getItem('couponDiscount');
    return saved ? parseFloat(saved) : 0;
  });

  useEffect(() => {
    sessionStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (appliedCoupon) {
      sessionStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupon));
      sessionStorage.setItem('couponDiscount', couponDiscount.toString());
    } else {
      sessionStorage.removeItem('appliedCoupon');
      sessionStorage.removeItem('couponDiscount');
    }
  }, [appliedCoupon, couponDiscount]);

  const addToCart = (product, quantity = 1, options = {}) => {
    setCartItems((prev) => {
      const existingItem = prev.find(
        (item) => 
          item.id === product.id && 
          item.metalType === options.metalType && 
          item.size === options.size
      );

      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id && 
          item.metalType === options.metalType && 
          item.size === options.size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [
        ...prev,
        {
          ...product,
          quantity,
          metalType: options.metalType,
          size: options.size,
          sku: options.sku || `${product.id}-SKU`,
        },
      ];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price.replace(/[₹$,]/g, ''));
      return total + price * item.quantity;
    }, 0);
  };

  // Apply coupon code
  const applyCoupon = async (code) => {
    const cartTotal = getCartTotal();
    const result = await validateCoupon(code, cartTotal);
    
    if (result.valid) {
      setAppliedCoupon(result.coupon);
      setCouponDiscount(result.discount);
      return { success: true, message: result.message, discount: result.discount };
    } else {
      return { success: false, error: result.error };
    }
  };

  // Remove applied coupon
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
  };

  // Recalculate discount when cart total changes
  useEffect(() => {
    const recalculateDiscount = async () => {
      if (appliedCoupon) {
        const cartTotal = getCartTotal();
        if (cartTotal === 0) {
          removeCoupon();
          return;
        }
        const result = await validateCoupon(appliedCoupon.code, cartTotal);
        if (result.valid) {
          setCouponDiscount(result.discount);
        } else {
          // Coupon no longer valid (e.g., cart total below minimum)
          removeCoupon();
        }
      }
    };
    recalculateDiscount();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems]);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Get final total after discount
  const getFinalTotal = () => {
    const subtotal = getCartTotal();
    return Math.max(0, subtotal - couponDiscount);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getFinalTotal,
        cartCount,
        appliedCoupon,
        couponDiscount,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
