import SelectDropdown from "./SelectDropdown";
import Arrows from "./Arrows";

const ComposeHeader = ({
  setShowModal,
  inputLanguage,
  outputLanguage,
  handleClick,
  otherInputLangs,
  otherOutputLangs,
  setInputLanguage,
  setOutputLanguage
}) => {
  return (
    <div className="compose-box-header">
      <SelectDropdown
        type="input"
        setShowModal={setShowModal}
        selectedLanguage={inputLanguage}
        inputOptions={otherInputLangs}
        outputOptions={otherOutputLangs}
        setInputLanguage={setInputLanguage}
        setOutputLanguage={setOutputLanguage}
      />
      <div className="arrow-container" onClick={handleClick}>
        <Arrows />
      </div>
      <SelectDropdown
        type="output"
        setShowModal={setShowModal}
        selectedLanguage={outputLanguage}
        inputOptions={otherInputLangs}
        outputOptions={otherOutputLangs}
        setInputLanguage={setInputLanguage}
        setOutputLanguage={setOutputLanguage}
      />
    </div>
  );
};

export default ComposeHeader;
