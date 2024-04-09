import { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { IoSearch } from "react-icons/io5";

const Modal = ({
  showModal,
  setShowModal,
  languages,
  chosenLanguage,
  setChosenLanguage,
}) => {
  const [searchedLanguage, setSearchedLanguage] = useState("");

  const filteredLanguages = languages?.filter((language) =>
    language.toLowerCase().startsWith(searchedLanguage.toLowerCase())
  );

  const handleSelect = (e, language) => {
    e.stopPropagation(); // Stop event propagation to prevent triggering parent elements' click handlers
    setChosenLanguage(language);
    setShowModal(false);
   
  };

  const handleChange = (e) => {
    setSearchedLanguage(e.target.value);
    setChosenLanguage(e.target.value);
  };
  return (
    <div className="option-list">
      <div className="search-bar">
        <input value={chosenLanguage} onChange={handleChange} />
        <div className="close-button" >
          <IoSearch size={22} style={{marginRight:"20px"}}/>
          <IoMdClose size={22} onClick={() => setShowModal(null)} style={{cursor:"pointer"}}/>
        </div>
      </div>
      <div className="option-container">
        <ul>
          {filteredLanguages?.map((filteredLanguage, index) => (
            <div className="list-item" key={index} >
              <div className="icon">
                {chosenLanguage === filteredLanguage ? "✓" : ""}
              </div>
              <li onClick={(e) => handleSelect(e, filteredLanguage)}
                style={{
                  color: chosenLanguage === filteredLanguage ? "#8ab4f8" : null,
                }}
              >
                {filteredLanguage}
              </li>
            </div>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Modal;
