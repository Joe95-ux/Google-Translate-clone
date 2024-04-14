import React from "react";
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
  setOutputLanguage,
  setOtherOutputLangs,
  setOtherInputLangs
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
        inputLanguage={inputLanguage}
        outputLanguage={outputLanguage}
        setOutputOptions={setOtherOutputLangs}
        setInputOptions={setOtherInputLangs}
      />
      <div className={inputLanguage.includes("Detect language") ? "arrow-container disabled-arrow" : "arrow-container"} onClick={handleClick}>
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
        inputLanguage={inputLanguage}
        outputLanguage={outputLanguage}
        setOutputOptions={setOtherOutputLangs}
        setInputOptions={setOtherInputLangs}
      />
    </div>
  );
};

export default ComposeHeader;
