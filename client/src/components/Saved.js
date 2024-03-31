import React from "react";
import { useRef, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { IoIosStarOutline } from "react-icons/io";
import { IoIosStar } from "react-icons/io";
import { useSaveModal } from "../hooks/useSaveModal";
import { toast } from 'sonner'

const Saved = ({ translations, setTranslations, handleHistory, savedTranslations, setSavedTranslations }) => {
  const saveModal = useSaveModal();
  const sidebarRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        saveModal.onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [saveModal.isOpen, saveModal.onClose, saveModal]);

  const styles = {
    active: {
      right: saveModal.isOpen ? "0" : "-400px",
    },
    close: {
      opacity: saveModal.isOpen ? "1" : "0",
      pointerEvents: saveModal.isOpen ? "auto" : "none",
      zIndex: saveModal.isOpen ? "1000" : "-1",
    },
    fix:{
        backgroundColor: saveModal.isOpen ? "rgb(17 24 39)" : "inherit"
    }
  };


  const handleDelete = (index) => {
    let updatedSavedTranslations = [...savedTranslations];
    const translationToDelete = updatedSavedTranslations[index];
    const translationHistory = [...translations];
    let translationToMutate = translationHistory.find((trans) => trans.timestamp === translationToDelete.timestamp);
    translationToMutate.saved = false;

    updatedSavedTranslations.splice(index, 1);
  
    setTranslations(translationHistory);
    setSavedTranslations(updatedSavedTranslations);
  
    localStorage.setItem('translations', JSON.stringify(translationHistory));
    localStorage.setItem('savedTranslations', JSON.stringify(updatedSavedTranslations));
    toast.success("Translation unsaved successfully!");
  };

  const deleteAll = ()=>{
    let translationsHistory = [...translations];
    localStorage.removeItem('savedTranslations');
    setSavedTranslations("");
    toast.success("Saved translations deleted successfully!");
    if(translationsHistory.length > 0){
        translationsHistory = translationsHistory.map(translation => {
            if (translation.saved === true) {
              return { ...translation, saved: false };
            } else {
              return translation;
            }
          });
        setTranslations(translationsHistory);
        localStorage.setItem('translations', JSON.stringify(translationsHistory));
    }
  }

  return (
    <div className="overlay-root">
      <div className="overlay" style={styles.close}></div>
      <div className="history-body" style={styles.active} ref={sidebarRef}>
        <div className="history-head-wrapper"  style={styles.fix}>
          <div className="history-head">
            <h3>Saved Translations</h3>
            <IoMdClose
              size={22}
              className="close-history-btn"
              onClick={saveModal.onClose}
            />
          </div>
          {savedTranslations.length > 0 && (
            <div className="clear-history">
              <h3 onClick={deleteAll}>Delete All</h3>
            </div>
          )}
        </div>
        <div className="history-content">
          {savedTranslations.length > 0 ? (
            savedTranslations.map((translation, index) => (
              <div key={index} className="content-inner">
                <div className="content-head">
                  <div className="content-head-lang">
                    <span>{translation.from}</span>
                    <span>→</span>
                    <span>{translation.to}</span>
                  </div>
                  <div className="history-actions">
                    <div style={{ cursor:"pointer", transition: "all 0.5s ease"}} onClick={()=>handleDelete(index)}>
                      {translation.saved ? <IoIosStar style={{fill: "#ca8a04"}}/> : <IoIosStarOutline/>}
                    </div>
                  </div>
                </div>
                <div className="languages" onClick={()=>handleHistory(translation.from, translation.to, translation.text, translation.translation)}>
                  <p className="lang-from">{translation.text}</p>
                  <p className="lang-to">{translation.translation}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="no-history">No Saved Translation</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Saved;
