import React from 'react';
import { SignIn } from '@clerk/clerk-react';

const SignInPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <SignIn 
        routing="path" 
        path="/sign-in"
        signUpUrl="/sign-up"
        afterSignInUrl="/painel"
      />
    </div>
  );
};

export default SignInPage;
