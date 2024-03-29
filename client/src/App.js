import { useEffect, useState } from 'react'
import TextBox from './components/TextBox'
import Arrows from './components/Arrows'
import Button from './components/Button'
import Modal from './components/Modal'
import History from './components/History'
import { FaHistory } from "react-icons/fa";
import { useHistory } from "./hooks/useHistory";
import { Toaster, toast} from 'sonner'
import axios from 'axios'

const App = () => {
  const [showModal, setShowModal] = useState(false)
  const [languages, setLanguages] = useState(null)
  const [isLoading, setIsLoading] = useState(false);
  const [inputLanguage, setInputLanguage] = useState('English')
  const [outputLanguage, setOutputLanguage] = useState('French')
  const [textToTranslate, setTextToTranslate] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [translations, setTranslations] = useState([]);
  const historyModal = useHistory();
  const activeStyles = {
    active:{
      opacity: historyModal.isOpen ? "0" : "1"
    },

  }



  const getLanguages = async () => {
    const response = await axios.get('http://localhost:4000/languages');
    setLanguages(response.data)
  }

  useEffect(() => {
    getLanguages()
    const data = localStorage.getItem('translations');
    const parsedData = JSON.parse(data);
    if (parsedData) {
      setTranslations(parsedData.reverse());
    }
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
        setIsLoading(false);
        saveTranslation({text: textToTranslate, to: outputLanguage, from: inputLanguage, translation:response.data.trans, timestamp: new Date().toLocaleString() })

      }else{
        setIsLoading(false);
        toast.warning("please provide text to translate");
      }
    } catch (error) {
      toast.error(error.message)
    }

  }

  const saveTranslation = (translation) => {
    let translationData = [...translations, translation];
    setTranslations(translationData);
    localStorage.setItem('translations', JSON.stringify(translationData));
  };

  const handleClick = () => {
    setInputLanguage(outputLanguage)
    setOutputLanguage(inputLanguage)
  }

  return (
    <div className="wrapper">
      <Toaster/>
      <History translations={translations} setTranslations={setTranslations}/>
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
            />
            <div className="arrow-container" onClick={handleClick}>
              <Arrows />
            </div>
            <TextBox
              variant="output"
              setShowModal={setShowModal}
              selectedLanguage={outputLanguage}
              translatedText={isLoading ? 'Fetching response...' : translatedText}
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
      <div className='open-history' style={activeStyles.active} onClick={historyModal.onOpen}>
        <div className='open-history-inner'>
          <FaHistory />
          <h3>View History</h3>
        </div>
        

      </div>
    
    </div>
  )
}

export default App