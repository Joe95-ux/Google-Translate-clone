import SelectDropdown from "./SelectDropdown";
import Arrows from "./Arrows";

const ComposeHeader = ({ setShowModal, inputLanguage, outputLanguage, handleClick }) => {
  return (
    <div className="compose-box-header">
      <SelectDropdown
        type="input"
        setShowModal={setShowModal}
        selectedLanguage={inputLanguage}
      />
      <div className="arrow-container" onClick={handleClick}>
        <Arrows />
      </div>
      <SelectDropdown
        type="output"
        setShowModal={setShowModal}
        selectedLanguage={outputLanguage}
      />
    </div>
  );
};

export default ComposeHeader;
