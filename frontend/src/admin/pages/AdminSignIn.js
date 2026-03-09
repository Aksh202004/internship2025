import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import './AdminSignIn.css';

const AdminSignIn = () => {
  return (
    <div className="admin-signin-page">
      <div className="admin-signin-container">
        <div className="admin-signin-header">
          <h1>Admin Portal</h1>
          <p>Sign in to access the dashboard</p>
        </div>
        <div className="clerk-signin-wrapper">
          <SignIn 
            routing="path" 
            path="/admin/sign-in"
            signUpUrl={null}
            afterSignInUrl="/admin/dashboard"
            appearance={{
              elements: {
                rootBox: "clerk-root-box",
                card: "clerk-card",
                headerTitle: "clerk-header-title",
                headerSubtitle: "clerk-header-subtitle",
                formButtonPrimary: "clerk-button-primary",
                formFieldInput: "clerk-input",
                footerAction: "clerk-footer-hidden"
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

export default AdminSignIn;
