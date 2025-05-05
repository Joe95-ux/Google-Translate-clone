import { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
import LanguageLoader from "./LanguageLoader";

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
  outputLanguage,
  translateRef,
  translate,
  tab
}) => {
  const [searchedLanguage, setSearchedLanguage] = useState("");
  chosenLanguage = chosenLanguage.includes("Detected")
    ? chosenLanguage.split(" - ")[0]
    : chosenLanguage;

  const filteredLanguages = languages?.filter((language) =>
    language.toLowerCase().startsWith(searchedLanguage.toLowerCase())
  );

  const handleSelect = (e, language) => {
    e.stopPropagation(); // Stop event propagation to prevent triggering parent elements' click handlers
    setChosenLanguage(language);

    if (showModal === "input") {
      if (language === outputLanguage) {
        const newOutputLang = otherOutputLangs.find(
          (lange) => lange !== language
        );
        setOutputLanguage(newOutputLang);
        setOtherOutputLangs((prevLangs) => {
          if (!prevLangs.includes(newOutputLang)) {
            return prevLangs.map((lang, index) => 
              index === 1 ? newOutputLang : lang
            );
          }
          return prevLangs;
        });
      }
      // remove any Detected suffix if any from inputlanguageoptions
      setOtherInputLangs((prevLangs) => {
        const updatedOptions = prevLangs.map((language) => {
          if (language.includes("Detected")) {
            return "Detect language";
          } else {
            return language;
          }
        });

        return updatedOptions;
      });
    } else {
      if (language === inputLanguage) {
        const newInputLang = otherInputLangs.find(
          (lange) => lange !== language && lange !== "Detect language"
        );
        setInputLanguage(newInputLang);
        setOtherInputLangs((prevLangs) => {
          if (!prevLangs.includes(newInputLang)) {
            return prevLangs.map((lang, index) => 
              index === 1 ? newInputLang : lang
            );
          }
          return prevLangs;
        });
      }
      translateRef.current = true;
    }

    setOtherLangs((prevLangs) => {
      let langs = [...prevLangs];
      if (language !== "Detect language" && !langs.includes(language)) {
        // Replace second element if it exists
        if (langs.length > 1) {
          langs[1] = language;
        } else {
          langs.push(language); // Fallback if the array is too short
        }
      }
      return langs;
    });

    setShowModal(false);
  };

  useEffect(() => {
    if (translateRef.current  && tab === "Text") {
      translate();
      translateRef.current = false; // Reset flag
    }
  }, [outputLanguage, tab, translate, translateRef]);

  const handleChange = (e) => {
    e.stopPropagation();
    setSearchedLanguage(e.target.value);
  };

  return (
    <div className="option-list">
      <div className="search-bar">
        <input value={searchedLanguage} onChange={handleChange} />
        <div className="close-button">
          <IoSearch size={22} style={{ marginRight: "20px" }} />
          <IoMdClose
            size={22}
            onClick={() => setShowModal(null)}
            style={{ cursor: "pointer" }}
          />
        </div>
      </div>
      <div className="option-container">
        {languages.length > 0 ? (
          <ul>
            {filteredLanguages?.map((filteredLanguage, index) => (
              <div className="list-item" key={index}>
                <div className="icon">
                  {chosenLanguage === filteredLanguage ? "✓" : ""}
                </div>
                <li
                  onClick={(e) => handleSelect(e, filteredLanguage)}
                  style={{
                    color:
                      chosenLanguage === filteredLanguage ? "#8ab4f8" : null,
                  }}
                >
                  {filteredLanguage}
                </li>
              </div>
            ))}
          </ul>
        ) : (
          <LanguageLoader />
        )}
      </div>
    </div>
  );
};

export default Modal;
