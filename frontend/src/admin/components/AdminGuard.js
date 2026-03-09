import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';

// Get admin emails from environment variable
const getAdminEmails = () => {
  const emails = process.env.REACT_APP_ADMIN_EMAILS || '';
  return emails.split(',').map(email => email.trim().toLowerCase()).filter(Boolean);
};

/**
 * AdminGuard - Protects admin routes by checking:
 * 1. If user is signed in (via Clerk)
 * 2. If user's email is in the admin allowlist
 * 
 * Non-admins are silently redirected to homepage - they won't even see a login page
 */
const AdminGuard = ({ children }) => {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  
  // Show loading while Clerk initializes
  if (!isLoaded) {
    return (
      <div className="admin-loader">
        <div className="loader-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  // Not signed in - redirect to login page
  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }
  
  // Get user's primary email
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
  const adminEmails = getAdminEmails();
  
  // Check if user is an admin
  const isAdmin = userEmail && adminEmails.includes(userEmail);
  
  if (!isAdmin) {
    // Not an admin - silently redirect to homepage
    console.log('Access denied: User is not an admin');
    return <Navigate to="/" replace />;
  }
  
  // User is admin - render the admin content
  return children;
};

export default AdminGuard;
