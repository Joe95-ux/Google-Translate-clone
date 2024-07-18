import { Link, Outlet, useNavigate } from "react-router-dom";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/clerk-react";
import { Toaster } from "sonner";
import Footer from "../../components/Footer";
import { FiLogIn } from "react-icons/fi";

const PUBLISHABLE_KEY = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

export default function RootLayout() {
  const navigate = useNavigate();
  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <ClerkProvider
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
      publishableKey={PUBLISHABLE_KEY}
    >
      <div className="wrapper">
        <Toaster />
        <div
          className="nav-wrapper"
          style={{
            marginBottom: "2.5rem",
          }}
        >
          <nav
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "1rem 0",
              borderBottom: "1px solid rgb(30 41 59)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
              }}
              onClick={handleLogoClick}
            >
              <img
                style={{ width: "40px", height: "40px", objectFit: "contain" }}
                src="/assets/logo.png"
                alt="Logo"
              />
              <h2
                style={{
                  color: "#F5F5F5",
                  fontWeight: "500px",
                  fontSize: "18px",
                  margin: "0 0 0 5px",
                }}
              >
                TranslateIt.io
              </h2>
            </div>
            <div className="nav-items">
              <div className="auth-btns">
                <SignedIn>
                  <UserButton afterSignOutUrl="/sign-in" />
                </SignedIn>
                <SignedOut>
                  <Link to="/sign-in">
                    <div
                      className="auth-btn top-btn"
                      style={{ border: "none" }}
                    >
                      <h3>Login</h3>
                    </div>
                  </Link>
                </SignedOut>
                <Link to="/sign-up">
                  <div className="auth-btn top-btn btn-right">
                    <h3>Sign Up</h3>
                  </div>
                </Link>
              </div>
            </div>
          </nav>
        </div>
        <main className="justify-center">
          <Outlet />
        </main>
        <Footer />
      </div>
    </ClerkProvider>
  );
}
