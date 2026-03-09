import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignIn, useAuth, useUser, useClerk } from '@clerk/clerk-react';
import './AdminSignIn.css';

// Get admin emails from environment variable
const getAdminEmails = () => {
  const emails = process.env.REACT_APP_ADMIN_EMAILS || '';
  return emails.split(',').map(email => email.trim().toLowerCase()).filter(Boolean);
};

const AdminLogin = () => {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();

  useEffect(() => {
    // Only check after Clerk is loaded and user is signed in
    if (!isLoaded || !isSignedIn || !user) return;

    const userEmail = user.primaryEmailAddress?.emailAddress?.toLowerCase();
    const adminEmails = getAdminEmails();
    const isAdmin = userEmail && adminEmails.includes(userEmail);

    if (isAdmin) {
      // Admin verified - redirect to admin dashboard
      navigate('/admin/dashboard', { replace: true });
    } else {
      // Not an admin - sign out and redirect to homepage
      console.log('Access denied: Email not in admin list');
      signOut().then(() => {
        navigate('/', { replace: true });
      });
    }
  }, [isLoaded, isSignedIn, user, navigate, signOut]);

  // If already signed in, show loading while we verify
  if (isLoaded && isSignedIn) {
    return (
      <div className="admin-signin-page">
        <div className="admin-signin-container">
          <div className="admin-signin-header">
            <h1>Verifying Access</h1>
            <p>Please wait...</p>
          </div>
          <div className="admin-loader" style={{ padding: '2rem' }}>
            <div className="loader-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-signin-page">
      <div className="admin-signin-container">
        <div className="admin-signin-header">
          <h1>Admin Portal</h1>
          <p>Sign in with your admin account</p>
        </div>
        <div className="clerk-signin-wrapper">
          <SignIn 
            routing="path" 
            path="/admin/login"
            signUpUrl={null}
            afterSignInUrl="/admin/login"
            appearance={{
              elements: {
                rootBox: "clerk-root-box",
                card: "clerk-card",
                headerTitle: "clerk-header-title",
                headerSubtitle: "clerk-header-subtitle",
                formButtonPrimary: "clerk-button-primary",
                formFieldInput: "clerk-input",
                footerAction: "clerk-footer-hidden",
                socialButtonsBlockButton: "clerk-social-btn"
              },
              variables: {
                colorPrimary: "#832729",
                colorTextOnPrimaryBackground: "#ffffff",
                borderRadius: "8px"
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
