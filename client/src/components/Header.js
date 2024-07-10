import React from "react";
import { FaHistory } from "react-icons/fa";
import { IoIosStar } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import { MdOutlineTranslate } from "react-icons/md";
import { IoDocumentTextOutline } from "react-icons/io5";
import { useHistory } from "../hooks/useHistory";
import { useSaveModal } from "../hooks/useSaveModal";
import {
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/clerk-react";
import { FiLogIn } from "react-icons/fi";

const Header = ({ activeType, setActiveType }) => {
  const historyModal = useHistory();
  const saveModal = useSaveModal();
  const navigate = useNavigate();

  const activeStyles = {
    active: {
      color: historyModal.isOpen && "#38BDF8",
    },
    activeSaved: {
      color: saveModal.isOpen && "#38BDF8",
    },
  };

  const handleType = (text) => {
    setActiveType(text);
  };
  const handleLogoClick = () => {
    navigate("/");
  };
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
              <UserButton afterSignOutUrl="/sign-in" />
            </SignedIn>
            <SignedOut>
              <Link to="/sign-in">
                <div
                  className="auth-btn top-btn"
                >
                  <FiLogIn />
                  <h3>Login</h3>
                </div>
              </Link>
            </SignedOut>
          </div>
        </div>
      </nav>
      <div className="types">
        <div
          className="open-history-inner top-btn"
          style={{ color: activeType === "Text" ? "#38BDF8" : "#f5f5f5" }}
        >
          <MdOutlineTranslate size={22} />
          <h3 className="textt" onClick={() => handleType("Text")}>
            Text
          </h3>
        </div>
        <div
          className="saved top-btn"
          style={{ color: activeType === "Documents" ? "#38BDF8" : "#f5f5f5" }}
        >
          <IoDocumentTextOutline size={22} />
          <h3 className="docs" onClick={() => handleType("Documents")}>
            Documents
          </h3>
        </div>
      </div>
    </div>
  );
};

export default Header;
