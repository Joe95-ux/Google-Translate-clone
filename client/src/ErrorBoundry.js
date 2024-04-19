import React, { useEffect, useState } from "react";

const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);
  const [errorInfo, setErrorInfo] = useState(null);

  useEffect(() => {
    const componentDidCatch = (error, errorInfo) => {
      // Catch errors in any child components and update state
      setHasError(true);
      setError(error);
      setErrorInfo(errorInfo);
    };

    // Attach componentDidCatch function to global error handler
    window.addEventListener("error", componentDidCatch);

    // Cleanup function to remove the componentDidCatch function from global error handler
    return () => {
      window.removeEventListener("error", componentDidCatch);
    };
  }, []);

  if (hasError) {
    // Render fallback UI when an error occurs
    return (
      <div>
        <h1>Something went wrong.</h1>
        <p>{error && error.toString()}</p>
        <details style={{ whiteSpace: "pre-wrap" }}>
          {errorInfo && errorInfo.componentStack}
        </details>
      </div>
    );
  }

  // If no error, render children untouched
  return children;
};

export default ErrorBoundary;
