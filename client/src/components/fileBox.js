import React from "react";
import { FaFile } from "react-icons/fa6";
import { FiDownload } from "react-icons/fi";
import { MdOutlineOpenInNew } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import Spinner from "./Spinner";

const FileBox = ({
  fileName,
  fileSize,
  handleClose,
  filePath,
  translateDoc,
  loading,
}) => {
  const openTranslatedFile = () => {
    window.open(filePath, "_blank");
  };
  return (
    <div className="filebox-wrapper">
      <div className="filebox-inner">
        <div style={{ display: "flex" }}>
          <FaFile size={38} />
          <div className="file-stats">
            <div style={{ marginBottom: "0.5rem" }}>
              <p style={{ fontWeight: "bold" }}>{fileName || "no name"}</p>
            </div>

            <p>{Math.ceil(fileSize / 1024) + "kb" || "0kb"}</p>
          </div>
        </div>

        <div onClick={handleClose} className="icon-wrapper">
          <IoMdClose size={28} />
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        {!filePath ? (
          <button onClick={translateDoc} className="translate-doc-btn">
            {loading ? (
              <>
                <Spinner /> <span>Translating...</span>
              </>
            ) : (
              <span>Translate</span>
            )}
          </button>
        ) : (
          <>
            <button
              className="translate-doc-btn"
              style={{ marginRight: "1rem" }}
            >
              <FiDownload size={18} style={{ marginRight: "12px" }} />{" "}
              <a href={filePath} download={fileName}>
                Download translation
              </a>
            </button>
            {fileName.includes(".pdf") && (
              <button
                onClick={openTranslatedFile}
                className="translate-doc-btn"
              >
                <MdOutlineOpenInNew size={18} style={{ marginRight: "12px" }} />
                <span>Open translation</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FileBox;
