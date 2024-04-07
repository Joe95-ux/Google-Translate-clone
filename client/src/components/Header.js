import React from "react";
import { FaHistory } from "react-icons/fa";
import { IoIosStar } from "react-icons/io";
import { useHistory } from "./hooks/useHistory";
import { useSaveModal } from "./hooks/useSaveModal";


const Header = () => {
  const historyModal = useHistory();
  const saveModal = useSaveModal();

  const activeStyles = {
    active:{
      color: historyModal.isOpen && "#38BDF8"
    },
    activeSaved:{
      color: saveModal.isOpen && "#38BDF8" 
    }
  
  }
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "1rem 0",
        marginBottom: "2.5rem",
        borderBottom: "1px solid rgb(30 41 59)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
        }}
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
      <div className="nav-ietms">
        <div
          className="open-history-inner. top-btn"
          style={activeStyles.active}
          onClick={historyModal.onOpen}
        >
          <FaHistory />
          <h3>History</h3>
        </div>

        <div
          className="saved, top-btn"
          style={activeStyles.activeSaved}
          onClick={saveModal.onOpen}
        >
          <IoIosStar />
          <h3>Saved</h3>
        </div>
      </div>
    </nav>
  );
};

export default Header;
