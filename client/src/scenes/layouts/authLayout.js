import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "sonner";
import Footer from "../../components/Footer";


export default function AuthLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const isOnboardingRoute = location.pathname.startsWith("/onboarding/");
  const handleLogoClick = ()=>{
    navigate("/");
  }

  return (
    <div className="wrapper">
        <Toaster richColors closeButton position="top-right" />
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
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                cursor:"pointer"
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
                  color: "var(--text-primary)",
                  fontWeight: 600,
                  fontSize: "18px",
                  margin: "0 0 0 5px",
                }}
              >
                TranslateIt.io
              </h2>
            </div>
          </nav>
        </div>
        <main className={isOnboardingRoute ? "auth-main" : "justify-center"}>
          <Outlet />
        </main>
        <Footer />
      </div>
  );
}
