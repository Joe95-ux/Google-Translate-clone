import React from "react";
import { FaHistory } from "react-icons/fa";
import { IoIosStar } from "react-icons/io";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useHistory } from "../hooks/useHistory";
import { useSaveModal } from "../hooks/useSaveModal";
import { SignedIn, SignedOut, useAuth } from "@clerk/clerk-react";
import AccountMenu from "./AccountMenu";

const Header = ({ activeType, setActiveType }) => {
  const historyModal = useHistory();
  const saveModal = useSaveModal();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectUrl = `${location.pathname}${location.search}${location.hash}`;

  const activeStyles = {
    active: {
      color: historyModal.isOpen && "#38BDF8",
    },
    activeSaved: {
      color: saveModal.isOpen && "#38BDF8",
    },
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  const {isLoaded, userId} = useAuth();
  return (
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
          borderBottom: "1px solid var(--border-color)",
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
              color: "var(--text-primary)",
              fontWeight: 600,
              fontSize: "18px",
              margin: "0 0 0 5px",
            }}
          >
            TranslateIt.io
          </h2>
        </div>
        <div className="nav-items">
          <div className="nav-actions" style={{ display: "none" }}>
            <div
              className="open-history-inner top-btn"
              style={activeStyles.active}
              onClick={historyModal.onOpen}
            >
              <FaHistory />
              <h3>History</h3>
            </div>

            <div
              className="saved top-btn"
              style={activeStyles.activeSaved}
              onClick={saveModal.onOpen}
            >
              <IoIosStar />
              <h3>Saved</h3>
            </div>
          </div>

          <div className="auth-btns">
            <SignedIn>
              <AccountMenu />
            </SignedIn>
            <SignedOut>
              <Link to={`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`}>
                <div className="auth-btn top-btn" style={{ border: "none" }}>
                  <h3>Login</h3>
                </div>
              </Link>
            </SignedOut>
            {isLoaded && !userId && (
              <Link to="/sign-up">
                <div className="auth-btn top-btn btn-right">
                  <h3>Sign Up</h3>
                </div>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Header;
