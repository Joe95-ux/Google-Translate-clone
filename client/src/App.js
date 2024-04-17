import { useEffect, useRef, useState } from "react";
import TextBox from "./components/TextBox";
import Button from "./components/Button";
import Modal from "./components/Modal";
import History from "./components/History";
import ComposeHeader from "./components/ComposeHeader";
import Saved from "./components/Saved";
import { FaHistory } from "react-icons/fa";
import { IoIosStar } from "react-icons/io";
import { useHistory } from "./hooks/useHistory";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { useSaveModal } from "./hooks/useSaveModal";
import { Toaster, toast } from "sonner";
import axios from "axios";

const App = () => {
  const [showModal, setShowModal] = useState(false);
  const [languages, setLanguages] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showCopy, setShowCopy] = useState(false);
  const [inputLanguage, setInputLanguage] = useState("English");
  const [outputLanguage, setOutputLanguage] = useState("French");
  const [textToTranslate, setTextToTranslate] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [detectedLang, setDetectedLang] = useState("");
  const [translations, setTranslations] = useState([]);
  const [savedTranslations, setSavedTranslations] = useState([]);
  const historyModal = useHistory();
  const saveModal = useSaveModal();

  const [otherInputLangs, setOtherInputLangs] = useState(["Detect language", "French", "English"]);
  const [otherOutputLangs, setOtherOutputLangs] = useState(["English", "Spanish", "French"]);
  const translateRef = useRef(false);
  
  const activeStyles = {
    active: {
      color: historyModal.isOpen && "#38BDF8",
    },
    activeSaved: {
      color: saveModal.isOpen && "#38BDF8",
    },
  };

  const getLanguages = async () => {
    const response = await axios.get("http://localhost:4000/languages");
    setLanguages(response.data);
  };

 
  useEffect(() => {
    getLanguages();
    const data = localStorage.getItem("translations");
    const parsedData = JSON.parse(data) || [];
    if (parsedData) {
      setTranslations(parsedData);
    }
    const saved = JSON.parse(localStorage.getItem("savedTranslations")) || [];
    setSavedTranslations(saved);
  }, []);


  useEffect(() => {
    if (textToTranslate !== "" && textToTranslate !== null && !inputLanguage.includes("Detected")) {
      const detectLanguage = async () => {
        const response = await axios.get("http://localhost:4000/detect-language", {params: {textToTranslate}});
        const detectedLanguage = response.data + " - Detected"; 
        setDetectedLang(response.data);
        if(inputLanguage === "Detect language"){
          setInputLanguage(detectedLanguage);
          setOtherInputLangs(prevLangs => {
            // const indexOfDetectedLang = prevLangs.findIndex(lang => lang === "Detect language");
            return [detectedLanguage, ...prevLangs.slice(1)];
          });

        }else{
          setOtherInputLangs(prevLangs => {
            // const indexOfDetectedLang = prevLangs.findIndex(lang => lang === "Detect language");
            return prevLangs.includes(inputLanguage) ? prevLangs : [...prevLangs.slice(0, -1), inputLanguage];
          });
        }
      };

      detectLanguage();
    }
  }, [detectedLang, inputLanguage, textToTranslate]);

  useEffect(() => {
    if(textToTranslate === "" || textToTranslate === null){
      setOtherInputLangs(prevLangs => {
        const updatedOptions = prevLangs.map(language => {
          if(language.includes("Detected")){
            return "Detect language";
          }else{
            return language
          }
        })

        return updatedOptions;
        
      })
      setInputLanguage("Detect language")

    }

  }, [textToTranslate])

  const translate = async () => {
    const data = {
      textToTranslate,
      outputLanguage,
      inputLanguage,
    };
    setIsLoading(true);
    try {
      if (textToTranslate !== "" && textToTranslate !== null) {
        const response = await axios.get("http://localhost:4000/translation", {
          params: data,
        });

        setTranslatedText(response.data.trans);
        setShowCopy(true);
        setIsLoading(false);
        saveTranslation({
          text: textToTranslate,
          to: outputLanguage,
          from: inputLanguage.includes("Detected") ? inputLanguage.split(" - ")[0] : inputLanguage,
          translation: response.data.trans,
          timestamp: new Date().toLocaleString(),
          saved: false,
        });
      } else {
        setIsLoading(false);
        toast.warning("please provide text to translate");
      }
    } catch (error) {
      toast.error(error.message);
      setIsLoading(false)
    }
  };

  const saveTranslation = (translation) => {
    let translationData = [translation, ...translations];
    setTranslations(translationData);
    localStorage.setItem("translations", JSON.stringify(translationData));
  };

  const handleClick = () => {
    // Check if inputLanguage is not "Detect language"
    let inputLang = inputLanguage.includes("Detected") ? inputLanguage.split(" - ")[0] : inputLanguage;
    if (!inputLang.includes("Detect language")) {
      // Swap input and output languages if they are different
      if (inputLang !== outputLanguage) {
        setInputLanguage(outputLanguage);
        setOutputLanguage(inputLang);
        setOtherOutputLangs(prevLangs => {
          if (prevLangs.length === 1) {
            return [inputLang];
          } else {
            return prevLangs.includes(inputLang) ? prevLangs : [...prevLangs.slice(0, -1), inputLang];
          }
          
        });
      } else {
        // Select a new outputLanguage different from inputLanguage
        let newOutputLanguage;
        if(otherOutputLangs.length === 1){
          newOutputLanguage = languages?.find(lang => lang !== inputLang && lang !== "Detect language");
        }else{
          newOutputLanguage = otherOutputLangs?.find(lang => lang !== inputLang);
        }
        
        // Update outputLanguage
        setOutputLanguage(newOutputLanguage);
        setOtherOutputLangs(prevLangs => {
          if (prevLangs.length === 1) {
            return [newOutputLanguage];
          } else {
            return prevLangs.includes(newOutputLanguage) ? prevLangs : [...prevLangs.slice(0, -1), newOutputLanguage];
          }
          
        });
      }
  
      // Update other input and output languages
      setOtherInputLangs(prevLangs => {
        if (prevLangs.length === 1) {
          return [outputLanguage];
        } else {
          const adjustedLangs = prevLangs.map(lang => {
            if(lang.includes("Detected") && !lang.includes(inputLanguage)){
              return "Detect language"
            } else{
              return lang
            }

          })
          return adjustedLangs.includes(outputLanguage) ? adjustedLangs : [...adjustedLangs.slice(0, -1), outputLanguage];
        }
      });
      if(textToTranslate !== "" && translatedText !== ""){
        setTextToTranslate(translatedText);
        setTranslatedText(textToTranslate);
      }
    }
  };

  const handleReTranslate = (from, to, text, translatedText) => {
    setInputLanguage(from);
    setOutputLanguage(to);
    // set otherInputLangs
    setOtherInputLangs(prevLangs => {
      const adjustedLangs = prevLangs.map(lang => {
        if(lang.includes("Detected")){
          return "Detect language"
        } else{
          return lang
        }

      })
      return adjustedLangs.includes(from) ? adjustedLangs : [...adjustedLangs.slice(0, -1), from];
    });

    // set otherOutputLangs
    setOtherOutputLangs(prevLangs => {
      return prevLangs.includes(to) ? prevLangs : [...prevLangs.slice(0, -1), to];
    });

    setTextToTranslate(text);
    setTranslatedText(translatedText);
    setShowDelete(true);
    setShowCopy(true);
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
      <Header />
      <div className="app">
        {!showModal && (
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
            />
            <div className="compose-box-inner">
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
              />
              <TextBox
                variant="output"
                setShowModal={setShowModal}
                selectedLanguage={outputLanguage}
                setTextToTranslate={setTextToTranslate}
                translatedText={isLoading ? "Translating..." : translatedText}
                showCopy={showCopy}
                setShowCopy={setShowCopy}
                onTranslate={translate}
                detectLanguage={detectedLang}
              />
              <div className="button-container" onClick={translate}>
                <Button disable={isLoading} />
              </div>
            </div>
          </div>
        )}
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
            otherLangs={showModal === "input" ? otherInputLangs : otherOutputLangs}
            setOtherLangs={showModal === "input" ? setOtherInputLangs : setOtherOutputLangs}
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

export default App;
