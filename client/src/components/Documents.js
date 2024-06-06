import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { toast } from "sonner";
import { IoCloudUploadSharp } from "react-icons/io5";
import FileBox from "./fileBox";

const Documents = ({ fromLanguage, toLanguage }) => {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [formData, setFormData] = useState(null);
  const [translatedDocument, setTranslatedDocument] = useState(null);

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    handleData(file);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    handleData(file);
  };

  const handleData = (file) => {
    const fileExtension = getFileExtension(file.name);
    if (file.size > 10 * 1024 * 1024) {
      // bigger than 10mb!
      toast.error("File too large");
      return;
    }

    if (!isSupportedFileType(fileExtension)) {
      toast(
        "Unsupported file type. Please upload a .docx, .pdf, .pptx, or .xlsx file."
      );
      return;
    }
    setFileName(file.name);
    setFileSize(file.size);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fromLanguage", fromLanguage);
    formData.append("toLanguage", toLanguage);
    setFormData(formData);
  };

  const translateDoc = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_ENDPOINT}/translate-document`,
        formData, {
          responseType: 'blob', // Receive binary data
        }
      );
  
      // Determine the content type from the response headers
      const contentType = response.headers['content-type'];
  
      // Create a Blob object with the appropriate MIME type
      const blob = new Blob([response.data], { type: contentType });
  
      // Create a download URL
      const downloadUrl = window.URL.createObjectURL(blob);
  
      setTranslatedDocument(downloadUrl);
      setLoading(false);
    } catch (error) {
      console.error("Error translating document:", error);
      toast.error("An error occurred while translating the document. Please try again later.");
      setLoading(false);
    }
  };

  const handleFolderReset = async ()=>{
    try {
      await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/clear-uploads`);
      
    } catch (error) {
      console.log({error: error.message})
      toast.info("Failed to clear upload folder");
    }
  }
  

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const getFileExtension = (fileName) => {
    return fileName.split(".").pop().toLowerCase();
  };

  const isSupportedFileType = (fileExtension) => {
    const supportedFileTypes = ["docx", "doc", "pdf", "pptx", "xlsx"];
    return supportedFileTypes.includes(fileExtension);
  };

  const handleCloseBox = () => {
    setFileName("");
    setTranslatedDocument("");
    handleFolderReset();
  };

  return (
    <>
      {!fileName && (
        <div className="container-fluid">
          <div className="drop-container">
            <div {...getRootProps()} className="drop-area">
              <input {...getInputProps()} />
              {isDragActive ? (
                <p>Drop the file here...</p>
              ) : (
                <IoCloudUploadSharp size={34} style={{ color: "#38BDF8" }} />
              )}
            </div>
            <h4>Drag and drop</h4>
          </div>
          <hr className="line" aria-hidden="true" />
          <div className="browse-container">
            <div className="browse-inner">
              <h4>Or Choose a file</h4>
              <div className="file-box">
                <label for="file-upload" class="custom-file-upload">
                  Browse your files
                </label>
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleFileUpload}
                />
              </div>
              <p>Supported file types: .docx, .pdf, .pptx, .xlsx</p>
            </div>
          </div>
        </div>
      )}

      {fileName && (
        <FileBox
          fileName={fileName}
          fileSize={fileSize}
          handleClose={handleCloseBox}
          filePath={translatedDocument}
          translateDoc={translateDoc}
          loading={loading}
        />
      )}
    </>
  );
};

export default Documents;
