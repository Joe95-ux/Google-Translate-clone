import { useEffect, useState } from 'react'
import TextBox from './components/TextBox'
import Arrows from './components/Arrows'
import Button from './components/Button'
import Modal from './components/Modal'
import axios from 'axios'

const App = () => {
  const [showModal, setShowModal] = useState(false)
  const [languages, setLanguages] = useState(null)
  const [inputLanguage, setInputLanguage] = useState('English')
  const [outputLanguage, setOutputLanguage] = useState('Polish')
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
    const response = await axios.get('http://localhost:4000/translation', {
      params : data
    })
    console.log('response', response)
    setTranslatedText(response.data)
  }

  const handleClick = () => {
    setInputLanguage(outputLanguage)
    setOutputLanguage(inputLanguage)
  }

  return (
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
            translatedText={translatedText}
          />
          <div className="button-container" onClick={translate}>
            <Button />
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
  )
}

export default App