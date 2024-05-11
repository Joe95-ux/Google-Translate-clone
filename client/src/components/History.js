import React from "react";
import { useRef, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { IoIosStarOutline } from "react-icons/io";
import { IoIosStar } from "react-icons/io";
import { useHistory } from "../hooks/useHistory";
import { toast } from 'sonner'

const History = ({ translations, setTranslations, handleHistory, savedTranslations, setSavedTranslations }) => {
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
      right: historyModal.isOpen ? "0" : "-420px",
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

  const handleDelete = (index)=>{
    const updatedTranslations = [...translations];
    updatedTranslations.splice(index, 1);
    setTranslations(updatedTranslations);
    localStorage.setItem('translations', JSON.stringify(updatedTranslations));
    toast.success("One translation deleted");

  }

  const handleSave = (index) => {
    const translationToToggle = translations[index];
    const isSaved = !translationToToggle.saved;
    translationToToggle.saved = isSaved;
  
    let updatedSavedTranslations = [...savedTranslations];
  
    if (isSaved) {
      updatedSavedTranslations.unshift(translationToToggle);
      toast.success("Translation saved!");
    } else {
      updatedSavedTranslations = updatedSavedTranslations.filter((trans) => trans !== translationToToggle);
      toast.info("Translation unsaved.");
    }
  
    setTranslations(translations);
    setSavedTranslations(updatedSavedTranslations);
  
    localStorage.setItem('translations', JSON.stringify(translations));
    localStorage.setItem('savedTranslations', JSON.stringify(updatedSavedTranslations));
  };

  const deleteAll = ()=>{
    localStorage.removeItem('translations');
    setTranslations("");
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
                  <div className="history-actions">
                    <div title={translation.saved ? "remove from save" : "save translation"} style={{ cursor:"pointer", transition: "all 0.5s ease"}} onClick={()=>handleSave(index)}>
                      {translation.saved ? <IoIosStar style={{fill: "#ca8a04"}}/> : <IoIosStarOutline/>}
                    </div>
                    <div title="remove from history">
                      <IoMdClose className="close-history-btn"  onClick={()=>handleDelete(index)}/>
                    </div>
                  </div>
                </div>
                <div className="languages" onClick={()=>handleHistory(translation.from, translation.to, translation.text, translation.translation, translation.timestamp)}>
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
