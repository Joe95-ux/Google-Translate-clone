import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import ErrorBoundary from "./ErrorBoundary";
import { ClerkProvider } from "@clerk/clerk-react";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import { AppThemeProvider, useAppTheme } from "./theme/AppThemeProvider";

const PUBLISHABLE_KEY = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

// Required for Clerk cookies to be sent to the Express backend across origins.
axios.defaults.withCredentials = true;

const root = ReactDOM.createRoot(document.getElementById("root"));

const ThemedClerkProvider = ({ children }) => {
  const { mode } = useAppTheme();

  const isDark = mode === "dark";

  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl="/"
      appearance={{
        variables: {
          colorPrimary: "#38BDF8",
          colorBackground: isDark ? "#0f172a" : "#ffffff",
          colorInputBackground: isDark ? "#020617" : "#f8fafc",
          colorInputText: isDark ? "#f8fafc" : "#0f172a",
          colorText: isDark ? "#f8fafc" : "#0f172a",
          colorNeutral: isDark ? "#94a3b8" : "#475569",
          colorTextSecondary: isDark ? "#94a3b8" : "#64748b",
          colorDanger: "#ef4444",
          borderRadius: "8px",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
};

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppThemeProvider>
        <BrowserRouter>
          <ThemedClerkProvider>
            <App />
          </ThemedClerkProvider>
        </BrowserRouter>
      </AppThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
