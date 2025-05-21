import { useCallback, useEffect, useRef, useState } from "react";
import TextBox from "../../components/TextBox";
import Documents from "../../components/Documents";
import Images from "../../components/Images";
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
import ContextTranslationViewBox from "../../components/ContextTranslationViewBox";
import Footer from "../../components/Footer";
import ShareModal from "../../components/ShareModal";
import { useSaveModal } from "../../hooks/useSaveModal";
import { useShareModal } from "../../hooks/useShareModal";
import { Toaster, toast } from "sonner";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import { usePersistentState } from "../../hooks/usePersistentState";
import { usePersistentArray } from "../../hooks/usePersistentArray";

const Home = () => {
  const [showModal, setShowModal] = useState(false);
  const [languages, setLanguages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCopy, setShowCopy] = useState(false);
  const [isContext, setIsContext] = usePersistentState("context", "false");
  const [hasTranslated, setHasTranslated] = useState(false);
  const [contextFetched, setContextFetched] = useState(false);
  const [contextTranslations, setContextTranslations] = useState({});
  const [otherInputLangs, setOtherInputLangs] = usePersistentArray(
    "otherInputLangs",
    ["Detect language", "French", "English", "Spanish"]
  );
  const [otherOutputLangs, setOtherOutputLangs] = usePersistentArray(
    "otherOutputLangs",
    ["English", "Spanish", "French"]
  );

  const [inputLanguage, setInputLanguage] = usePersistentState(
    "inputLanguage",
    ""
  );
  const [outputLanguage, setOutputLanguage] = usePersistentState(
    "outputLanguage",
    ""
  );
  const [activeType, setActiveType] = usePersistentState("activeType", "Text");

  const [textToTranslate, setTextToTranslate] = usePersistentState(
    "textToTranslate",
    ""
  );
  const [translatedText, setTranslatedText] = usePersistentState(
    "translatedText",
    ""
  );
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

  const translateRef = useRef(false);
  const { isSignedIn } = useUser();

  const activeStyles = {
    active: {
      color: historyModal.isOpen && "#38BDF8",
    },
    activeSaved: {
      color: saveModal.isOpen && "#38BDF8",
    },
  };

  useEffect(() => {
    if (!isSignedIn && activeType === "Images") {
      setActiveType("Text");
    }
  }, [isSignedIn, activeType, setActiveType]);

  let apiUrl;
  if (process.env.NODE_ENV === "development") {
    apiUrl = "http://localhost:4000/";
  } else if (process.env.NODE_ENV === "production") {
    apiUrl = "/";
  }

  //initialize input and output langs
  useEffect(() => {
    if (!inputLanguage) {
      const initialInputLang = "Detect language";
      setInputLanguage(initialInputLang);
    }

    if (!outputLanguage) {
      const initialOutputLang =
        otherOutputLangs.find((lang) => lang !== inputLanguage) || "English";
      setOutputLanguage(initialOutputLang);
    }
  }, [
    inputLanguage,
    outputLanguage,
    otherInputLangs,
    otherOutputLangs,
    setInputLanguage,
    setOutputLanguage,
  ]);

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
      const response = await axios.get(`${apiUrl}languages`);
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
  }, [apiUrl]);

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
      !inputLanguage.includes("Detected") &&
      activeType === "Text"
    ) {
      const detectLanguage = async () => {
        try {
          const response = await axios.get(`${apiUrl}detect-language`, {
            params: { textToTranslate },
          });
          const detectedLanguage =
            activeType === "Text"
              ? response.data + " - Detected"
              : "Detect language";
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
  }, [
    activeType,
    apiUrl,
    detectedLang,
    inputLanguage,
    setInputLanguage,
    setOtherInputLangs,
    textToTranslate,
  ]);

  // change Detected Language on Documents
  useEffect(() => {
    setOtherInputLangs((prevLangs) => {
      if (
        activeType === "Documents" ||
        (activeType === "Images" && inputLanguage.includes("Detected"))
      ) {
        setInputLanguage("Detect language");
        return prevLangs.map((lang) => {
          if (lang.includes("Detected")) {
            return "Detect language";
          } else {
            return lang;
          }
        });
      }
      return prevLangs;
    });
  }, [activeType, inputLanguage, setInputLanguage, setOtherInputLangs]);

  useEffect(() => {
    if (textToTranslate === "" || textToTranslate === null) {
      setInputLanguage((prev) => {
        if (prev.includes("Detected")) {
          return "Detect language";
        } else {
          return prev;
        }
      });
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
    }
  }, [setInputLanguage, setOtherInputLangs, textToTranslate]);

  const translate = useCallback(
    async (timestamp = "", text, outputLang, inputLang, context = isContext) => {
      text = text || textToTranslate;
      outputLang = outputLang || outputLanguage;
      inputLang = inputLang || inputLanguage;
      if (!text) {
        toast.warning("Please provide text to translate");
        return;
      }
      setIsLoading(true);
      try {
        const { data } = await axios.get(`${apiUrl}translation`, {
          params: {
            text,
            outputLang,
            inputLang,
            context,
          },
        });
        const result = data;
        // response.data.trans
        setTranslatedText(result.translation);
        //response.data?.dict || (for old model)
        setDictionary([]);
        setShowCopy(true);
        setIsLoading(false);
        setHasTranslated(true);

        if (isContext && result.contextTranslations) {
          setContextTranslations(result.contextTranslations);
          setContextFetched(true);
        }
        if (timestamp === "" || timestamp === undefined || timestamp === null) {
          saveTranslation({
            text: text,
            to: outputLang,
            from: inputLang.includes("Detected")
              ? inputLang.split(" - ")[0]
              : inputLang,
            translation: result.translation,
            timestamp: new Date().toLocaleString(),
            saved: false,
          });
        }
      } catch (error) {
        toast.error(error.message);
        setIsLoading(false);
      }
    },
    [apiUrl, inputLanguage, isContext, outputLanguage, setTranslatedText, textToTranslate]
  );

  const saveTranslation = (translation) => {
    setTranslations((prevTranslations) => {
      const translationData = [translation, ...prevTranslations];
      localStorage.setItem("translations", JSON.stringify(translationData));
      return translationData;
    });
  };

  //translate again when context is set after translation
  useEffect(() => {
    if (hasTranslated && isContext && !contextFetched) {
      console.log("Re-translating with context...");
      translate(
        Date.now(),
        textToTranslate,
        outputLanguage,
        inputLanguage,
        isContext
      );
    }
  }, [
    hasTranslated,
    isContext,
    contextFetched,
    translate,
    textToTranslate,
    outputLanguage,
    inputLanguage,
  ]);

  // prepare for re-fetch if needed
  useEffect(() => {
    if (isContext) {
      setContextFetched(false); 
    }
  }, [isContext]);

  useEffect(() => {
    localStorage.setItem("translations", JSON.stringify(translations));
  }, [translations]);

  useEffect(() => {
    localStorage.setItem(
      "savedTranslations",
      JSON.stringify(savedTranslations)
    );
  }, [savedTranslations]);

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
    setActiveType((prev) => (prev === "Text" ? prev : "Text"));
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
      const response = await axios.post(`${apiUrl}synthesize-speech`, {
        input: text,
      });
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
      <Toaster richColors closeButton position="top-right" />
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
      <Header
        activeType={activeType}
        setActiveType={setActiveType}
        inputLanguage={inputLanguage}
        otherInputLangs={otherInputLangs}
        setInputLanguage={setInputLanguage}
        outputLanguage={outputLanguage}
        isContext={isContext}
        setIsContext={setIsContext}
        isTranslating={isLoading}
        setIsTranslating={setIsLoading}
      />
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
                    <>
                    {contextTranslations && (
                      <ContextTranslationViewBox translationOptions={ContextTranslationViewBox}/>
                    )}
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
                    </>
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

              {activeType === "Images" && isSignedIn && (
                <Images
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
