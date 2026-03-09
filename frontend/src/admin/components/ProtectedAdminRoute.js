import React from 'react';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';

/**
 * Wrapper component that protects admin routes
 * Redirects unauthenticated users to the admin sign-in page
 */
const ProtectedAdminRoute = ({ children }) => {
  return (
    <>
      <SignedIn>
        {children}
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn redirectUrl="/admin/sign-in" />
      </SignedOut>
    </>
  );
};

export default ProtectedAdminRoute;
