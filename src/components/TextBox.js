import SelectDropdown from "./SelectDropdown";

const TextBox = ({
  variant,
  setShowModal,
  selectedLanguage,
  setTextToTranslate,
  textToTranslate,
  translatedText,
  setTranslatedText,
}) => {
  const handleClick = () => {
    setTextToTranslate("");
    setTranslatedText("");
  };
  return (
    <div className={variant}>
      <SelectDropdown
        style={variant}
        setShowModal={setShowModal}
        selectedLanguage={selectedLanguage}
      />
      <textarea
        disabled={variant === "output"}
        className={variant}
        placeholder={variant === "input" ? "Enter text" : "Translation"}
        onChange={(e) => setTextToTranslate(e.target.value)}
        value={variant === "input" ? textToTranslate : translatedText}
      />
      {variant === "input" && (
        <div className="delete" onClick={handleClick}>
          ˟
        </div>
      )}
    </div>
  );
};

export default TextBox;
