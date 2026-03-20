import { SignUp, useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";

const SignUpPage = () => {
  const { isLoaded, userId } = useAuth();

  if (isLoaded && userId) {
    return <Navigate to="/onboarding/organization" replace />;
  }

  return (
    <SignUp
      path="/sign-up"
      routing="path"
      afterSignUpUrl="/onboarding/organization"
      fallbackRedirectUrl="/onboarding/organization"
      signInUrl="/sign-in"
    />
  );
};

export default SignUpPage;