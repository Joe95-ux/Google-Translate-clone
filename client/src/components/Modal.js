import {useState} from "react";
import { IoMdClose } from "react-icons/io";
import { IoSearch } from "react-icons/io5";

const Modal = ({
  showModal,
  setShowModal,
  languages,
  chosenLanguage,
  setChosenLanguage,
  setOtherLangs,
  otherInputLangs,
  otherOutputLangs,
  setInputLanguage,
  setOutputLanguage,
  setOtherOutputLangs,
  setOtherInputLangs,
  inputLanguage,
  outputLanguage
}) => {
  const [searchedLanguage, setSearchedLanguage] = useState("");

  const filteredLanguages = languages?.filter((language) =>
    language.toLowerCase().startsWith(searchedLanguage.toLowerCase())
  );

  const handleSelect = (e, language) => {
    e.stopPropagation(); // Stop event propagation to prevent triggering parent elements' click handlers
    setChosenLanguage(language);

    if(showModal === "input"){
      if(language === outputLanguage){
        const newOutputLang = otherOutputLangs.find(lange => lange !== language);
        setOutputLanguage(newOutputLang);
        setOtherOutputLangs(prevLangs => {
          if (!prevLangs.includes(newOutputLang)) {
            return [...prevLangs.slice(0, -1), newOutputLang];
          }
          return prevLangs;
        });
      }

    }else{
      if(language === inputLanguage){
        const newInputLang = otherInputLangs.find(lange => lange !== language && lange !== "Detect language");
        setInputLanguage(newInputLang);
        setOtherInputLangs(prevLangs => {
          if (!prevLangs.includes(newInputLang)) {
            return [...prevLangs.slice(0, -1), newInputLang];
          }
          return prevLangs;
        });
      }
    }
    
    setOtherLangs(prevLangs => {
      let langs = [...prevLangs];
      if (language !== "Detect language" && !langs.includes(language)) {
        langs.splice(langs.length - 1, 1, language);
      }
  
      return langs;
    });

    setShowModal(false);
  };

  const handleChange = (e) => {
    setSearchedLanguage(e.target.value);
    setChosenLanguage(e.target.value);
  };


  return (
    <div className="option-list">
      <div className="search-bar">
        <input value={chosenLanguage} onChange={handleChange} />
        <div className="close-button" >
          <IoSearch size={22} style={{marginRight:"20px"}}/>
          <IoMdClose size={22} onClick={() => setShowModal(null)} style={{cursor:"pointer"}}/>
        </div>
      </div>
      <div className="option-container">
        <ul>
          {filteredLanguages?.map((filteredLanguage, index) => (
            <div className="list-item" key={index} >
              <div className="icon">
                {chosenLanguage === filteredLanguage ? "✓" : ""}
              </div>
              <li onClick={(e) => handleSelect(e, filteredLanguage)}
                style={{
                  color: chosenLanguage === filteredLanguage ? "#8ab4f8" : null,
                }}
              >
                {filteredLanguage}
              </li>
            </div>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Modal;
