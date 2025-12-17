import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import Wishlist from './Wishlist';
import Cart from './Cart';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { wishlistCount } = useWishlist();
  const { cartCount, cartItems, updateQuantity, removeFromCart } = useCart();

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const toggleWishlist = () => {
    setWishlistOpen(!wishlistOpen);
    if (cartOpen) setCartOpen(false); // Close cart if open
  };

  const toggleCart = () => {
    setCartOpen(!cartOpen);
    if (wishlistOpen) setWishlistOpen(false); // Close wishlist if open
  };

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">
          <img src="/logo.svg" alt="Tanishq" />
        </Link>
      </div>
      <nav className="navigation">
        <ul>
          <li><Link to="/rings">Rings</Link></li>
          <li><Link to="/necklaces">Necklaces</Link></li>
          <li><Link to="/earrings">Earrings</Link></li>
          <li><Link to="/gold">Gold</Link></li>
          <li><Link to="/diamond">Diamond</Link></li>
          <li><Link to="/collections">Collections</Link></li>
        </ul>
      </nav>
      <div className="header-right">
        <div className="search-bar">
          <input type="text" placeholder="Search" />
        </div>
        <div className="user-actions">
          <button onClick={toggleWishlist} className="icon-btn">
            <i className="far fa-heart"></i>
            {wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
          </button>
          <button onClick={toggleCart} className="icon-btn">
            <i className="fas fa-shopping-cart"></i>
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </button>
          <div className="profile-dropdown">
            <button onClick={toggleDropdown} className="profile-button">
              <i className="far fa-user"></i>
            </button>
            {dropdownOpen && (
              <div className="dropdown-content">
                <Link to="/profile" onClick={() => setDropdownOpen(false)}>
                  <i className="far fa-user"></i> My Profile
                </Link>
                <Link to="/login" onClick={() => setDropdownOpen(false)}>
                  <i className="fas fa-sign-in-alt"></i> Login
                </Link>
                <Link to="/signup" onClick={() => setDropdownOpen(false)}>
                  <i className="fas fa-user-plus"></i> Sign Up
                </Link>
                <Link to="/logout" onClick={() => setDropdownOpen(false)}>
                  <i className="fas fa-sign-out-alt"></i> Logout
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      <Wishlist isOpen={wishlistOpen} onClose={() => setWishlistOpen(false)} />
      <Cart 
        isOpen={cartOpen} 
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
      />
    </header>
  );
};

export default Header;