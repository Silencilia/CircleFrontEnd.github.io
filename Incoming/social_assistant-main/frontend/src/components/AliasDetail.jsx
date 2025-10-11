import { useState, useEffect } from "react";
import { styles } from "../styles";
import { api } from "../services/api";

function AliasDetail({ personName, onClose }) {
  const [aliasData, setAliasData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAlias, setNewAlias] = useState("");
  const [addingAlias, setAddingAlias] = useState(false);

  useEffect(() => {
    fetchAliases();
  }, [personName]);

  const fetchAliases = async () => {
    setLoading(true);
    try {
      const data = await api.getPersonAliases(personName);
      setAliasData(data);
    } catch (error) {
      console.error("Failed to fetch aliases:", error);
      setAliasData({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const getAliasTypeColor = (type) => {
    switch (type) {
      case "primary": return "#0ea5e9";
      case "confirmed": return "#10b981";
      case "learned": return "#f59e0b";
      case "manual": return "#8b5cf6";
      default: return "#666";
    }
  };

  const getAliasTypeLabel = (type) => {
    switch (type) {
      case "primary": return "Primary Name";
      case "confirmed": return "User Confirmed";
      case "learned": return "System Learned";
      case "manual": return "Manually Added";
      default: return "Unknown";
    }
  };

  const handleAddAlias = async () => {
    if (!newAlias.trim()) return;

    setAddingAlias(true);
    try {
      await api.addAlias(personName, newAlias.trim());
      setNewAlias("");
      setShowAddForm(false);
      // 重新获取数据
      await fetchAliases();
    } catch (error) {
      console.error("Failed to add alias:", error);
      alert(`Failed to add alias: ${error.message}`);
    } finally {
      setAddingAlias(false);
    }
  };

  const handleDeleteAlias = async (aliasName) => {
    if (!confirm(`Delete alias "${aliasName}"?`)) return;

    try {
      await api.removeAlias(personName, aliasName);
      // 重新获取数据
      await fetchAliases();
    } catch (error) {
      console.error("Failed to delete alias:", error);
      alert(`Failed to delete alias: ${error.message}`);
    }
  };

  return (
    <>
      {/* Background overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          zIndex: 999,
        }}
      />

      {/* Dialog */}
      <div
        style={{
          ...styles.dialog,
          backgroundColor: "#ffffff",
          border: "1px solid #e0e0e0",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "500px",
          maxHeight: "60vh",
          overflow: "auto",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "20px" }}>
          <span style={{ color: "#0ea5e9" }}>&gt;</span>
          <span style={{ color: "#2c3e50", marginLeft: "10px" }}>
            Aliases for: {personName}
          </span>
        </div>

        <div
          style={{
            borderTop: "1px solid #e0e0e0",
            paddingTop: "15px",
            marginBottom: "15px",
          }}
        />

        {loading ? (
          <div style={{ color: "#666", fontSize: "12px" }}>
            Loading aliases...
          </div>
        ) : aliasData?.error ? (
          <div style={{ color: "#ef4444", fontSize: "12px" }}>
            Error: {aliasData.error}
          </div>
        ) : aliasData ? (
          <div>
            {/* Primary Name */}
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <span
                  style={{
                    fontSize: "18px",
                    color: getAliasTypeColor("primary"),
                    marginRight: "8px",
                  }}
                >
                  ⭐
                </span>
                <span
                  style={{
                    fontSize: "14px",
                    color: "#2c3e50",
                    fontWeight: "bold",
                  }}
                >
                  {aliasData.primary || personName}
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    color: getAliasTypeColor("primary"),
                    marginLeft: "10px",
                    padding: "2px 6px",
                    backgroundColor: "rgba(14, 165, 233, 0.1)",
                    border: "1px solid rgba(14, 165, 233, 0.3)",
                  }}
                >
                  {getAliasTypeLabel("primary")}
                </span>
              </div>
            </div>

            {/* Confirmed Aliases */}
            {aliasData.confirmed && aliasData.confirmed.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginBottom: "10px",
                  }}
                >
                  Confirmed Aliases:
                </div>
                {aliasData.confirmed.map((alias, index) => {
                  const aliasName = alias.name || alias;
                  const isPrimary = aliasName === (aliasData.primary || personName);
                  
                  return (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "6px 0",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      <span style={{ fontSize: "12px", color: "#2c3e50" }}>
                        {aliasName}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {alias.confidence && (
                          <span style={{ fontSize: "10px", color: "#666" }}>
                            {(alias.confidence * 100).toFixed(0)}%
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: "10px",
                            color: getAliasTypeColor("confirmed"),
                            padding: "2px 4px",
                            backgroundColor: "rgba(16, 185, 129, 0.1)",
                            border: "1px solid rgba(16, 185, 129, 0.3)",
                          }}
                        >
                          Confirmed
                        </span>
                        {!isPrimary && (
                          <span
                            onClick={() => handleDeleteAlias(aliasName)}
                            style={{
                              color: "#ef4444",
                              cursor: "pointer",
                              fontSize: "12px",
                              padding: "2px 4px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "transparent";
                            }}
                          >
                            ×
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Learned Aliases */}
            {aliasData.learned && aliasData.learned.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginBottom: "10px",
                  }}
                >
                  System Learned:
                </div>
                {aliasData.learned.map((alias, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "6px 0",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <span style={{ fontSize: "12px", color: "#2c3e50" }}>
                      {alias.name || alias}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {alias.confidence && (
                        <span style={{ fontSize: "10px", color: "#666" }}>
                          {(alias.confidence * 100).toFixed(0)}%
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: "10px",
                          color: getAliasTypeColor("learned"),
                          padding: "2px 4px",
                          backgroundColor: "rgba(245, 158, 11, 0.1)",
                          border: "1px solid rgba(245, 158, 11, 0.3)",
                        }}
                      >
                        Learned
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Manual Aliases */}
            {aliasData.manual && aliasData.manual.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginBottom: "10px",
                  }}
                >
                  Manually Added:
                </div>
                {aliasData.manual.map((alias, index) => {
                  const aliasName = alias.name || alias;
                  
                  return (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "6px 0",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      <span style={{ fontSize: "12px", color: "#2c3e50" }}>
                        {aliasName}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span
                          style={{
                            fontSize: "10px",
                            color: getAliasTypeColor("manual"),
                            padding: "2px 4px",
                            backgroundColor: "rgba(139, 92, 246, 0.1)",
                            border: "1px solid rgba(139, 92, 246, 0.3)",
                          }}
                        >
                          Manual
                        </span>
                        <span
                          onClick={() => handleDeleteAlias(aliasName)}
                          style={{
                            color: "#ef4444",
                            cursor: "pointer",
                            fontSize: "12px",
                            padding: "2px 4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }}
                        >
                          ×
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* No aliases found */}
            {(!aliasData.confirmed || aliasData.confirmed.length === 0) &&
             (!aliasData.learned || aliasData.learned.length === 0) &&
             (!aliasData.manual || aliasData.manual.length === 0) && (
              <div style={{ 
                color: "#666", 
                fontSize: "12px", 
                fontStyle: "italic",
                textAlign: "center",
                padding: "20px"
              }}>
                No aliases found for this person.
              </div>
            )}
          </div>
        ) : (
          <div style={{ color: "#666", fontSize: "12px" }}>
            No data available
          </div>
        )}

        {/* Add Alias Form */}
        {showAddForm ? (
          <div
            style={{
              borderTop: "1px solid #e0e0e0",
              paddingTop: "15px",
              marginTop: "20px",
              marginBottom: "20px",
            }}
          >
            <div style={{ marginBottom: "10px" }}>
              <span style={{ fontSize: "12px", color: "#666" }}>
                Add new alias:
              </span>
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <input
                type="text"
                value={newAlias}
                onChange={(e) => setNewAlias(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !addingAlias) {
                    handleAddAlias();
                  } else if (e.key === "Escape") {
                    setShowAddForm(false);
                    setNewAlias("");
                  }
                }}
                placeholder="Enter alias name..."
                style={{
                  flex: 1,
                  padding: "6px 8px",
                  border: "1px solid #d1d5db",
                  fontSize: "12px",
                  fontFamily: "'JetBrains Mono', monospace",
                  outline: "none",
                  backgroundColor: "#f9fafb",
                  color: "#374151",
                }}
                autoFocus
              />
              <span
                onClick={handleAddAlias}
                style={{
                  ...styles.link,
                  color: addingAlias ? "#666" : "#10b981",
                  cursor: addingAlias ? "not-allowed" : "pointer",
                  opacity: addingAlias ? 0.5 : 1,
                }}
              >
                {addingAlias ? "[Adding...]" : "[Add]"}
              </span>
              <span
                onClick={() => {
                  setShowAddForm(false);
                  setNewAlias("");
                }}
                style={styles.link}
              >
                [Cancel]
              </span>
            </div>
          </div>
        ) : null}

        {/* Action buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "15px",
            paddingTop: "20px",
            borderTop: "1px solid #e0e0e0",
            marginTop: "20px",
          }}
        >
          {!showAddForm && (
            <span
              onClick={() => setShowAddForm(true)}
              style={{
                ...styles.link,
                color: "#10b981",
              }}
            >
              [Add Alias]
            </span>
          )}
          <span onClick={onClose} style={styles.link}>
            [Close]
          </span>
        </div>
      </div>
    </>
  );
}

export default AliasDetail;
