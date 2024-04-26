import React from "react";
import { FaFile } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";

const FileBox = ({
  fileName,
  fileSize,
  handleClose,
  filePath,
  translateDoc,
}) => {
  return (
    <div className="filebox-wrapper">
      <div className="filebox-inner">
        <div style={{display:"flex"}}>
          <FaFile size={38}/>
          <div className="file-stats">
            <div style={{marginBottom:"0.5rem"}}>
              <p style={{ fontWeight: "bold" }}>{fileName || "no name"}</p>  
            </div>
            
            <p>{Math.ceil(fileSize / 1024) + "kb" || "0kb"}</p>
          </div>
        </div>

        <div onClick={handleClose} className="icon-wrapper">
          <IoMdClose size={28} />
        </div>
      </div>
      <div style={{ display: "flex", justifyContent:"flex-end" }}>
        <button
          onClick={translateDoc}
          className="translate-doc-btn"
        >
          Translate
        </button>
      </div>
    </div>
  );
};

export default FileBox;
