import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './UserProfilePage.css';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const UserProfilePage = () => {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [isEditing, setIsEditing] = useState(false);
  const [userDetails, setUserDetails] = useState({
    fullName: 'Ananya Sharma',
    email: 'ananya.sharma@example.com',
    phone: '+91 98765 43210'
  });

  const handleAddToCart = (item) => {
    addToCart(item, 1, {
      metalType: 'Yellow Gold',
      size: '6',
      sku: `${item.id}-SKU`,
    });
    // Optionally remove from wishlist after adding to cart
    // removeFromWishlist(item.id);
  };

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to backend
  };

  return (
    <div className="user-profile-page">
      <div className="profile-container">
        <aside className="profile-sidebar">
          <div className="user-info">
            <div className="user-avatar">
              <i className="fas fa-user"></i>
            </div>
            <div className="user-details">
              <h4>{userDetails.fullName}</h4>
              <p>{userDetails.email}</p>
            </div>
          </div>
          <nav className="profile-nav">
            <ul>
              <li className="active">
                <i className="far fa-user"></i>
                <span>My Profile</span>
              </li>
              <li>
                <i className="fas fa-box"></i>
                <span>Order History</span>
              </li>
              <li>
                <i className="far fa-heart"></i>
                <span>Wishlist</span>
              </li>
              <li>
                <i className="fas fa-map-marker-alt"></i>
                <span>Address Book</span>
              </li>
              <li>
                <i className="fas fa-sign-out-alt"></i>
                <span>Logout</span>
              </li>
            </ul>
          </nav>
        </aside>

        <main className="profile-content">
          <h2>Welcome back, {userDetails.fullName.split(' ')[0]}!</h2>
          <p className="welcome-subtitle">Manage your profile, track your orders and view your wishlist.</p>

          <div className="personal-details">
            <div className="section-header">
              <h3>Personal Details</h3>
              <button className="edit-btn" onClick={isEditing ? handleSave : handleEdit}>
                <i className={isEditing ? 'fas fa-check' : 'fas fa-edit'}></i>
                {isEditing ? 'Save' : 'Edit'}
              </button>
            </div>

            <div className="details-grid">
              <div className="detail-field">
                <label>Full Name</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={userDetails.fullName}
                    onChange={(e) => setUserDetails({...userDetails, fullName: e.target.value})}
                  />
                ) : (
                  <p>{userDetails.fullName}</p>
                )}
              </div>
              <div className="detail-field">
                <label>Email Address</label>
                {isEditing ? (
                  <input 
                    type="email" 
                    value={userDetails.email}
                    onChange={(e) => setUserDetails({...userDetails, email: e.target.value})}
                  />
                ) : (
                  <p>{userDetails.email}</p>
                )}
              </div>
              <div className="detail-field">
                <label>Phone Number</label>
                {isEditing ? (
                  <input 
                    type="tel" 
                    value={userDetails.phone}
                    onChange={(e) => setUserDetails({...userDetails, phone: e.target.value})}
                  />
                ) : (
                  <p>{userDetails.phone}</p>
                )}
              </div>
            </div>
          </div>

          <div className="password-section">
            <h3>Password</h3>
            <p className="password-subtitle">For your security, we recommend changing your password periodically.</p>
            <button className="change-password-btn">Change Password</button>
          </div>

          <div className="my-wishlist-section">
            <h3>My Wishlist ({wishlistItems.length})</h3>
            {wishlistItems.length === 0 ? (
              <div className="empty-wishlist-message">
                <i className="far fa-heart"></i>
                <p>Your wishlist is empty</p>
                <Link to="/rings" className="browse-btn">Browse Products</Link>
              </div>
            ) : (
              <div className="wishlist-grid">
                {wishlistItems.map((item) => (
                  <div key={item.id} className="wishlist-card">
                    <button 
                      className="remove-wishlist-btn"
                      onClick={() => removeFromWishlist(item.id)}
                      title="Remove from wishlist"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                    <Link to={`/product/${item.id}`} className="wishlist-card-link">
                      <img src={item.image} alt={item.name} />
                      <h4>{item.name}</h4>
                      <p className="wishlist-price">{item.price}</p>
                    </Link>
                    <button 
                      className="add-to-cart-wishlist-btn"
                      onClick={() => handleAddToCart(item)}
                    >
                      <i className="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserProfilePage;