import React, { useEffect, useRef, useState } from "react";
import { PiCopySimple } from "react-icons/pi";
import { IoMdClose } from "react-icons/io";
import { BsTranslate } from "react-icons/bs";
import { HiOutlineSpeakerWave } from "react-icons/hi2";
import { HiOutlineMicrophone } from "react-icons/hi2";
import { MdOutlineShare } from "react-icons/md";
import { toast } from "sonner";

const TextBox = ({
  variant,
  setShowModal,
  onTranslate,
  selectedLanguage,
  setTextToTranslate,
  textToTranslate,
  translatedText,
  setTranslatedText,
  showDelete,
  setShowDelete,
  showCopy,
  setShowCopy,
}) => {
  const inputBoxRef = useRef(null);
  const outputBoxRef = useRef(null);
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
    } else {
      if (e.target.value.length > 0) {
        setShowCopy(true);
      } else {
        setShowCopy(false);
      }
    }
  };

  const adjustTextareaHeight = (textarea) => {
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (variant === "input") {
      adjustTextareaHeight(inputBoxRef.current);
    } else {
      adjustTextareaHeight(outputBoxRef.current);
    }
  }, [textToTranslate, translatedText, variant]);

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
    <div
      className={variant}
      style={{
        borderRight:
          variant === "input" &&
          screenWidth > 600 &&
          "1px solid rgb(100 116 139)",
        order: variant === "output" && screenWidth < 601 && "2",
        padding: "1rem",
      }}
    >
      <div className="textarea-wrapper">
        <div className="textarea-inner">
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
              style={{
                marginLeft: "4px",
                marginTop: "20px",
                cursor: "pointer",
              }}
            >
              <IoMdClose size={22} style={{ color: "rgb(203 213 225)" }} />
            </div>
          )}
        </div>
        {variant === "input" && textToTranslate.length > 0 && (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                margin: "1rem 0 0",
              }}
            >
              {!selectedLanguage.includes("language") && (
                <>
                  <BsTranslate
                    size={22}
                    style={{ color: "rgb(68, 138, 251)" }}
                  />
                  <span
                    style={{
                      fontSize: "14px",
                      marginLeft: "10px",
                      color: "#f5f5f5",
                    }}
                  >
                    Translate from:{" "}
                    <span
                      onClick={onTranslate}
                      style={{ color: "rgb(68, 138, 251)", cursor: "pointer" }}
                    >
                      {selectedLanguage.includes("Detected") ? selectedLanguage.split(" - ")[0] : selectedLanguage}
                    </span>
                  </span>
                </>
              )}
            </div>
            <div className="textarea-actions">
              <div className="left-actions">
                <HiOutlineMicrophone
                  size={22}
                  style={{ color: "rgb(203 213 225)", cursor: "pointer" }}
                />
                <HiOutlineSpeakerWave
                  size={22}
                  style={{
                    color: "rgb(203 213 225)",
                    cursor: "pointer",
                    marginLeft: "12px",
                  }}
                />
              </div>
              <div className="right-actions">
                <span style={{ fontSize: "14px" }}>
                  {textToTranslate?.length} / 5,000
                </span>
              </div>
            </div>
          </div>
        )}

        {variant === "output" && showCopy && (
          <div className="textarea-actions">
            <div className="left-actions">
              <HiOutlineSpeakerWave
                size={22}
                style={{ color: "rgb(203 213 225)", cursor: "pointer" }}
              />
            </div>
            <div className="right-actions">
              <div title="copy translation" style={{ display: "flex" }}>
                <PiCopySimple
                  size={22}
                  style={{
                    color: "rgb(203 213 225)",
                    transform: "rotate(180deg)",
                    cursor: "pointer",
                  }}
                  onClick={handleCopy}
                />
              </div>
              <MdOutlineShare
                size={22}
                style={{
                  marginLeft: "12px",
                  color: "rgb(203 213 225)",
                  cursor: "pointer",
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextBox;
