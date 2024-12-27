import { useCallback, useEffect, useRef, useState } from "react";
import TextBox from "../../components/TextBox";
import Documents from "../../components/Documents";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import History from "../../components/History";
import ComposeHeader from "../../components/ComposeHeader";
import Saved from "../../components/Saved";
import { FaHistory } from "react-icons/fa";
import { IoIosStar } from "react-icons/io";
import { useHistory } from "../../hooks/useHistory";
import Header from "../../components/Header";
import Dictionary from "../../components/Dictionary";
import Footer from "../../components/Footer";
import ShareModal from "../../components/ShareModal";
import { useSaveModal } from "../../hooks/useSaveModal";
import { useShareModal } from "../../hooks/useShareModal";
import { Toaster, toast } from "sonner";
import { usePersistentState } from "../../hooks/usePersistentState";
import axios from "axios";

const Home = () => {
  const [showModal, setShowModal] = useState(false);
  const [languages, setLanguages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCopy, setShowCopy] = useState(false);
  const [inputLanguage, setInputLanguage] = usePersistentState("inputLanguage", "English");
  const [outputLanguage, setOutputLanguage] = usePersistentState("outputLanguage","French");
  const [activeType, setActiveType] = useState("Text");
  const [textToTranslate, setTextToTranslate] = usePersistentState("textToTranslate","");
  const [translatedText, setTranslatedText] = usePersistentState("translatedText","");
  const [dictionary, setDictionary] = useState([]);
  const [detectedLang, setDetectedLang] = useState("");
  const [translations, setTranslations] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [savedTranslations, setSavedTranslations] = useState([]);
  const [showDelete, setShowDelete] = useState(false);
  const historyModal = useHistory();
  const saveModal = useSaveModal();
  const shareModal = useShareModal();
  const [smallScreenWidth, setSmallScreenWidth] = useState(window.innerWidth);

  const [otherInputLangs, setOtherInputLangs] = useState([
    "Detect language",
    "French",
    "English",
  ]);
  const [otherOutputLangs, setOtherOutputLangs] = useState([
    "English",
    "Spanish",
    "French",
  ]);
  const translateRef = useRef(false);

  const activeStyles = {
    active: {
      color: historyModal.isOpen && "#38BDF8",
    },
    activeSaved: {
      color: saveModal.isOpen && "#38BDF8",
    },
  };

  useEffect(() => {
    const handleResize = () => {
      setSmallScreenWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const getLanguages = useCallback(async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_ENDPOINT}/languages`
      );
      const data = await response.data;
      if (data) {
        setLanguages(data);
        setIsFetching(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      // toast.error(
      //   "An error occurred while fetching languages. Refetching data..."
      // );
      setIsFetching(true);
    }
  }, []);

  useEffect(() => {
    getLanguages(); // Initial fetch attempt

    // Polling mechanism: retry every 5 seconds
    const intervalId = setInterval(() => {
      if (isFetching) {
        getLanguages();
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [getLanguages, isFetching]);

  useEffect(() => {
    const data = localStorage.getItem("translations");
    const parsedData = JSON.parse(data) || [];
    if (parsedData.length > 0) {
      console.log("Setting translations from localStorage:", parsedData);
      setTranslations(parsedData);
    }
    const saved = JSON.parse(localStorage.getItem("savedTranslations")) || [];
    if (saved.length > 0) {
      console.log("Setting saved translations from localStorage:", saved);
      setSavedTranslations(saved);
    }
  }, []);

  useEffect(() => {
    if (
      textToTranslate !== "" &&
      textToTranslate !== null &&
      !inputLanguage.includes("Detected")
    ) {
      const detectLanguage = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_ENDPOINT}/detect-language`,
            { params: { textToTranslate } }
          );
          const detectedLanguage = response.data + " - Detected";
          setDetectedLang(response.data);
          if (inputLanguage === "Detect language") {
            setInputLanguage(detectedLanguage);
            setOtherInputLangs((prevLangs) => {
              // const indexOfDetectedLang = prevLangs.findIndex(lang => lang === "Detect language");
              return [detectedLanguage, ...prevLangs.slice(1)];
            });
          } else {
            setOtherInputLangs((prevLangs) => {
              // const indexOfDetectedLang = prevLangs.findIndex(lang => lang === "Detect language");
              return prevLangs.includes(inputLanguage)
                ? prevLangs
                : [...prevLangs.slice(0, -1), inputLanguage];
            });
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          toast.error(
            "An error occurred while detecting the language. Please try again later."
          );
        }
      };

      detectLanguage();
    }
  }, [detectedLang, inputLanguage, setInputLanguage, textToTranslate]);

  useEffect(() => {
    if (textToTranslate === "" || textToTranslate === null) {
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
      setInputLanguage("Detect language");
    }
  }, [setInputLanguage, textToTranslate]);

  const translate = async (
    timestamp = null,
    text = textToTranslate,
    outputLang = outputLanguage,
    inputLang = inputLanguage
  ) => {
    const data = {
      text,
      outputLang,
      inputLang,
    };
    setIsLoading(true);
    try {
      if (text !== "" && text !== null) {
        const response = await axios.get(
          `${process.env.REACT_APP_API_ENDPOINT}/translation`,
          {
            params: data,
          }
        );

        setTranslatedText(response.data.trans);
        setDictionary(response.data.dict || []);
        setShowCopy(true);
        setIsLoading(false);
        if (!timestamp) {
          saveTranslation({
            text: text,
            to: outputLang,
            from: inputLang.includes("Detected")
              ? inputLang.split(" - ")[0]
              : inputLang,
            translation: response.data.trans,
            timestamp: new Date().toLocaleString(),
            saved: false,
          });
        }
      } else {
        setIsLoading(false);
        toast.warning("please provide text to translate");
      }
    } catch (error) {
      toast.error(error.message);
      setIsLoading(false);
    }
  };

  const saveTranslation = (translation) => {
    let translationData = [translation, ...translations];
    setTranslations(translationData);
    localStorage.setItem("translations", JSON.stringify(translationData));
  };

  const handleClick = () => {
    // Check if inputLanguage is not "Detect language"
    let inputLang = inputLanguage.includes("Detected")
      ? inputLanguage.split(" - ")[0]
      : inputLanguage;
    if (!inputLang.includes("Detect language")) {
      // Swap input and output languages if they are different
      if (inputLang !== outputLanguage) {
        setInputLanguage(outputLanguage);
        setOutputLanguage(inputLang);
        setOtherOutputLangs((prevLangs) => {
          if (prevLangs.length === 1) {
            return [inputLang];
          } else {
            return prevLangs.includes(inputLang)
              ? prevLangs
              : [...prevLangs.slice(0, -1), inputLang];
          }
        });
      } else {
        // Select a new outputLanguage different from inputLanguage
        let newOutputLanguage;
        if (otherOutputLangs.length === 1) {
          newOutputLanguage = languages?.find(
            (lang) => lang !== inputLang && lang !== "Detect language"
          );
        } else {
          newOutputLanguage = otherOutputLangs?.find(
            (lang) => lang !== inputLang
          );
        }

        // Update outputLanguage
        setOutputLanguage(newOutputLanguage);
        setOtherOutputLangs((prevLangs) => {
          if (prevLangs.length === 1) {
            return [newOutputLanguage];
          } else {
            return prevLangs.includes(newOutputLanguage)
              ? prevLangs
              : [...prevLangs.slice(0, -1), newOutputLanguage];
          }
        });
      }

      // Update other input and output languages
      setOtherInputLangs((prevLangs) => {
        if (prevLangs.length === 1) {
          return [outputLanguage];
        } else {
          const adjustedLangs = prevLangs.map((lang) => {
            if (lang.includes("Detected") && !lang.includes(inputLanguage)) {
              return "Detect language";
            } else {
              return lang;
            }
          });
          return adjustedLangs.includes(outputLanguage)
            ? adjustedLangs
            : [...adjustedLangs.slice(0, -1), outputLanguage];
        }
      });
      if (textToTranslate !== "" && translatedText !== "") {
        setTextToTranslate(translatedText);
        setTranslatedText(textToTranslate);
      }
    }
  };

  const handleReTranslate = (from, to, text, translatedText, timestamp) => {
    setInputLanguage(from);
    setOutputLanguage(to);
    // set otherInputLangs
    setOtherInputLangs((prevLangs) => {
      const adjustedLangs = prevLangs.map((lang) => {
        if (lang.includes("Detected")) {
          return "Detect language";
        } else {
          return lang;
        }
      });
      return adjustedLangs.includes(from)
        ? adjustedLangs
        : [...adjustedLangs.slice(0, -1), from];
    });

    // set otherOutputLangs
    setOtherOutputLangs((prevLangs) => {
      return prevLangs.includes(to)
        ? prevLangs
        : [...prevLangs.slice(0, -1), to];
    });

    setTextToTranslate(text);
    // setTranslatedText(translatedText);
    translate(timestamp, text, to, from);
    setShowDelete(true);
    setShowCopy(true);
  };

  const synthesizeSpeech = async (text) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_ENDPOINT}/synthesize-speech`,
        {
          input: text,
        }
      );
      console.log(response.data.url);
      return response.data.url;
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        "An error occured while synthesizing speech. Please try again"
      );
    }
  };

  return (
    <div className="wrapper">
      <Toaster />
      <History
        translations={translations}
        setTranslations={setTranslations}
        handleHistory={handleReTranslate}
        savedTranslations={savedTranslations}
        setSavedTranslations={setSavedTranslations}
      />
      <Saved
        translations={translations}
        setTranslations={setTranslations}
        handleHistory={handleReTranslate}
        savedTranslations={savedTranslations}
        setSavedTranslations={setSavedTranslations}
      />
      <Header activeType={activeType} setActiveType={setActiveType} inputLanguage={inputLanguage} otherInputLangs={otherInputLangs} setInputLanguage={setInputLanguage} outputLanguage={outputLanguage}/>
      <div className="app">
        <div
          style={{ width: "100%", height: activeType === "Text" ? "100%" : "" }}
        >
          <div className="compose-box">
            <ComposeHeader
              setShowModal={setShowModal}
              inputLanguage={inputLanguage}
              outputLanguage={outputLanguage}
              handleClick={handleClick}
              otherInputLangs={otherInputLangs}
              otherOutputLangs={otherOutputLangs}
              setInputLanguage={setInputLanguage}
              setOutputLanguage={setOutputLanguage}
              setOtherOutputLangs={setOtherOutputLangs}
              setOtherInputLangs={setOtherInputLangs}
              translate={translate}
              translateRef={translateRef}
              textToTranslate={textToTranslate}
              tab={activeType}
            />
            <div className="compose-box-inner">
              {activeType === "Text" && (
                <>
                  <TextBox
                    variant="input"
                    setShowModal={setShowModal}
                    selectedLanguage={inputLanguage}
                    setTextToTranslate={setTextToTranslate}
                    textToTranslate={textToTranslate}
                    setTranslatedText={setTranslatedText}
                    showDelete={showDelete}
                    setShowDelete={setShowDelete}
                    showCopy={showCopy}
                    setShowCopy={setShowCopy}
                    onTranslate={translate}
                    detectLanguage={detectedLang}
                    synthesizeSpeech={synthesizeSpeech}
                    text={textToTranslate}
                    setDic={setDictionary}
                  />
                  {(smallScreenWidth > 600 || translatedText) && (
                    <TextBox
                      variant="output"
                      setShowModal={setShowModal}
                      selectedLanguage={outputLanguage}
                      setTextToTranslate={setTextToTranslate}
                      translatedText={
                        isLoading ? "Translating..." : translatedText
                      }
                      showCopy={showCopy}
                      setShowCopy={setShowCopy}
                      showDelete={showDelete}
                      setShowDelete={setShowDelete}
                      onTranslate={translate}
                      detectLanguage={detectedLang}
                      synthesizeSpeech={synthesizeSpeech}
                      text={translatedText}
                    />
                  )}

                  {(smallScreenWidth > 600 ||
                    translatedText ||
                    textToTranslate) && (
                    <div className="button-container">
                      {textToTranslate !== "" && (
                        <Button disable={isLoading} translate={translate} />
                      )}
                    </div>
                  )}
                </>
              )}
              {activeType === "Documents" && (
                <Documents
                  fromLanguage={inputLanguage}
                  toLanguage={outputLanguage}
                />
              )}
            </div>
            {shareModal.isOpen && (
              <ShareModal
                fromLanguage={detectedLang || inputLanguage}
                to={outputLanguage}
                textToTranslate={textToTranslate}
                translatedText={translatedText}
              />
            )}
          </div>
          {dictionary &&
            textToTranslate &&
            dictionary.length > 0 &&
            activeType === "Text" && (
              <Dictionary dic={dictionary} trans={translatedText} />
            )}
        </div>
        {showModal && (
          <Modal
            showModal={showModal}
            setShowModal={setShowModal}
            languages={showModal === "input" ? languages : languages?.slice(1)}
            chosenLanguage={
              showModal === "input" ? inputLanguage : outputLanguage
            }
            setChosenLanguage={
              showModal === "input" ? setInputLanguage : setOutputLanguage
            }
            otherLangs={
              showModal === "input" ? otherInputLangs : otherOutputLangs
            }
            setOtherLangs={
              showModal === "input" ? setOtherInputLangs : setOtherOutputLangs
            }
            otherInputLangs={otherInputLangs}
            otherOutputLangs={otherOutputLangs}
            setInputLanguage={setInputLanguage}
            setOutputLanguage={setOutputLanguage}
            setOtherOutputLangs={setOtherOutputLangs}
            setOtherInputLangs={setOtherInputLangs}
            inputLanguage={inputLanguage}
            outputLanguage={outputLanguage}
            translateRef={translateRef}
            translate={translate}
          />
        )}
      </div>
      <div className="open-history">
        <div
          className="open-history-inner btm-btn"
          style={activeStyles.active}
          onClick={historyModal.onOpen}
        >
          <FaHistory />
          <h3>History</h3>
        </div>

        <div
          className="saved btm-btn"
          style={activeStyles.activeSaved}
          onClick={saveModal.onOpen}
        >
          <IoIosStar />
          <h3>Saved</h3>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
