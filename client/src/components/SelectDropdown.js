import React from "react";

const SelectDropdown = ({ type, selectedLanguage, setShowModal }) => {
   

  return (
    <div className="select-drop-down" onClick={()=> setShowModal(type)}>
      {/* <input value={selectedLanguage} /> */}
      <span>{selectedLanguage}</span>
      <div className="down-arrow">
        <svg
          focusable="false"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path d="M7 10l5 5 5-5z"></path>
        </svg>
      </div>
    </div>
  );
};

export default SelectDropdown;
