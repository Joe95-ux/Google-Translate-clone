import "regenerator-runtime";
import React, { useEffect, useRef, useState } from "react";
import { PiCopySimple } from "react-icons/pi";
import { IoMdClose } from "react-icons/io";
import { BsTranslate } from "react-icons/bs";
import { HiOutlineSpeakerWave } from "react-icons/hi2";
import { HiOutlineMicrophone } from "react-icons/hi2";
import { FaRegCircleStop } from "react-icons/fa6";
import { MdOutlineShare } from "react-icons/md";
import { motion } from "framer-motion";
import { toast } from "sonner";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

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
  detectLanguage,
}) => {
  const inputBoxRef = useRef(null);
  const outputBoxRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const {
    listening,
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    // Update animation state based on speech recognition state
    setIsAnimating(listening);
  }, [listening]);

  const inputPlaceholder = listening ? "Speak Now" : "Enter Text to translate";
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
    if (transcript) {
      resetTranscript();
    }
  };

  useEffect(() => {
    setTextToTranslate(transcript);
  }, [setTextToTranslate, transcript]);

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

  const handleSpeechRecognition = () => {
    if (!browserSupportsSpeechRecognition) {
      toast.error("your browser does not support speech recognition");
    } else {
      SpeechRecognition.startListening({ continuous: true });
    }
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
            placeholder={variant === "input" ? inputPlaceholder : "Translation"}
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
        {variant === "input" && (
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
                  <BsTranslate size={22} style={{ color: "#38BDF8" }} />
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
                      style={{ color: "#38BDF8", cursor: "pointer" }}
                    >
                      {detectLanguage}
                    </span>
                  </span>
                </>
              )}
            </div>
            <div className="textarea-actions">
              <div className="left-actions">
                {listening ? (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    animate={{ rotate: isAnimating ? [0, -5, 5, -5, 0] : 0 }}
                    transition={{ duration: 0.5 }}
                    style={{
                      originX: 0.5,
                      originY: 0.5,
                      display: "inline-block",
                    }}
                  >
                    <FaRegCircleStop
                      size={22}
                      style={{
                        color: "#38BDF8",
                        cursor: "pointer",
                      }}
                      onClick={SpeechRecognition.stopListening}
                    />
                  </motion.button>
                ) : (
                  <HiOutlineMicrophone
                    size={22}
                    style={{
                      color: listening
                        ? "rgb(203 213 225)"
                        : "rgb(148 163 184)",
                      cursor: "pointer",
                    }}
                    onClick={handleSpeechRecognition}
                  />
                )}

                {textToTranslate.length > 0 && (
                  <HiOutlineSpeakerWave
                    size={22}
                    style={{
                      color: "rgb(148 163 184)",
                      cursor: "pointer",
                      marginLeft: "12px",
                    }}
                  />
                )}
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
                style={{ color: "rgb(148 163 184)", cursor: "pointer" }}
              />
            </div>
            <div className="right-actions">
              <div title="copy translation" style={{ display: "flex" }}>
                <PiCopySimple
                  size={22}
                  style={{
                    color: "rgb(148 163 184)",
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
                  color: "rgb(148 163 184)",
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
