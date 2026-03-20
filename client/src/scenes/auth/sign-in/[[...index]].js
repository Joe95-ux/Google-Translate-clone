import { SignIn, useAuth } from "@clerk/clerk-react";
import { Navigate, useLocation } from "react-router-dom";

const SignInPage = () => {
  const { isLoaded, userId } = useAuth();
  const location = useLocation();
  const redirectParam = new URLSearchParams(location.search).get("redirect_url");
  const safeRedirect = redirectParam?.startsWith("/") ? redirectParam : "/";

  if (isLoaded && userId) {
    return <Navigate to={safeRedirect} replace />;
  }

  return (
    <SignIn
      path="/sign-in"
      routing="path"
      fallbackRedirectUrl="/"
      signUpUrl="/sign-up"
    />
  );
};

export default SignInPage;