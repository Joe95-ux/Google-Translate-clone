import { useEffect, useState } from "react";

const SelectDropdown = ({
  type,
  selectedLanguage,
  setShowModal,
  inputOptions,
  outputOptions,
  setInputLanguage,
  setOutputLanguage,
  inputLanguage,
  outputLanguage,
  setOutputOptions,
  setInputOptions,
  textToTranslate,
  translate,
  translateRef,
  tab
}) => {
  let langOptions = type === "input" ? inputOptions : outputOptions;
  let chosenLangIndex = langOptions.findIndex(
    (lang) => lang === selectedLanguage
  );
  let singleLang = langOptions[chosenLangIndex];

  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleLangSet = (lang) => {
    if (type === "input") {
      setInputLanguage(lang);
      if (lang === outputLanguage) {
        const newOutputLang = outputOptions.find(lange => lange !== lang);
        setOutputLanguage(newOutputLang);
        setOutputOptions(prevLangs => {
          if (!prevLangs.includes(newOutputLang)) {
            return [...prevLangs.slice(0, -1), newOutputLang];
          }
          return prevLangs;
        });
      }

      if(!lang.includes("Detected")){
        setInputOptions(prevLangs => {
          const updatedOptions = prevLangs.map(language => {
            if(language.includes("Detected")){
              return "Detect language";
            }else{
              return language
            }
          })

          return updatedOptions;
          
        })

      }
      
    } else if (type === "output") {
      setOutputLanguage(lang);
      translateRef.current = true;
      if (lang === inputLanguage) {
        const newInputLang = inputOptions.find(lange => lange !== lang && lange !== "Detect language");
        setInputLanguage(newInputLang);
        setInputOptions(prevLangs => {
          if (!prevLangs.includes(newInputLang)) {
            return [...prevLangs.slice(0, -1), newInputLang];
          }
          return prevLangs;
        });
      }
      
    }
  };

  useEffect(() => {
    if (translateRef.current && textToTranslate !== "" && tab === "Text") {
      translate();
      translateRef.current = false; // Reset flag
    }
  }, [outputLanguage, tab, textToTranslate, translate, translateRef]);
  

  return (
    <div
      className="select-drop-down"
      style={{ justifyContent: type === "output" ? "flex-end" : "flex-start" }}
    >
      {/* <input value={selectedLanguage} /> */}
      <div className="lang-nav">
        {screenWidth < 765 ? (
          <span
            className={
              singleLang === selectedLanguage
                ? "lang-style lang-option"
                : "lang-option"
            }
          >
            {singleLang}
          </span>
        ) : (
          langOptions?.map((lang, index) => (
            <span
              key={index}
              className={
                lang === selectedLanguage
                  ? "lang-style lang-option"
                  : "lang-option"
              }
              onClick={() => handleLangSet(lang)}
            >
              {lang.includes("Detected") && !lang.includes(selectedLanguage) ? "Detect language" : lang }
            </span>
          ))
        )}
      </div>
      <div className="down-arrow" onClick={() => setShowModal(type)}>
        <svg
          focusable="false"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path d="M7 10l5 5 5-5z"></path>
        </svg>
      </div>
    </div>
  );
};

export default SelectDropdown;
