import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import PageHeader from "../../components/PageHeader";

const Glossary = () => {
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
      toast.error("Failed to load glossary.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshGlossaries().catch(() => {});
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
      const status = error?.response?.status;
      if (status === 403) toast.error("Admin/owner role required to manage glossaries.");
      else toast.error("Failed to create glossary.");
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
      const status = error?.response?.status;
      if (status === 403) toast.error("Admin/owner role required to manage glossaries.");
      else toast.error("Failed to update glossary.");
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
      const status = error?.response?.status;
      if (status === 403) toast.error("Admin/owner role required to manage glossaries.");
      else toast.error("Failed to delete glossary.");
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
      const status = error?.response?.status;
      if (status === 403) toast.error("Admin/owner role required to manage glossary entries.");
      else toast.error("Failed to save entry.");
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
      const status = error?.response?.status;
      if (status === 403) toast.error("Admin/owner role required to manage glossary entries.");
      else toast.error("Failed to delete entry.");
    } finally {
      setLoading(false);
    }
  };

  const glossaryList = useMemo(() => glossaries || [], [glossaries]);

  return (
    <>
      <PageHeader />
      <div style={{ paddingBottom: "2rem" }}>
        <div
          style={{
            color: "#f5f5f5",
            display: "flex",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
            alignItems: "flex-end",
            marginBottom: "1rem",
          }}
        >
          <div>
            <h1 style={{ margin: 0 }}>Glossary</h1>
            <p style={{ marginTop: "0.5rem", color: "rgb(148 163 184)" }}>
              Organization glossary CRUD (admin/owner)
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: "1 1 320px", minWidth: 280 }}>
            <div
              style={{
                border: "1px solid rgb(100 116 139)",
                borderRadius: "8px",
                padding: "16px",
                background: "rgba(2, 6, 23, 0.6)",
              }}
            >
              <div style={{ color: "#38BDF8", fontWeight: 600, marginBottom: "10px" }}>
                Your glossaries
              </div>
              {glossaryList.length === 0 ? (
                <div style={{ color: "rgb(148 163 184)" }}>
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
                            : "1px solid rgb(100 116 139)",
                      }}
                    >
                      <div style={{ color: "#f5f5f5", fontWeight: 600 }}>{g.name}</div>
                      <div style={{ color: "rgb(148 163 184)", marginTop: "4px" }}>
                        {g.description || ""}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <hr style={{ border: 0, borderTop: "1px solid rgb(30 41 59)", margin: "14px 0" }} />

              <div style={{ color: "#38BDF8", fontWeight: 600, marginBottom: "10px" }}>
                Create glossary
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Glossary name"
                  style={{ padding: "10px 12px", borderRadius: "6px", border: "1px solid rgb(100 116 139)", background: "transparent", color: "#f5f5f5" }}
                />
                <input
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Description (optional)"
                  style={{ padding: "10px 12px", borderRadius: "6px", border: "1px solid rgb(100 116 139)", background: "transparent", color: "#f5f5f5" }}
                />
                <button
                  onClick={handleCreateGlossary}
                  style={{
                    border: "none",
                    borderRadius: "6px",
                    padding: "10px 16px",
                    cursor: "pointer",
                    background: "#1967D2",
                    color: "#f5f5f5",
                    fontWeight: 600,
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
                  border: "1px solid rgb(100 116 139)",
                  borderRadius: "8px",
                  padding: "16px",
                  background: "rgba(2, 6, 23, 0.6)",
                  color: "rgb(148 163 184)",
                }}
              >
                Select a glossary on the left.
              </div>
            ) : (
              <div
                style={{
                  border: "1px solid rgb(100 116 139)",
                  borderRadius: "8px",
                  padding: "16px",
                  background: "rgba(2, 6, 23, 0.6)",
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
                      border: "1px solid rgb(100 116 139)",
                      background: "transparent",
                      borderRadius: "6px",
                      padding: "10px 14px",
                      cursor: "pointer",
                      color: "rgb(203 213 225)",
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
                    style={{ padding: "10px 12px", borderRadius: "6px", border: "1px solid rgb(100 116 139)", background: "transparent", color: "#f5f5f5" }}
                  />
                  <input
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Description"
                    style={{ padding: "10px 12px", borderRadius: "6px", border: "1px solid rgb(100 116 139)", background: "transparent", color: "#f5f5f5" }}
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

                <hr style={{ border: 0, borderTop: "1px solid rgb(30 41 59)", margin: "14px 0" }} />

                <div style={{ color: "#38BDF8", fontWeight: 700, marginBottom: "10px" }}>
                  {editingEntryId ? "Edit entry" : "Add entry"}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <input
                    value={fromLanguage}
                    onChange={(e) => setFromLanguage(e.target.value)}
                    placeholder="From language (optional)"
                    style={{ padding: "10px 12px", borderRadius: "6px", border: "1px solid rgb(100 116 139)", background: "transparent", color: "#f5f5f5" }}
                  />
                  <input
                    value={toLanguage}
                    onChange={(e) => setToLanguage(e.target.value)}
                    placeholder="To language (optional)"
                    style={{ padding: "10px 12px", borderRadius: "6px", border: "1px solid rgb(100 116 139)", background: "transparent", color: "#f5f5f5" }}
                  />
                  <input
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    placeholder="Source text"
                    style={{ padding: "10px 12px", borderRadius: "6px", border: "1px solid rgb(100 116 139)", background: "transparent", color: "#f5f5f5" }}
                  />
                  <input
                    value={targetText}
                    onChange={(e) => setTargetText(e.target.value)}
                    placeholder="Target text"
                    style={{ padding: "10px 12px", borderRadius: "6px", border: "1px solid rgb(100 116 139)", background: "transparent", color: "#f5f5f5" }}
                  />
                </div>
                <div style={{ marginTop: "10px" }}>
                  <input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Notes (optional)"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid rgb(100 116 139)", background: "transparent", color: "#f5f5f5" }}
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
                      color: "#f5f5f5",
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
                        border: "1px solid rgb(100 116 139)",
                        background: "transparent",
                        borderRadius: "6px",
                        padding: "10px 14px",
                        cursor: "pointer",
                        color: "rgb(203 213 225)",
                        fontWeight: 600,
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <hr style={{ border: 0, borderTop: "1px solid rgb(30 41 59)", margin: "14px 0" }} />

                <div style={{ color: "#38BDF8", fontWeight: 700, marginBottom: "10px" }}>
                  Entries ({entries.length})
                </div>

                {entries.length === 0 ? (
                  <div style={{ color: "rgb(148 163 184)" }}>
                    No entries yet.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {entries.map((e) => (
                      <div
                        key={e._id}
                        style={{
                          border: "1px solid rgb(100 116 139)",
                          borderRadius: "8px",
                          padding: "12px 12px",
                          background: "rgba(2, 6, 23, 0.4)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                          <div style={{ minWidth: 240 }}>
                            <div style={{ color: "#f5f5f5", fontWeight: 700 }}>
                              {e.sourceText}
                            </div>
                            <div style={{ color: "#38BDF8", fontWeight: 700, marginTop: "6px" }}>
                              {e.targetText}
                            </div>
                            {(e.fromLanguage || e.toLanguage) && (
                              <div style={{ color: "rgb(148 163 184)", marginTop: "6px" }}>
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
                                border: "1px solid rgb(100 116 139)",
                                background: "transparent",
                                borderRadius: "6px",
                                padding: "10px 12px",
                                cursor: "pointer",
                                color: "rgb(203 213 225)",
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
                                border: "1px solid rgb(100 116 139)",
                                background: "transparent",
                                borderRadius: "6px",
                                padding: "10px 12px",
                                cursor: "pointer",
                                color: "rgb(203 213 225)",
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
                          <div style={{ color: "rgb(148 163 184)", marginTop: "8px", fontSize: "12px" }}>
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

