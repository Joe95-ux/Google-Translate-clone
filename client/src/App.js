import { useEffect, useState } from 'react'
import TextBox from './components/TextBox'
import Arrows from './components/Arrows'
import Button from './components/Button'
import Modal from './components/Modal'
import History from './components/History'
import axios from 'axios'

const App = () => {
  const [showModal, setShowModal] = useState(false)
  const [languages, setLanguages] = useState(null)
  const [isLoading, setIsLoading] = useState(false);
  const [inputLanguage, setInputLanguage] = useState('English')
  const [outputLanguage, setOutputLanguage] = useState('French')
  const [textToTranslate, setTextToTranslate] = useState('')
  const [translatedText, setTranslatedText] = useState('')


  const getLanguages = async () => {
    const response = await axios.get('http://localhost:4000/languages');
    setLanguages(response.data)
  }
  useEffect(() => {
    getLanguages()
  }, [])

  const translate = async () => {
    const data = {
      textToTranslate, outputLanguage, inputLanguage
    }
    setIsLoading(true)
    const response = await axios.get('http://localhost:4000/translation', {
      params : data
    })
    setTranslatedText(response.data.trans)
    setIsLoading(false);
    saveTranslation({text: textToTranslate, to: outputLanguage, from: inputLanguage, translation:response.data.trans, timestamp: new Date().toLocaleString() })

  }

  const saveTranslation = (translation) => {
    const translations = JSON.parse(localStorage.getItem('translations')) || [];
    translations.push(translation);
    localStorage.setItem('translations', JSON.stringify(translations));
  };

  const handleClick = () => {
    setInputLanguage(outputLanguage)
    setOutputLanguage(inputLanguage)
  }

  return (
    <div className="wrapper">
      <History/>
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
    
    </div>
  )
}

export default App