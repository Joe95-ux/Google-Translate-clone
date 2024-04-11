

const SelectDropdown = ({ type, selectedLanguage, setShowModal, inputOptions, outputOptions, setInputLanguage, setOutputLanguage }) => {

  const langOptions = type === "input" ? inputOptions : outputOptions;

  const handleLangSet = (lang)=>{
    if(type === "input"){
      setInputLanguage(lang);
    }else{
      setOutputLanguage(lang)
    }
  }
   

  return (
    <div className="select-drop-down"  style={{justifyContent:type === "output" ? "flex-end" : "flex-start"}}>
      {/* <input value={selectedLanguage} /> */}
      <div className="lang-nav">
        {langOptions?.map((lang, index) =>
         <span key={index} className={lang === selectedLanguage ? "lang-style lang-option" : "lang-option"} onClick={()=>handleLangSet(lang)}>{lang}</span>
        )}
      </div>
      <div className="down-arrow" onClick={()=> setShowModal(type)}>
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
