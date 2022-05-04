import SelectDropdown from "./SelectDropdown";
import { useState } from "react";

const TextBox = ({
  variant,
  setShowModal,
  selectedLanguage,
  setTextToTranslate,
  textToTranslate,
  translatedText,
  setTranslatedText
}) => {
  const [showDelete, setShowDelete] = useState(false);

  const handleClick = () => {
    setTextToTranslate("");
    setTranslatedText("");
  };

  const handleChange = e => {
    setTextToTranslate(e.target.value);
    if (e.target.textContent.length > 1) {
      setShowDelete(true);
    } else {
      setShowDelete(false);
    }
  };

  return (
    <div className={variant}>
      <SelectDropdown
        style={variant}
        setShowModal={setShowModal}
        selectedLanguage={selectedLanguage}
      />
      <div className="textarea-wrapper">
        <textarea
          disabled={variant === "output"}
          className={variant}
          placeholder={variant === "input" ? "Enter text" : "Translation"}
          onChange={handleChange}
          value={variant === "input" ? textToTranslate : translatedText}
        />

        {variant === "input" &&
          showDelete &&
          <div className="delete" onClick={handleClick}>
            ˟
          </div>}
      </div>
    </div>
  );
};

export default TextBox;
