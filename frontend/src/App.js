import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import UserProfilePage from './pages/UserProfilePage';
import RingsPage from './pages/RingsPage';
import EarringsPage from './pages/EarringsPage';
import PendantsPage from './pages/PendantsPage';
import BraceletsPage from './pages/BraceletsPage';
import NecklacesPage from './pages/NecklacesPage';
import AuthPage from './pages/AuthPage';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <WishlistProvider>
      <CartProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Auth Routes - No Header/Footer */}
              <Route path="/login" element={<AuthPage />} />
              <Route path="/signup" element={<AuthPage />} />
              
              {/* Main Routes - With Header/Footer */}
              <Route path="/*" element={
                <>
                  <Header />
                  <main>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/product/:id" element={<ProductDetailPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/profile" element={<UserProfilePage />} />
                      <Route path="/rings" element={<RingsPage />} />
                      <Route path="/earrings" element={<EarringsPage />} />
                      <Route path="/pendants" element={<PendantsPage />} />
                      <Route path="/bracelets" element={<BraceletsPage />} />
                      <Route path="/necklaces" element={<NecklacesPage />} />
                    </Routes>
                  </main>
                  <Footer />
                </>
              } />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </WishlistProvider>
  );
}

export default App;
