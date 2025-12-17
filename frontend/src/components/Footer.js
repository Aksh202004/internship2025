import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h4>Tanishq</h4>
          <p>Timeless jewellery crafted with passion and precision for every special moment in your life.</p>
        </div>
        <div className="footer-section">
          <h4>Useful Links</h4>
          <ul>
            <li><a href="/about-us">About Us</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/faq">FAQs</a></li>
            <li><a href="/store-locator">Store Locator</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Customer Service</h4>
          <ul>
            <li><a href="/shipping">Shipping</a></li>
            <li><a href="/returns-exchanges">Returns & Exchanges</a></li>
            <li><a href="/privacy-policy">Privacy Policy</a></li>
            <li><a href="/terms-of-service">Terms of Service</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Connect With Us</h4>
          <div className="newsletter-signup">
            <input type="email" placeholder="Enter your email" />
            <button>&#9658;</button>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Tanishq. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;