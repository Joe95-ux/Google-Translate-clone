import SelectDropdown from "./SelectDropdown";
import { FaRegCopy } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";
import { useState } from "react";
import { toast } from "sonner";

const TextBox = ({
  variant,
  setShowModal,
  selectedLanguage,
  setTextToTranslate,
  textToTranslate,
  translatedText,
  setTranslatedText,
}) => {
  const [showDelete, setShowDelete] = useState(false);
  const [showCopy, setShowCopy] = useState(false);

  const handleClick = () => {
    setTextToTranslate("");
    setTranslatedText("");
    setShowDelete(false);
    setShowCopy(false);
  };

  const handleChange = (e) => {
    if (e.target.className === "input") {
      setTextToTranslate(e.target.value);
      if (e.target.value.length > 0) {
        setShowDelete(true);
      } else {
        setShowDelete(false);
      }
    }else{
      if(e.target.value.length > 0 ){
        setShowCopy(true)
      }else{
        setShowCopy(false)
      }
    }
  };
  if(textToTranslate.length > 0){
    setShowDelete(true)
  }
  if(translatedText.length > 0){
    setShowCopy(true);
  }

  const handleCopy = () => {
    navigator.clipboard
      .writeText(translatedText)
      .then(() => {
        toast.success("translation copied to clipboard!");
      })
      .catch((err) => {
        toast.error("faild to copy translation");
      });
  };

  return (
    <div className={variant}>
      <SelectDropdown
        style={variant}
        setShowModal={setShowModal}
        selectedLanguage={selectedLanguage}
      />
      <div
        className="textarea-wrapper"
        style={{ display: variant === "input" ? "flex" : "block" }}
      >
        <textarea
          readOnly={variant === "output"}
          className={variant}
          placeholder={variant === "input" ? "Enter text" : "Translation"}
          onChange={handleChange}
          value={variant === "input" ? textToTranslate : translatedText}
          style={{ flex: variant === "input" && 1 }}
        />

        {variant === "input" && showDelete && (
          <div
            className="delete"
            onClick={handleClick}
            style={{ marginLeft: "4px", marginTop: "20px", cursor: "pointer" }}
          >
            <IoMdClose size={22} style={{ color: "rgb(203 213 225)" }} />
          </div>
        )}
        {variant === "output" && showCopy && (
          <div
            className="copy"
            onClick={handleCopy}
            style={{ cursor: "pointer" }}
            title="copy translation"
          >
            <FaRegCopy size={22} style={{ color: "rgb(203 213 225)" }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default TextBox;
