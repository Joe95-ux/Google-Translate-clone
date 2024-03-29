import React from "react";
import { useRef, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { useHistory } from "../hooks/useHistory";
import { toast } from 'sonner'

const History = ({ translations, setTranslations }) => {
  const historyModal = useHistory();
  const sidebarRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        historyModal.onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [historyModal.isOpen, historyModal.onClose, historyModal]);

  const styles = {
    active: {
      right: historyModal.isOpen ? "0" : "-400px",
    },
    close: {
      opacity: historyModal.isOpen ? "1" : "0",
      pointerEvents: historyModal.isOpen ? "auto" : "none",
      zIndex: historyModal.isOpen ? "1000" : "-1",
    },
    fix:{
        backgroundColor: historyModal.isOpen ? "rgb(17 24 39)" : "inherit"
    }
  };

  const handeleDelete = (index)=>{
    const updatedTranslations = [...translations];
    updatedTranslations.splice(index, 1);
    setTranslations(updatedTranslations);
    localStorage.setItem('translations', JSON.stringify(updatedTranslations));
    toast.success("One translation deleted");

  }
  const deleteAll = ()=>{
    localStorage.removeItem('translations');
    setTranslations("")
    toast.success("History cleared successfully!");
  }

  return (
    <div className="overlay-root">
      <div className="overlay" style={styles.close}></div>
      <div className="history-body" style={styles.active} ref={sidebarRef}>
        <div className="history-head-wrapper"  style={styles.fix}>
          <div className="history-head">
            <h3>History</h3>
            <IoMdClose
              size={22}
              className="close-history-btn"
              onClick={historyModal.onClose}
            />
          </div>
          {translations.length > 0 && (
            <div className="clear-history">
              <h3 onClick={deleteAll}>Clear History</h3>
            </div>
          )}
        </div>
        <div className="history-content">
          {translations.length > 0 ? (
            translations.map((translation, index) => (
              <div key={index} className="content-inner">
                <div className="content-head">
                  <div className="content-head-lang">
                    <span>{translation.from}</span>
                    <span>→</span>
                    <span>{translation.to}</span>
                  </div>
                  <IoMdClose className="close-history-btn"  onClick={()=>handeleDelete(index)}/>
                </div>
                <div className="languages">
                  <p className="lang-from">{translation.text}</p>
                  <p className="lang-to">{translation.translation}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="no-history">No History</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;