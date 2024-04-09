import  React, {useEffect, useRef} from "react";
import { PiCopySimple } from "react-icons/pi";
import { IoMdClose } from "react-icons/io";
import { toast } from "sonner";


const TextBox = ({
  variant,
  setShowModal,
  selectedLanguage,
  setTextToTranslate,
  textToTranslate,
  translatedText,
  setTranslatedText,
  showDelete, 
  setShowDelete,
  showCopy, 
  setShowCopy
}) => {
  const inputBoxRef = useRef(null);
  const outputBoxRef = useRef(null);


  const handleChange = (e) => {
    if (e.target.className === "input") {
      setTextToTranslate(e.target.value);
      if (e.target.value.length > 0) {
        setShowDelete(true);
      } else {
        setShowDelete(false);
        setShowCopy(false);
        setTranslatedText("");
      }
    }else{
      if(e.target.value.length > 0 ){
        setShowCopy(true)
      }else{
        setShowCopy(false)
      }
    }
  };
  
  const adjustTextareaHeight = (textarea)=>{
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }

  useEffect(()=>{
    if(variant === "input"){
      adjustTextareaHeight(inputBoxRef.current);
    }else{
      adjustTextareaHeight(outputBoxRef.current);
    }
   

  }, [textToTranslate, translatedText, variant])

  const handleClick = () => {
    setTextToTranslate("");
    setTranslatedText("");
    setShowDelete(false);
    setShowCopy(false);
    adjustTextareaHeight();
  };


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
    <div className={variant} style={{borderRight: variant === "input" && "1px solid rgb(100 116 139)", padding:"1rem"}}>
      <div
        className="textarea-wrapper"
        style={{flexDirection: variant === "input" ? "row" : "column" }}
      >
        <textarea
          ref={variant === "input" ? inputBoxRef : outputBoxRef}
          readOnly={variant === "output"}
          className={variant}
          placeholder={variant === "input" ? "Enter text" : "Translation"}
          onChange={handleChange}
          value={variant === "input" ? textToTranslate : translatedText}
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
            className="textarea-actions"
            onClick={handleCopy}
            style={{ cursor: "pointer" }}
            title="copy translation"
          >
            <PiCopySimple size={22} style={{ color: "rgb(203 213 225)" }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default TextBox;
