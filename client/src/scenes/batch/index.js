import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import PageHeader from "../../components/PageHeader";
import { useNavigate } from "react-router-dom";

const BatchTranslate = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [languages, setLanguages] = useState([]);
  const [fromLanguage, setFromLanguage] = useState("Detect language");
  const [toLanguage, setToLanguage] = useState("English");

  let apiUrl;
  if (process.env.NODE_ENV === "development") {
    apiUrl = "http://localhost:4000/";
  } else if (process.env.NODE_ENV === "production") {
    apiUrl = "/";
  }

  useEffect(() => {
    const run = async () => {
      try {
        const response = await axios.get(`${apiUrl}languages`);
        setLanguages(response?.data || []);
      } catch (error) {
        toast.error("Failed to load languages.");
      }
    };
    run();
  }, [apiUrl]);

  const supportedFileNote = useMemo(() => {
    return "Supported: .pdf, .doc, .docx, .pptx, .xlsx (<= 10MB each)";
  }, []);

  const onDrop = (acceptedFiles) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return;
    setFiles((prev) => [...prev, ...acceptedFiles].slice(0, 25));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const translateBatch = async () => {
    if (files.length === 0) {
      toast.warning("Please add files first.");
      return;
    }

    if (!fromLanguage || !toLanguage) {
      toast.warning("Please select from/to languages.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));
      formData.append("fromLanguage", fromLanguage);
      formData.append("toLanguage", toLanguage);

      const response = await axios.post(
        `${apiUrl}batch/translate-documents-zip`,
        formData,
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], { type: "application/zip" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "translated_batch.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
      toast.success("Batch translation ready.");
    } catch (error) {
      const status = error?.response?.status;
      if (status === 401) toast.error("Please log in for batch translation.");
      else if (status === 403) {
        toast.error("Set up or select an organization for batch translation.");
        navigate("/organization");
      }
      else if (status === 402)
        toast.error("Subscription required for batch translation.");
      else toast.error("Batch translation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fromOptions = languages || [];
  const toOptions = languages?.filter((l) => l !== "Detect language") || [];

  return (
    <>
      <PageHeader />
      <div style={{ paddingBottom: "2rem", width: "100%" }}>
        <div style={{ color: "var(--text-primary)", marginBottom: "1rem" }}>
          <h1 style={{ margin: 0 }}>Batch Translation</h1>
          <p style={{ marginTop: "0.5rem", color: "var(--text-secondary)" }}>
            Upload multiple documents and download a translated ZIP.
          </p>
        </div>

        <div className="drop-container" style={{ padding: "0" }}>
          <div {...getRootProps()} className="drop-area" style={{ width: "100%" }}>
            <input {...getInputProps()} multiple accept=".pdf,.doc,.docx,.pptx,.xlsx,.xls" />
            {isDragActive ? (
              <p>Drop the files here...</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ fontWeight: 700, color: "#38BDF8" }}>
                  Drop files to translate
                </div>
                <div style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                  {supportedFileNote}
                </div>
              </div>
            )}
          </div>

          <hr className="line" aria-hidden="true" style={{ width: "100%" }} />

          <div className="browse-container" style={{ width: "100%", padding: "0 1rem" }}>
            <div style={{ width: "100%", display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 260px", minWidth: 220 }}>
                <label style={{ display: "block", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  From language
                </label>
                <select
                  value={fromLanguage}
                  onChange={(e) => setFromLanguage(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-color)",
                    background: "transparent",
                    color: "var(--text-primary)",
                  }}
                >
                  {fromOptions.map((l) => (
                    <option key={l} value={l}>
                      {l === "Detect language" ? "Detect language" : l}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ flex: "1 1 260px", minWidth: 220 }}>
                <label style={{ display: "block", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  To language
                </label>
                <select
                  value={toLanguage}
                  onChange={(e) => setToLanguage(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-color)",
                    background: "transparent",
                    color: "var(--text-primary)",
                  }}
                >
                  {toOptions.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {files.length > 0 && (
              <div style={{ marginTop: "16px" }}>
                <div style={{ color: "#38BDF8", fontWeight: 700, marginBottom: "8px" }}>
                  Files ({files.length})
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {files.map((f, idx) => (
                    <div
                      key={`${f.name}-${idx}`}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "12px",
                        padding: "10px 12px",
                        border: "1px solid var(--border-color)",
                        borderRadius: "8px",
                        background: "var(--bg-surface)",
                      }}
                    >
                      <div style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                        {f.name}
                      </div>
                      <button
                        onClick={() => removeFile(idx)}
                        style={{
                          border: "1px solid var(--border-color)",
                          background: "transparent",
                          borderRadius: "6px",
                          padding: "6px 10px",
                          cursor: "pointer",
                          color: "var(--text-secondary)",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                        }}
                        disabled={loading}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: "18px", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={translateBatch}
                className="translate-doc-btn"
                style={{
                  border: "none",
                  backgroundColor: "#1967D2",
                  opacity: loading ? 0.7 : 1,
                }}
                disabled={loading}
              >
                {loading ? "Translating..." : "Translate batch"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BatchTranslate;

