import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { toast } from "sonner";
import { IoCloudUploadSharp } from "react-icons/io5";
import FileBox from "./fileBox";
import { Clipboard } from "lucide-react";

const Images = ({ fromLanguage, toLanguage }) => {
  let apiUrl;
  if (process.env.NODE_ENV === "development") {
    apiUrl = "http://localhost:4000/";
  } else if (process.env.NODE_ENV === "production") {
    apiUrl = "/";
  }
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [formData, setFormData] = useState(new FormData());
  const [translatedDocument, setTranslatedDocument] = useState(null);

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    handleData(file);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    handleData(file);
  };

  const handleClipBoardEvent = async () => {
    try {
      const SUPPORTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

      if (!navigator.clipboard || !navigator.clipboard.read) {
        toast.error("Clipboard access not supported in this browser.");
        return;
      }
      const clipboardItems = await navigator.clipboard.read();

      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (SUPPORTED_TYPES.includes(type)) {
            const blob = await clipboardItem.getType(type);
            const file = new File(
              [blob],
              "pasted-image." + type.split("/")[1],
              { type: blob.type }
            );
            handleData(file);
            return;
          }
        }
      }

      toast.warning("Can't translate this file format");
    } catch (error) {
      console.error("Error reading clipboard:", error);
      toast.error("Unable to access clipboard. Please try again");
    }
  };

  const handleData = (file) => {
    const fileExtension = getFileExtension(file.name);
    if (file.size > 10 * 1024 * 1024) {
      // bigger than 10mb!
      toast.error("File too large");
      return;
    }

    if (!isSupportedFileType(fileExtension)) {
      toast.error(
        "Unsupported file type. Please upload a .jpg, .jpeg, .png, or .webp file."
      );
      return;
    }
    setFileName(file.name);
    setFileSize(file.size);

    const newFormData = new FormData();
    newFormData.append("file", file);
    newFormData.append("fromLanguage", fromLanguage);
    newFormData.append("toLanguage", toLanguage);
    setFormData(newFormData);
  };

  useEffect(() => {
    if (fileName) {
      // Update formData with new languages
      formData.set("fromLanguage", fromLanguage);
      formData.set("toLanguage", toLanguage);
      setFormData(formData);
    }
  }, [fromLanguage, toLanguage, formData, fileName]);

  const translateDoc = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${apiUrl}translate-image`,
        formData,
        {
          responseType: "blob", // Receive binary data
        }
      );

      // Determine the content type from the response headers
      const contentType = response.headers["content-type"];

      // Create a Blob object with the appropriate MIME type
      const blob = new Blob([response.data], { type: contentType });

      // Create a download URL
      const downloadUrl = window.URL.createObjectURL(blob);

      setTranslatedDocument(downloadUrl);
      setLoading(false);
    } catch (error) {
      console.error("Error translating document:", error);
      toast.error(
        "An error occurred while translating the document. Please try again later."
      );
      setLoading(false);
    }
  };

  const handleFolderReset = async () => {
    try {
      await axios.get(`${apiUrl}clear-uploads`);
    } catch (error) {
      console.log({ error: error.message });
      toast.info("Failed to clear upload folder");
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const getFileExtension = (fileName) => {
    return fileName.split(".").pop().toLowerCase();
  };

  const isSupportedFileType = (fileExtension) => {
    const supportedFileTypes = ["jpg", "jpeg", "png", "webp"];
    return supportedFileTypes.includes(fileExtension);
  };

  const handleCloseBox = async () => {
    setFileName("");
    setTranslatedDocument("");
    await handleFolderReset();
  };

  return (
    <>
      {!fileName && (
        <div className="container-fluid">
          <div className="drop-container">
            <div {...getRootProps()} className="drop-area">
              <input {...getInputProps()} accept=".jpg, .jpeg, .png, .webp" />
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
              <div className="container-flex">
                <div>
                  <label for="file-upload" class="custom-file-upload">
                    Browse your files
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    onChange={handleFileUpload}
                    accept=".jpg, .jpeg, .png, .webp"
                  />
                </div>
                <button class="paste-clipboard" onClick={handleClipBoardEvent}>
                  <Clipboard size={16} style={{ marginRight: "8px" }} />
                  <span>Paste from clipboard</span>
                </button>
              </div>
              <p>Supported file types: .jpg, .jpeg, .png, .webp</p>
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

export default Images;
