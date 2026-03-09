import React, { useState } from 'react';
import './Settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('store');
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'Lumina Jewels',
    storeEmail: 'contact@luminajewels.com',
    storePhone: '+91 98765 43210',
    storeAddress: '123 Jewelry Lane, Diamond District, Mumbai, Maharashtra 400001',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
  });
  const [shippingSettings, setShippingSettings] = useState({
    freeShippingThreshold: 10000,
    standardShippingRate: 500,
    expressShippingRate: 1000,
    processingTime: '2-3',
    deliveryTime: '5-7',
  });
  const [taxSettings, setTaxSettings] = useState({
    enableTax: true,
    taxRate: 3,
    taxName: 'GST',
    inclusiveOfTax: false,
  });
  const [notificationSettings, setNotificationSettings] = useState({
    orderConfirmation: true,
    orderShipped: true,
    orderDelivered: true,
    lowStockAlert: true,
    lowStockThreshold: 5,
    newReviewAlert: true,
    dailySummary: false,
  });
  const [saved, setSaved] = useState(false);

  const handleStoreChange = (e) => {
    const { name, value } = e.target;
    setStoreSettings({ ...storeSettings, [name]: value });
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingSettings({ ...shippingSettings, [name]: value });
  };

  const handleTaxChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTaxSettings({
      ...taxSettings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleNotificationChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNotificationSettings({
      ...notificationSettings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: 'store', label: 'Store Info', icon: 'fas fa-store' },
    { id: 'shipping', label: 'Shipping', icon: 'fas fa-truck' },
    { id: 'tax', label: 'Tax', icon: 'fas fa-percent' },
    { id: 'notifications', label: 'Notifications', icon: 'fas fa-bell' },
    { id: 'security', label: 'Security', icon: 'fas fa-shield-alt' },
  ];

  return (
    <div className="settings-page">
      <div className="page-header">
        <div className="header-left">
          <h1>Settings</h1>
          <p className="page-subtitle">Configure your store preferences</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={handleSave}>
            <i className="fas fa-save"></i> Save Changes
          </button>
        </div>
      </div>

      {saved && (
        <div className="save-notification">
          <i className="fas fa-check-circle"></i>
          Settings saved successfully!
        </div>
      )}

      <div className="settings-container">
        {/* Tabs */}
        <div className="settings-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <i className={tab.icon}></i>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="settings-content">
          {/* Store Info */}
          {activeTab === 'store' && (
            <div className="settings-section">
              <h2>Store Information</h2>
              <p className="section-description">
                Basic information about your jewelry store
              </p>

              <div className="form-grid">
                <div className="form-group">
                  <label>Store Name</label>
                  <input
                    type="text"
                    name="storeName"
                    value={storeSettings.storeName}
                    onChange={handleStoreChange}
                  />
                </div>
                <div className="form-group">
                  <label>Contact Email</label>
                  <input
                    type="email"
                    name="storeEmail"
                    value={storeSettings.storeEmail}
                    onChange={handleStoreChange}
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="storePhone"
                    value={storeSettings.storePhone}
                    onChange={handleStoreChange}
                  />
                </div>
                <div className="form-group">
                  <label>Currency</label>
                  <select
                    name="currency"
                    value={storeSettings.currency}
                    onChange={handleStoreChange}
                  >
                    <option value="INR">Indian Rupee (₹)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="GBP">British Pound (£)</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Store Address</label>
                  <textarea
                    name="storeAddress"
                    value={storeSettings.storeAddress}
                    onChange={handleStoreChange}
                    rows="2"
                  ></textarea>
                </div>
                <div className="form-group">
                  <label>Timezone</label>
                  <select
                    name="timezone"
                    value={storeSettings.timezone}
                    onChange={handleStoreChange}
                  >
                    <option value="Asia/Kolkata">India (IST)</option>
                    <option value="America/New_York">US Eastern (EST)</option>
                    <option value="Europe/London">UK (GMT)</option>
                    <option value="Asia/Dubai">Dubai (GST)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Shipping */}
          {activeTab === 'shipping' && (
            <div className="settings-section">
              <h2>Shipping Settings</h2>
              <p className="section-description">
                Configure shipping rates and delivery options
              </p>

              <div className="form-grid">
                <div className="form-group">
                  <label>Free Shipping Threshold (₹)</label>
                  <input
                    type="number"
                    name="freeShippingThreshold"
                    value={shippingSettings.freeShippingThreshold}
                    onChange={handleShippingChange}
                  />
                  <span className="form-hint">Orders above this amount get free shipping</span>
                </div>
                <div className="form-group">
                  <label>Standard Shipping Rate (₹)</label>
                  <input
                    type="number"
                    name="standardShippingRate"
                    value={shippingSettings.standardShippingRate}
                    onChange={handleShippingChange}
                  />
                </div>
                <div className="form-group">
                  <label>Express Shipping Rate (₹)</label>
                  <input
                    type="number"
                    name="expressShippingRate"
                    value={shippingSettings.expressShippingRate}
                    onChange={handleShippingChange}
                  />
                </div>
                <div className="form-group">
                  <label>Processing Time (days)</label>
                  <input
                    type="text"
                    name="processingTime"
                    value={shippingSettings.processingTime}
                    onChange={handleShippingChange}
                    placeholder="e.g., 2-3"
                  />
                </div>
                <div className="form-group">
                  <label>Estimated Delivery (days)</label>
                  <input
                    type="text"
                    name="deliveryTime"
                    value={shippingSettings.deliveryTime}
                    onChange={handleShippingChange}
                    placeholder="e.g., 5-7"
                  />
                </div>
              </div>

              <div className="info-box">
                <i className="fas fa-info-circle"></i>
                <p>
                  Jewelry items are shipped with insurance and require signature on delivery.
                  All shipments are handled by verified courier partners.
                </p>
              </div>
            </div>
          )}

          {/* Tax */}
          {activeTab === 'tax' && (
            <div className="settings-section">
              <h2>Tax Settings</h2>
              <p className="section-description">
                Configure tax calculation for your orders
              </p>

              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      name="enableTax"
                      checked={taxSettings.enableTax}
                      onChange={handleTaxChange}
                    />
                    <span className="toggle-switch"></span>
                    Enable Tax Calculation
                  </label>
                </div>

                {taxSettings.enableTax && (
                  <>
                    <div className="form-group">
                      <label>Tax Name</label>
                      <input
                        type="text"
                        name="taxName"
                        value={taxSettings.taxName}
                        onChange={handleTaxChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Tax Rate (%)</label>
                      <input
                        type="number"
                        name="taxRate"
                        value={taxSettings.taxRate}
                        onChange={handleTaxChange}
                        step="0.1"
                      />
                    </div>
                    <div className="form-group full-width">
                      <label className="toggle-label">
                        <input
                          type="checkbox"
                          name="inclusiveOfTax"
                          checked={taxSettings.inclusiveOfTax}
                          onChange={handleTaxChange}
                        />
                        <span className="toggle-switch"></span>
                        Prices are inclusive of tax
                      </label>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Notification Settings</h2>
              <p className="section-description">
                Configure email notifications for you and your customers
              </p>

              <div className="notification-group">
                <h3>Customer Notifications</h3>
                <div className="toggle-list">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      name="orderConfirmation"
                      checked={notificationSettings.orderConfirmation}
                      onChange={handleNotificationChange}
                    />
                    <span className="toggle-switch"></span>
                    <div className="toggle-info">
                      <span className="toggle-title">Order Confirmation</span>
                      <span className="toggle-desc">Send email when order is placed</span>
                    </div>
                  </label>
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      name="orderShipped"
                      checked={notificationSettings.orderShipped}
                      onChange={handleNotificationChange}
                    />
                    <span className="toggle-switch"></span>
                    <div className="toggle-info">
                      <span className="toggle-title">Order Shipped</span>
                      <span className="toggle-desc">Send email with tracking info</span>
                    </div>
                  </label>
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      name="orderDelivered"
                      checked={notificationSettings.orderDelivered}
                      onChange={handleNotificationChange}
                    />
                    <span className="toggle-switch"></span>
                    <div className="toggle-info">
                      <span className="toggle-title">Order Delivered</span>
                      <span className="toggle-desc">Send email when delivered</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="notification-group">
                <h3>Admin Notifications</h3>
                <div className="toggle-list">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      name="lowStockAlert"
                      checked={notificationSettings.lowStockAlert}
                      onChange={handleNotificationChange}
                    />
                    <span className="toggle-switch"></span>
                    <div className="toggle-info">
                      <span className="toggle-title">Low Stock Alerts</span>
                      <span className="toggle-desc">Get notified when stock is low</span>
                    </div>
                  </label>
                  {notificationSettings.lowStockAlert && (
                    <div className="nested-setting">
                      <label>Alert when stock falls below:</label>
                      <input
                        type="number"
                        name="lowStockThreshold"
                        value={notificationSettings.lowStockThreshold}
                        onChange={handleNotificationChange}
                        min="1"
                      />
                    </div>
                  )}
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      name="newReviewAlert"
                      checked={notificationSettings.newReviewAlert}
                      onChange={handleNotificationChange}
                    />
                    <span className="toggle-switch"></span>
                    <div className="toggle-info">
                      <span className="toggle-title">New Review Alerts</span>
                      <span className="toggle-desc">Get notified of new reviews</span>
                    </div>
                  </label>
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      name="dailySummary"
                      checked={notificationSettings.dailySummary}
                      onChange={handleNotificationChange}
                    />
                    <span className="toggle-switch"></span>
                    <div className="toggle-info">
                      <span className="toggle-title">Daily Summary</span>
                      <span className="toggle-desc">Receive daily sales summary</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <div className="settings-section">
              <h2>Security Settings</h2>
              <p className="section-description">
                Manage admin access and security preferences
              </p>

              <div className="security-card">
                <div className="security-icon">
                  <i className="fas fa-key"></i>
                </div>
                <div className="security-info">
                  <h4>Change Password</h4>
                  <p>Update your admin password regularly for security</p>
                </div>
                <button className="btn btn-secondary">Change</button>
              </div>

              <div className="security-card">
                <div className="security-icon">
                  <i className="fas fa-mobile-alt"></i>
                </div>
                <div className="security-info">
                  <h4>Two-Factor Authentication</h4>
                  <p>Add an extra layer of security to your account</p>
                </div>
                <button className="btn btn-secondary">Enable</button>
              </div>

              <div className="security-card">
                <div className="security-icon">
                  <i className="fas fa-users-cog"></i>
                </div>
                <div className="security-info">
                  <h4>Admin Users</h4>
                  <p>Manage team members who can access admin panel</p>
                </div>
                <button className="btn btn-secondary">Manage</button>
              </div>

              <div className="security-card">
                <div className="security-icon">
                  <i className="fas fa-history"></i>
                </div>
                <div className="security-info">
                  <h4>Activity Log</h4>
                  <p>View recent admin activity and login history</p>
                </div>
                <button className="btn btn-secondary">View Log</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
