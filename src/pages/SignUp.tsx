import React from 'react';
import { SignUp } from '@clerk/clerk-react';

const SignUpPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <SignUp 
        routing="path" 
        path="/sign-up"
        signInUrl="/sign-in"
        afterSignUpUrl="/painel"
      />
    </div>
  );
};

export default SignUpPage;
