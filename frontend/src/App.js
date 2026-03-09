import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
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

// Clerk configuration
const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

// Lazy load admin components for better performance
const AdminLayout = lazy(() => import('./admin/components/AdminLayout'));
const AdminGuard = lazy(() => import('./admin/components/AdminGuard'));
const AdminDashboard = lazy(() => import('./admin/pages/Dashboard'));
const AdminProducts = lazy(() => import('./admin/pages/Products'));
const AdminProductForm = lazy(() => import('./admin/pages/ProductForm'));
const AdminOrders = lazy(() => import('./admin/pages/Orders'));
const AdminInventory = lazy(() => import('./admin/pages/Inventory'));
const AdminCoupons = lazy(() => import('./admin/pages/Coupons'));
const AdminCustomers = lazy(() => import('./admin/pages/Customers'));
const AdminReviews = lazy(() => import('./admin/pages/Reviews'));
const AdminSettings = lazy(() => import('./admin/pages/Settings'));
const AdminLogin = lazy(() => import('./admin/pages/AdminLogin'));

// Admin Loading Fallback
const AdminLoader = () => (
  <div className="admin-loader">
    <div className="loader-spinner"></div>
    <p>Loading Admin Panel...</p>
  </div>
);

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <WishlistProvider>
        <CartProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Auth Routes - No Header/Footer */}
                <Route path="/login/*" element={<AuthPage />} />
                <Route path="/signup/*" element={<AuthPage />} />
                
                {/* Admin Login - Hidden route, only admins can proceed after signing in */}
                <Route path="/admin/login/*" element={
                  <Suspense fallback={<AdminLoader />}>
                    <AdminLogin />
                  </Suspense>
                } />
                
                {/* Admin Routes - Protected by email check */}
                <Route path="/admin" element={
                  <Suspense fallback={<AdminLoader />}>
                    <AdminGuard>
                      <AdminLayout />
                    </AdminGuard>
                  </Suspense>
                }>
                  <Route index element={<Suspense fallback={<AdminLoader />}><AdminDashboard /></Suspense>} />
                  <Route path="dashboard" element={<Suspense fallback={<AdminLoader />}><AdminDashboard /></Suspense>} />
                  <Route path="products" element={<Suspense fallback={<AdminLoader />}><AdminProducts /></Suspense>} />
                  <Route path="products/new" element={<Suspense fallback={<AdminLoader />}><AdminProductForm /></Suspense>} />
                  <Route path="products/:id/edit" element={<Suspense fallback={<AdminLoader />}><AdminProductForm /></Suspense>} />
                  <Route path="orders" element={<Suspense fallback={<AdminLoader />}><AdminOrders /></Suspense>} />
                  <Route path="inventory" element={<Suspense fallback={<AdminLoader />}><AdminInventory /></Suspense>} />
                  <Route path="coupons" element={<Suspense fallback={<AdminLoader />}><AdminCoupons /></Suspense>} />
                  <Route path="customers" element={<Suspense fallback={<AdminLoader />}><AdminCustomers /></Suspense>} />
                  <Route path="reviews" element={<Suspense fallback={<AdminLoader />}><AdminReviews /></Suspense>} />
                  <Route path="settings" element={<Suspense fallback={<AdminLoader />}><AdminSettings /></Suspense>} />
                </Route>
                
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
    </ClerkProvider>
  );
}

export default App;
