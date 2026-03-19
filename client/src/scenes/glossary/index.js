import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import PageHeader from "../../components/PageHeader";
import { useNavigate } from "react-router-dom";

const Glossary = () => {
  const navigate = useNavigate();
  const [glossaries, setGlossaries] = useState([]);
  const [selectedGlossaryId, setSelectedGlossaryId] = useState(null);
  const [selectedGlossary, setSelectedGlossary] = useState(null);
  const [entries, setEntries] = useState([]);

  const [loading, setLoading] = useState(false);

  // Glossary create
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  // Glossary edit (for selected glossary)
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Entry create/edit
  const [fromLanguage, setFromLanguage] = useState("");
  const [toLanguage, setToLanguage] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [targetText, setTargetText] = useState("");
  const [notes, setNotes] = useState("");

  const [editingEntryId, setEditingEntryId] = useState(null);

  let apiUrl;
  if (process.env.NODE_ENV === "development") {
    apiUrl = "http://localhost:4000/";
  } else if (process.env.NODE_ENV === "production") {
    apiUrl = "/";
  }

  const resetEntryForm = () => {
    setFromLanguage("");
    setToLanguage("");
    setSourceText("");
    setTargetText("");
    setNotes("");
    setEditingEntryId(null);
  };

  const handleAuthzError = (error, fallbackMessage) => {
    const status = error?.response?.status;
    const message = String(error?.response?.data?.message || "");

    if (status === 401) {
      toast.error("Please log in to access glossary features.");
      return true;
    }

    if (status === 403 && message.toLowerCase().includes("organization")) {
      toast.error("Set up or select an organization to access glossary features.");
      navigate("/organization");
      return true;
    }

    if (status === 403) {
      toast.error("Admin/owner role required to manage glossary entries.");
      return true;
    }

    if (status === 402) {
      toast.error("Subscription required for glossary features.");
      return true;
    }

    if (fallbackMessage) toast.error(fallbackMessage);
    return false;
  };

  const refreshGlossaries = async () => {
    const response = await axios.get(`${apiUrl}glossaries`);
    const list = response?.data?.glossaries || [];
    setGlossaries(list);
    if (!selectedGlossaryId && list.length > 0) {
      setSelectedGlossaryId(list[0]._id);
    }
  };

  const loadSelectedGlossary = async (glossaryId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}glossaries/${glossaryId}`);
      setSelectedGlossary(response?.data?.glossary || null);
      setEntries(response?.data?.entries || []);
      setEditName(response?.data?.glossary?.name || "");
      setEditDescription(response?.data?.glossary?.description || "");
      resetEntryForm();
    } catch (error) {
      handleAuthzError(error, "Failed to load glossary.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshGlossaries().catch((error) => handleAuthzError(error, "Failed to load glossaries."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedGlossaryId) loadSelectedGlossary(selectedGlossaryId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGlossaryId]);

  useEffect(() => {
    // keep edit fields in sync if selectedGlossary changes externally
    if (selectedGlossary) {
      setEditName(selectedGlossary.name || "");
      setEditDescription(selectedGlossary.description || "");
    }
  }, [selectedGlossary]);

  const handleCreateGlossary = async () => {
    if (!newName.trim()) {
      toast.warning("Glossary name is required.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${apiUrl}glossaries`, {
        name: newName.trim(),
        description: newDescription,
      });
      setNewName("");
      setNewDescription("");
      await refreshGlossaries();
      toast.success("Glossary created.");
    } catch (error) {
      handleAuthzError(error, "Failed to create glossary.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGlossary = async () => {
    if (!selectedGlossaryId) return;
    setLoading(true);
    try {
      await axios.patch(`${apiUrl}glossaries/${selectedGlossaryId}`, {
        name: editName,
        description: editDescription,
      });
      toast.success("Glossary updated.");
      await loadSelectedGlossary(selectedGlossaryId);
    } catch (error) {
      handleAuthzError(error, "Failed to update glossary.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGlossary = async () => {
    if (!selectedGlossaryId) return;
    const ok = window.confirm("Delete this glossary and all its entries?");
    if (!ok) return;
    setLoading(true);
    try {
      await axios.delete(`${apiUrl}glossaries/${selectedGlossaryId}`);
      toast.success("Glossary deleted.");
      setSelectedGlossaryId(null);
      await refreshGlossaries();
      setSelectedGlossary(null);
      setEntries([]);
    } catch (error) {
      handleAuthzError(error, "Failed to delete glossary.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartEditEntry = (entry) => {
    setEditingEntryId(entry._id);
    setFromLanguage(entry.fromLanguage || "");
    setToLanguage(entry.toLanguage || "");
    setSourceText(entry.sourceText || "");
    setTargetText(entry.targetText || "");
    setNotes(entry.notes || "");
  };

  const handleSaveEntry = async () => {
    if (!selectedGlossaryId) return;
    if (!sourceText.trim() || !targetText.trim()) {
      toast.warning("Both sourceText and targetText are required.");
      return;
    }

    setLoading(true);
    try {
      if (!editingEntryId) {
        await axios.post(`${apiUrl}glossaries/${selectedGlossaryId}/entries`, {
          fromLanguage: fromLanguage || null,
          toLanguage: toLanguage || null,
          sourceText: sourceText.trim(),
          targetText: targetText.trim(),
          notes: notes || "",
        });
        toast.success("Entry added.");
      } else {
        await axios.patch(
          `${apiUrl}glossaries/${selectedGlossaryId}/entries/${editingEntryId}`,
          {
            fromLanguage: fromLanguage || null,
            toLanguage: toLanguage || null,
            sourceText: sourceText.trim(),
            targetText: targetText.trim(),
            notes: notes || "",
          }
        );
        toast.success("Entry updated.");
      }

      await loadSelectedGlossary(selectedGlossaryId);
      resetEntryForm();
    } catch (error) {
      handleAuthzError(error, "Failed to save entry.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!selectedGlossaryId) return;
    const ok = window.confirm("Delete this entry?");
    if (!ok) return;
    setLoading(true);
    try {
      await axios.delete(
        `${apiUrl}glossaries/${selectedGlossaryId}/entries/${entryId}`
      );
      toast.success("Entry deleted.");
      await loadSelectedGlossary(selectedGlossaryId);
      resetEntryForm();
    } catch (error) {
      handleAuthzError(error, "Failed to delete entry.");
    } finally {
      setLoading(false);
    }
  };

  const glossaryList = useMemo(() => glossaries || [], [glossaries]);

  return (
    <>
      <PageHeader />
      <div style={{ paddingBottom: "2.5rem" }}>
        <div
          style={{
            color: "var(--text-primary)",
            display: "flex",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
            alignItems: "flex-end",
            marginBottom: "1.25rem",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: "1.95rem", lineHeight: 1.2 }}>Glossary</h1>
            <p style={{ marginTop: "0.45rem", color: "var(--text-secondary)", fontSize: "0.97rem" }}>
              Organization glossary CRUD (admin/owner)
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: "1 1 320px", minWidth: 280 }}>
            <div
              style={{
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                padding: "18px",
                background: "var(--bg-surface)",
              }}
            >
              <div style={{ color: "#38BDF8", fontWeight: 600, marginBottom: "10px" }}>
                Your glossaries
              </div>
              {glossaryList.length === 0 ? (
                <div style={{ color: "var(--text-secondary)" }}>
                  No glossaries yet. Create one below.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {glossaryList.map((g) => (
                    <div
                      key={g._id}
                      onClick={() => setSelectedGlossaryId(g._id)}
                      style={{
                        cursor: "pointer",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border:
                          selectedGlossaryId === g._id
                            ? "1px solid #38BDF8"
                            : "1px solid var(--border-color)",
                      }}
                    >
                      <div style={{ color: "var(--text-primary)", fontWeight: 600 }}>{g.name}</div>
                      <div style={{ color: "var(--text-secondary)", marginTop: "4px" }}>
                        {g.description || ""}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <hr style={{ border: 0, borderTop: "1px solid var(--border-color)", margin: "14px 0" }} />

              <div style={{ color: "#38BDF8", fontWeight: 600, marginBottom: "10px" }}>
                Create glossary
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Glossary name"
                  style={{ padding: "10px 12px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "transparent", color: "var(--text-primary)" }}
                />
                <input
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Description (optional)"
                  style={{ padding: "10px 12px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "transparent", color: "var(--text-primary)" }}
                />
                <button
                  onClick={handleCreateGlossary}
                  style={{
                    border: "none",
                    borderRadius: "6px",
                    padding: "10px 16px",
                    cursor: "pointer",
                    background: "#1967D2",
                    color: "var(--text-primary)",
                    fontWeight: 600,
                    minHeight: "40px",
                  }}
                  disabled={loading}
                >
                  Create
                </button>
              </div>
            </div>
          </div>

          <div style={{ flex: "2 1 520px", minWidth: 320 }}>
            {!selectedGlossary ? (
              <div
                style={{
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  padding: "18px",
                  background: "var(--bg-surface)",
                  color: "var(--text-secondary)",
                }}
              >
                Select a glossary on the left.
              </div>
            ) : (
              <div
                style={{
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  padding: "18px",
                  background: "var(--bg-surface)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                  <div>
                    <div style={{ color: "#38BDF8", fontWeight: 700, marginBottom: "8px" }}>
                      Glossary details
                    </div>
                  </div>
                  <button
                    onClick={handleDeleteGlossary}
                    style={{
                      border: "1px solid var(--border-color)",
                      background: "transparent",
                      borderRadius: "6px",
                      padding: "10px 14px",
                      cursor: "pointer",
                      color: "var(--text-secondary)",
                      fontWeight: 600,
                    }}
                    disabled={loading}
                  >
                    Delete glossary
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px", marginTop: "8px" }}>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Glossary name"
                    style={{ padding: "10px 12px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "transparent", color: "var(--text-primary)" }}
                  />
                  <input
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Description"
                    style={{ padding: "10px 12px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "transparent", color: "var(--text-primary)" }}
                  />
                  <button
                    onClick={handleUpdateGlossary}
                    style={{
                      border: "none",
                      borderRadius: "6px",
                      padding: "10px 16px",
                      cursor: "pointer",
                      background: "#38BDF8",
                      color: "#0b1220",
                      fontWeight: 700,
                      width: "fit-content",
                    }}
                    disabled={loading}
                  >
                    Save changes
                  </button>
                </div>

                <hr style={{ border: 0, borderTop: "1px solid var(--border-color)", margin: "14px 0" }} />

                <div style={{ color: "#38BDF8", fontWeight: 700, marginBottom: "10px" }}>
                  {editingEntryId ? "Edit entry" : "Add entry"}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <input
                    value={fromLanguage}
                    onChange={(e) => setFromLanguage(e.target.value)}
                    placeholder="From language (optional)"
                    style={{ padding: "10px 12px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "transparent", color: "var(--text-primary)" }}
                  />
                  <input
                    value={toLanguage}
                    onChange={(e) => setToLanguage(e.target.value)}
                    placeholder="To language (optional)"
                    style={{ padding: "10px 12px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "transparent", color: "var(--text-primary)" }}
                  />
                  <input
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    placeholder="Source text"
                    style={{ padding: "10px 12px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "transparent", color: "var(--text-primary)" }}
                  />
                  <input
                    value={targetText}
                    onChange={(e) => setTargetText(e.target.value)}
                    placeholder="Target text"
                    style={{ padding: "10px 12px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "transparent", color: "var(--text-primary)" }}
                  />
                </div>
                <div style={{ marginTop: "10px" }}>
                  <input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Notes (optional)"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "transparent", color: "var(--text-primary)" }}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "12px", flexWrap: "wrap" }}>
                  <button
                    onClick={handleSaveEntry}
                    style={{
                      border: "none",
                      borderRadius: "6px",
                      padding: "10px 16px",
                      cursor: "pointer",
                      background: "#1967D2",
                      color: "var(--text-primary)",
                      fontWeight: 700,
                    }}
                    disabled={loading}
                  >
                    {editingEntryId ? "Save entry" : "Add entry"}
                  </button>
                  {editingEntryId && (
                    <button
                      onClick={resetEntryForm}
                      style={{
                        border: "1px solid var(--border-color)",
                        background: "transparent",
                        borderRadius: "6px",
                        padding: "10px 14px",
                        cursor: "pointer",
                        color: "var(--text-secondary)",
                        fontWeight: 600,
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <hr style={{ border: 0, borderTop: "1px solid var(--border-color)", margin: "14px 0" }} />

                <div style={{ color: "#38BDF8", fontWeight: 700, marginBottom: "10px" }}>
                  Entries ({entries.length})
                </div>

                {entries.length === 0 ? (
                  <div style={{ color: "var(--text-secondary)" }}>
                    No entries yet.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {entries.map((e) => (
                      <div
                        key={e._id}
                        style={{
                          border: "1px solid var(--border-color)",
                          borderRadius: "8px",
                          padding: "12px 12px",
                          background: "var(--bg-main)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                          <div style={{ minWidth: 240 }}>
                            <div style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                              {e.sourceText}
                            </div>
                            <div style={{ color: "#38BDF8", fontWeight: 700, marginTop: "6px" }}>
                              {e.targetText}
                            </div>
                            {(e.fromLanguage || e.toLanguage) && (
                              <div style={{ color: "var(--text-secondary)", marginTop: "6px" }}>
                                {e.fromLanguage ? `From: ${e.fromLanguage}` : ""}
                                {e.fromLanguage && e.toLanguage ? " • " : ""}
                                {e.toLanguage ? `To: ${e.toLanguage}` : ""}
                              </div>
                            )}
                          </div>
                          <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                            <button
                              onClick={() => handleStartEditEntry(e)}
                              style={{
                                border: "1px solid var(--border-color)",
                                background: "transparent",
                                borderRadius: "6px",
                                padding: "10px 12px",
                                cursor: "pointer",
                                color: "var(--text-secondary)",
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                              }}
                              disabled={loading}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteEntry(e._id)}
                              style={{
                                border: "1px solid var(--border-color)",
                                background: "transparent",
                                borderRadius: "6px",
                                padding: "10px 12px",
                                cursor: "pointer",
                                color: "var(--text-secondary)",
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                              }}
                              disabled={loading}
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {e.notes ? (
                          <div style={{ color: "var(--text-secondary)", marginTop: "8px", fontSize: "12px" }}>
                            Notes: {e.notes}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Glossary;

