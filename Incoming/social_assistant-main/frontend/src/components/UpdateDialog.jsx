import { useState } from "react";
import { styles } from "../styles";
import { api } from "../services/api";

function UpdateDialog({ personName, onClose, onSuccess }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;

    setLoading(true);
    try {
      await api.updatePerson(personName, text);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to update:", error);
      alert(`Failed to update person: ${error.message}`);
    } finally {
      setLoading(false);
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
          position: "fixed",
          top: "35%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "#ffffff",
          padding: "20px",
          zIndex: 1000,
          width: "min(500px, 85vw)", // 响应式宽度：最大500px，但不超过视口85%
          maxWidth: "500px",
          fontFamily: "'JetBrains Mono', monospace",
          border: "1px solid #e0e0e0",
        }}
      >
        <div
          style={{ color: "#0ea5e9", marginBottom: "15px", fontSize: "14px" }}
        >
          &gt; Update: {personName}
        </div>

        <div style={{ color: "#666", marginBottom: "15px", fontSize: "12px" }}>
          Add additional information about this person:
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              handleSubmit();
            }
          }}
          placeholder="e.g., Works at Google as senior engineer, loves hiking..."
          style={{
            width: "calc(100% - 20px)",
            minHeight: "120px",
            padding: "10px",
            border: "1px solid #d1d5db",
            backgroundColor: "#f9fafb",
            color: "#374151",
            fontSize: "12px",
            fontFamily: "'JetBrains Mono', monospace",
            outline: "none",
            resize: "vertical",
            marginRight: "10px",
          }}
          autoFocus
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "20px",
            paddingTop: "15px",
            borderTop: "1px solid #e0e0e0",
          }}
        >
          <div style={{ fontSize: "12px", color: "#999" }}>
            Cmd+Enter to submit
          </div>

          <div style={{ display: "flex", gap: "15px" }}>
            <span onClick={onClose} style={styles.link}>
              [Cancel]
            </span>
            <span
              onClick={handleSubmit}
              style={loading ? styles.linkDisabled : styles.link}
            >
              {loading ? "[Updating...]" : "[Update]"}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export default UpdateDialog;
