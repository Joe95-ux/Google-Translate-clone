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
  setOtherInputLangs,
  translate,
  translateRef,
  textToTranslate,
  tab,
}) => {
  const disabled =
    inputLanguage.includes("Detect language") ||
    inputLanguage.includes(outputLanguage);

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
        translate={translate}
        translateRef={translateRef}
        textToTranslate={textToTranslate}
        tab={tab}
      />
      <div
        className={
          disabled ? "arrow-container disabled-arrow" : "arrow-container"
        }
        onClick={!disabled ? handleClick : undefined}
        aria-disabled={disabled}
        role="button"
      >
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
        translate={translate}
        translateRef={translateRef}
        textToTranslate={textToTranslate}
        tab={tab}
      />
    </div>
  );
};

export default ComposeHeader;
