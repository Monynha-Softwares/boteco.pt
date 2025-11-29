import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useUserCompany } from '@/hooks/use-user-company';
import { hasClerkAuth } from '@/utils/clerk'; // Corrected import
import { Loader2 } from 'lucide-react';

interface AuthRedirectorProps {
  children: React.ReactNode;
}

const AuthRedirector: React.FC<AuthRedirectorProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSignedIn, isLoaded: isClerkLoaded } = useUser();
  const { data: userData, isLoading: isUserCompanyLoading, isFetched: isUserCompanyFetched } = useUserCompany();

  const isCompanyRegistrationPath = location.pathname === '/company-registration';

  useEffect(() => {
    if (!hasClerkAuth) {
      // If Clerk is not enabled, proceed without auth checks
      return;
    }

    if (!isClerkLoaded || !isUserCompanyFetched) {
      // Still loading auth or user company data
      return;
    }

    if (isSignedIn) {
      if (!userData?.userHasCompany && !isCompanyRegistrationPath) {
        // User is signed in but has no company, and is not on the registration page
        navigate('/company-registration');
      } else if (userData?.userHasCompany && isCompanyRegistrationPath) {
        // User is signed in and has a company, but is on the registration page
        navigate('/painel');
      }
    } else {
      // User is not signed in, redirect to login (Clerk's RedirectToSignIn handles this)
      // Or, if on a public route, allow access.
      // For now, we assume if Clerk is enabled, non-public routes require sign-in.
      // The /painel route is already handled by Clerk's <SignedIn>/<SignedOut>
      // For other routes, we let the app flow, but they will be redirected by Clerk if they try to access a protected route.
    }
  }, [
    isClerkLoaded,
    isSignedIn,
    userData,
    isUserCompanyLoading,
    isUserCompanyFetched,
    navigate,
    isCompanyRegistrationPath,
  ]);

  if (hasClerkAuth && (!isClerkLoaded || isUserCompanyLoading)) { // Corrected typo here
    // Show a loading spinner while auth and company data are being fetched
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-boteco-primary" />
          <p className="mt-2 text-sm text-boteco-neutral/80">Carregando autenticação...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthRedirector;