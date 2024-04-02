import { useEffect, useState } from 'react'
import TextBox from './components/TextBox'
import Arrows from './components/Arrows'
import Button from './components/Button'
import Modal from './components/Modal'
import History from './components/History'
import Saved from './components/Saved'
import { FaHistory } from "react-icons/fa";
import { IoIosStar } from "react-icons/io";
import { useHistory } from "./hooks/useHistory";
import Header from './components/Header'
import { useSaveModal } from './hooks/useSaveModal';
import { Toaster, toast} from 'sonner'
import axios from 'axios'

const App = () => {
  const [showModal, setShowModal] = useState(false)
  const [languages, setLanguages] = useState(null)
  const [isLoading, setIsLoading] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showCopy, setShowCopy] = useState(false);
  const [inputLanguage, setInputLanguage] = useState('English')
  const [outputLanguage, setOutputLanguage] = useState('French')
  const [textToTranslate, setTextToTranslate] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [translations, setTranslations] = useState([]);
  const [savedTranslations, setSavedTranslations] = useState([]);
  const historyModal = useHistory();
  const saveModal = useSaveModal();
  const activeStyles = {
    active:{
      color: historyModal.isOpen && "#38BDF8"
    },
    activeSaved:{
      color: saveModal.isOpen && "#38BDF8" 
    }

  }

  const getLanguages = async () => {
    const response = await axios.get('http://localhost:4000/languages');
    setLanguages(response.data)
  }

  useEffect(() => {
    getLanguages()
    const data = localStorage.getItem('translations');
    const parsedData = JSON.parse(data) || [];
    if (parsedData) {
      setTranslations(parsedData);
    }
    const saved = JSON.parse(localStorage.getItem('savedTranslations')) || [];
    setSavedTranslations(saved);
  }, [])

  const translate = async () => {
    const data = {
      textToTranslate, outputLanguage, inputLanguage
    }
    setIsLoading(true)
    try {
      if(textToTranslate !== "" && textToTranslate !== null){
        const response = await axios.get('http://localhost:4000/translation', {
        params : data
        })
        setTranslatedText(response.data.trans)
        setShowCopy(true)
        setIsLoading(false);
        saveTranslation({text: textToTranslate, to: outputLanguage, from: inputLanguage, translation:response.data.trans, timestamp: new Date().toLocaleString(), saved:false })

      }else{
        setIsLoading(false);
        toast.warning("please provide text to translate");
      }
    } catch (error) {
      toast.error(error.message)
    }

  }

  const saveTranslation = (translation) => {
    let translationData = [translation, ...translations];
    setTranslations(translationData);
    localStorage.setItem('translations', JSON.stringify(translationData));
  };

  const handleClick = () => {
    setInputLanguage(outputLanguage)
    setOutputLanguage(inputLanguage)
  }

  const handleReTranslate = (from, to, text, translatedText)=>{
    setInputLanguage(from);
    setOutputLanguage(to);
    setTextToTranslate(text);
    setTranslatedText(translatedText);
    setShowDelete(true);
    setShowCopy(true);

  }

  return (
    <div className="wrapper">
      <Toaster/>
      <History translations={translations} setTranslations={setTranslations} handleHistory={handleReTranslate} savedTranslations={savedTranslations} setSavedTranslations={setSavedTranslations}/>
      <Saved translations={translations} setTranslations={setTranslations} handleHistory={handleReTranslate} savedTranslations={savedTranslations} setSavedTranslations={setSavedTranslations}/>
      <Header/>
      <div className="app">
        {!showModal && (
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
            />
            <div className="arrow-container" onClick={handleClick}>
              <Arrows />
            </div>
            <TextBox
              variant="output"
              setShowModal={setShowModal}
              selectedLanguage={outputLanguage}
              translatedText={isLoading ? 'Fetching response...' : translatedText}
              showCopy={showCopy}
              setShowCopy={setShowCopy}
            />
            <div className="button-container" onClick={translate}>
              <Button disable={isLoading}/>
            </div>
          </>
        )}
        {showModal && (
          <Modal
            showModal={showModal}
            setShowModal={setShowModal}
            languages={languages}
            chosenLanguage={
              showModal === 'input' ? inputLanguage : outputLanguage
            }
            setChosenLanguage={
              showModal === 'input' ? setInputLanguage : setOutputLanguage
            }
          />
        )}
      </div>
      <div className='open-history'>
        <div className='open-history-inner' style={activeStyles.active} onClick={historyModal.onOpen}>
          <FaHistory />
          <h3>History</h3>
        </div>

        <div className='saved' style={activeStyles.activeSaved} onClick={saveModal.onOpen}>
          <IoIosStar />
          <h3>Saved</h3>
        </div>
        

      </div>
    
    </div>
  )
}

export default App