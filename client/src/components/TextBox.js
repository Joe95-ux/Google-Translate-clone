import React, { useCallback, useEffect, useRef, useState } from "react";
import { PiCopySimple } from "react-icons/pi";
import { IoMdClose } from "react-icons/io";
import { BsTranslate } from "react-icons/bs";
import { HiOutlineSpeakerWave } from "react-icons/hi2";
import { HiOutlineMicrophone } from "react-icons/hi2";
import { FaRegCircleStop } from "react-icons/fa6";
import { MdOutlineShare } from "react-icons/md";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useShareModal } from "../hooks/useShareModal";
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
  setDic,
  showCopy,
  setShowCopy,
  detectLanguage,
  synthesizeSpeech,
  text,
}) => {
  const inputBoxRef = useRef(null);
  const outputBoxRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audio, setAudio] = useState(null);
  const [limit, setLimit] = useState(false);
  const [, setToastShown] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const {
    listening,
    transcript,
    resetTranscript,
    isMicrophoneAvailable,
    browserSupportsContinuousListening,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const shareModal = useShareModal();
  useEffect(() => {
    // Update animation state based on speech recognition state
    setIsAnimating(transcript);
  }, [transcript]);

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
        setDic([]);
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
    setDic([]);
    setShowDelete(false);
    setShowCopy(false);
    adjustTextareaHeight(inputBoxRef.current);
  };

  useEffect(() => {
    if (listening) {
      setTextToTranslate(transcript);
    } else {
      resetTranscript();
    }
  }, [listening, resetTranscript, setTextToTranslate, transcript]);

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

  useEffect(() => {
    if (!textToTranslate) {
      setShowDelete(false);
      setLimit(false);
    } else {
      setShowDelete(true);
      const isExceedingLimit = textToTranslate.length >= 5000;
      if (isExceedingLimit && !limit) {
        setLimit(true);
        setToastShown(true);
        setTextToTranslate((prevText) => {
          return prevText.substring(0, 5000);
        });
        toast.error("You have exceeded the character limit of 5000");
      } else if (!isExceedingLimit && limit) {
        setLimit(false);
        setToastShown(false)
      }
    }
  }, [limit, setShowDelete, setTextToTranslate, textToTranslate]);

  const handleSpeechRecognition = () => {
    if (!browserSupportsSpeechRecognition) {
      toast.error("Sorry, voice input isn't supported on your browser.");
    } else {
      if (isMicrophoneAvailable) {
        if (browserSupportsContinuousListening) {
          SpeechRecognition.startListening({ continuous: true });
        } else {
          SpeechRecognition.startListening();
        }
      } else {
        SpeechRecognition.stopListening();
        toast.info("Grant translate.io access to microphone.");
      }
    }
  };

  const handleStopSpeechRecognition = () => {
    SpeechRecognition.stopListening();
    resetTranscript();
    console.log(transcript);
  };

  const handleAudioEnded = useCallback(() => {
    // Pause the audio playback and reset the audio element
    if (audio) {
      audio.pause();
      audio.currentTime = 0; // Reset the playback position to the beginning
      setAudio(null); // Remove the audio element from state
      setAudioPlaying(false); // Update state to indicate that audio is not playing
    }
  }, [audio]);

  useEffect(() => {
    if (audio) {
      audio.play();

      // Add event listener for when the audio playback ends
      audio.addEventListener("ended", handleAudioEnded);
    }

    // Cleanup function to remove event listener when component unmounts or audio changes
    return () => {
      if (audio) {
        audio.removeEventListener("ended", handleAudioEnded);
      }
    };
  }, [audio, handleAudioEnded]);

  const handleListenAudio = async (text) => {
    setLoadingAudio(true);
    try {
      let speechUrl = await synthesizeSpeech(text);
      if (speechUrl) {
        const newAudio = new Audio(speechUrl);
        setAudio(newAudio);
        setLoadingAudio(false);
        toast.info("Speech was generated with AI");
        setAudioPlaying(true);
        setIsAnimating(true);
      } else {
        console.error("Failed to generate speech: Empty speech URL");
        setLoadingAudio(false);
        toast.error("Failed to generate speech");
      }
    } catch (error) {
      console.error("Error generating speech:", error);
      toast.error("Failed to generate speech");
    }
  };

  const handleStopAudio = () => {
    if (audio) {
      audio.pause();
      setAudio(null);
    }
    setAudioPlaying(false);
  };

  return (
    <div
      className={`${variant} ${
        variant === "input" && limit ? "text-limit" : ""
      }`}
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

          {variant === "input" && textToTranslate && (
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
              {!selectedLanguage.includes("language") &&
                textToTranslate !== "" && (
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
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    animate={{ rotate: isAnimating ? [0, -5, 5, -5, 0] : 0 }}
                    transition={{ repeat: Infinity, duration: 0.3 }}
                    style={{
                      originX: 0.5,
                      originY: 0.5,
                      display: "flex",
                    }}
                  >
                    <div
                      title="stop translation by voice"
                      className="icon-wrapper"
                      onClick={handleStopSpeechRecognition}
                    >
                      <FaRegCircleStop
                        size={24}
                        style={{
                          color: "#38BDF8",
                          cursor: "pointer",
                        }}
                      />
                    </div>
                  </motion.div>
                ) : (
                  <div
                    title="Translate by voice"
                    className="icon-wrapper"
                    onClick={handleSpeechRecognition}
                  >
                    <HiOutlineMicrophone
                      size={22}
                      style={{
                        color: listening
                          ? "rgb(203 213 225)"
                          : "rgb(148 163 184)",
                        cursor: "pointer",
                      }}
                    />
                  </div>
                )}

                {textToTranslate.length > 0 && (
                  <>
                    {!audioPlaying && !loadingAudio && (
                      <div
                        title="listen"
                        className="icon-wrapper"
                        onClick={() => handleListenAudio(text)}
                        style={{
                          marginLeft: "10px",
                        }}
                      >
                        <HiOutlineSpeakerWave
                          size={22}
                          style={{
                            color: "rgb(148 163 184)",
                            cursor: "pointer",
                          }}
                        />
                      </div>
                    )}
                    {loadingAudio && (
                      <small
                        style={{
                          color: "rgb(148 163 184)",
                          marginLeft: "12px",
                        }}
                      >
                        loading speech...
                      </small>
                    )}
                    {audioPlaying && !loadingAudio && (
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        animate={{
                          rotate: isAnimating ? [0, -5, 5, -5, 0] : 0,
                        }}
                        transition={{ repeat: Infinity, duration: 0.3 }}
                        style={{
                          originX: 0.5,
                          originY: 0.5,
                          display: "flex",
                        }}
                      >
                        <div
                          title="stop listening"
                          className="icon-wrapper"
                          onClick={handleStopAudio}
                          style={{
                            marginLeft: "12px",
                          }}
                        >
                          <FaRegCircleStop
                            size={24}
                            style={{
                              color: "#38BDF8",
                              cursor: "pointer",
                            }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </>
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

        {variant === "output" && translatedText && (
          <div className="textarea-actions">
            <div className="left-actions">
              <>
                {!audioPlaying && !loadingAudio && (
                  <div
                    title="listen"
                    className="icon-wrapper"
                    onClick={() => handleListenAudio(text)}
                  >
                    <HiOutlineSpeakerWave
                      size={22}
                      style={{ color: "rgb(148 163 184)", cursor: "pointer" }}
                    />
                  </div>
                )}
                {loadingAudio && (
                  <small style={{ color: "rgb(148 163 184)" }}>
                    loading speech...
                  </small>
                )}
                {audioPlaying && (
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    animate={{ rotate: isAnimating ? [0, -5, 5, -5, 0] : 0 }}
                    transition={{ repeat: Infinity, duration: 0.3 }}
                    style={{
                      originX: 0.5,
                      originY: 0.5,
                      display: "flex",
                    }}
                  >
                    <div
                      title="stop listening"
                      className="icon-wrapper"
                      onClick={handleStopAudio}
                    >
                      <FaRegCircleStop
                        size={22}
                        style={{
                          color: "#38BDF8",
                          cursor: "pointer",
                        }}
                      />
                    </div>
                  </motion.div>
                )}
              </>
            </div>
            <div className="right-actions">
              <div
                title="copy translation"
                style={{ display: "flex" }}
                className="icon-wrapper"
                onClick={handleCopy}
              >
                <PiCopySimple
                  size={22}
                  style={{
                    color: "rgb(148 163 184)",
                    transform: "rotate(180deg)",
                    cursor: "pointer",
                  }}
                />
              </div>
              <div
                className="icon-wrapper"
                title="share translation"
                style={{
                  marginLeft: "10px",
                  color: "rgb(148 163 184)",
                  cursor: "pointer",
                }}
              >
                <MdOutlineShare
                  id="toggle-share"
                  size={22}
                  style={{
                    color: "rgb(148 163 184)",
                    cursor: "pointer",
                  }}
                  onClick={shareModal.onOpen}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextBox;
