import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { UserButton, useUser } from '@clerk/clerk-react';
import './AdminLayout.css';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const menuItems = [
    { path: '/admin', icon: 'fas fa-home', label: 'Dashboard', exact: true },
    { path: '/admin/products', icon: 'fas fa-gem', label: 'Products' },
    { path: '/admin/orders', icon: 'fas fa-shopping-bag', label: 'Orders' },
    { path: '/admin/inventory', icon: 'fas fa-boxes', label: 'Inventory' },
    { path: '/admin/coupons', icon: 'fas fa-ticket-alt', label: 'Coupons' },
    { path: '/admin/customers', icon: 'fas fa-users', label: 'Customers' },
    { path: '/admin/reviews', icon: 'fas fa-star', label: 'Reviews' },
    { path: '/admin/settings', icon: 'fas fa-cog', label: 'Settings' },
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    // Redirect to homepage after logout
    navigate('/');
  };

  return (
    <div className={`admin-layout ${sidebarCollapsed ? 'collapsed' : ''}`}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <Link to="/admin" className="admin-logo">
            {!sidebarCollapsed && <span className="logo-text">Admin Panel</span>}
            {sidebarCollapsed && <span className="logo-icon">A</span>}
          </Link>
          <button 
            className="collapse-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <i className={`fas fa-chevron-${sidebarCollapsed ? 'right' : 'left'}`}></i>
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link 
                  to={item.path} 
                  className={`nav-link ${isActive(item.path, item.exact) ? 'active' : ''}`}
                  title={sidebarCollapsed ? item.label : ''}
                >
                  <i className={item.icon}></i>
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <Link to="/" className="nav-link" title="View Store">
            <i className="fas fa-external-link-alt"></i>
            {!sidebarCollapsed && <span>View Store</span>}
          </Link>
          <button className="nav-link logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Top Header */}
        <header className="admin-header">
          <div className="header-left">
            <button 
              className="mobile-menu-btn"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <i className="fas fa-bars"></i>
            </button>
            <div className="breadcrumb">
              {location.pathname.split('/').filter(Boolean).map((part, index, arr) => (
                <span key={part}>
                  {index > 0 && <i className="fas fa-chevron-right"></i>}
                  <span className={index === arr.length - 1 ? 'current' : ''}>
                    {part.charAt(0).toUpperCase() + part.slice(1)}
                  </span>
                </span>
              ))}
            </div>
          </div>
          <div className="header-right">
            <button className="header-btn" title="Notifications">
              <i className="fas fa-bell"></i>
              <span className="badge">3</span>
            </button>
            <div className="admin-profile">
              <span className="admin-name">{user?.firstName || 'Admin'}</span>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "clerk-avatar-box",
                    userButtonPopoverCard: "clerk-popover-card"
                  }
                }}
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
