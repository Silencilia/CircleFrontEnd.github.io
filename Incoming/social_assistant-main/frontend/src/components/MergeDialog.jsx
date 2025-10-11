import { useState, useEffect } from "react";
import { styles } from "../styles";
import { api } from "../services/api";

function MergeDialog({ sourcePerson, allPeople, onClose, onSuccess }) {
  const [targetPerson, setTargetPerson] = useState("");
  const [processing, setProcessing] = useState(false);

  // 过滤掉源人物
  const availableTargets = allPeople.filter((p) => p !== sourcePerson);

  const handleMerge = async () => {
    if (!targetPerson) {
      alert("Please select a target person");
      return;
    }

    if (
      !confirm(
        `Merge all interactions from "${sourcePerson}" into "${targetPerson}"?\n\nThis cannot be undone.`
      )
    ) {
      return;
    }

    setProcessing(true);
    try {
      await api.merge(sourcePerson, targetPerson);
      onSuccess();
    } catch (error) {
      console.error("Merge failed:", error);
      alert(`Merge failed: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
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

      <div
        style={{
          position: "fixed",
          top: "35%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "#ffffff",
          padding: "20px",
          zIndex: 1000,
          width: "min(450px, 85vw)", // 响应式宽度：最大450px，但不超过视口85%
          maxWidth: "450px",
          fontFamily: "'JetBrains Mono', monospace",
          border: "1px solid #e0e0e0",
        }}
      >
        <div
          style={{ color: "#0ea5e9", marginBottom: "15px", fontSize: "14px" }}
        >
          &gt; Merge Person
        </div>

        <div style={{ marginBottom: "20px" }}>
          <div
            style={{ color: "#666", marginBottom: "10px", fontSize: "12px" }}
          >
            Merging from:{" "}
            <strong style={{ color: "#2c3e50" }}>{sourcePerson}</strong>
          </div>

          <div
            style={{ color: "#666", marginBottom: "15px", fontSize: "12px" }}
          >
            Select target person to merge into:
          </div>

          <div
            style={{
              maxHeight: "200px",
              overflow: "auto",
              border: "1px solid #e0e0e0",
              padding: "10px",
              marginBottom: "15px",
            }}
          >
            {availableTargets.map((person, index) => (
              <div
                key={person}
                onClick={() => setTargetPerson(person)}
                style={{
                  padding: "8px",
                  marginBottom: "5px",
                  cursor: "pointer",
                  backgroundColor:
                    targetPerson === person ? "#f0f8ff" : "transparent",
                  border:
                    targetPerson === person
                      ? "1px solid #0ea5e9"
                      : "1px solid transparent",

                  fontSize: "12px",
                  color: "#2c3e50",
                }}
                onMouseEnter={(e) => {
                  if (targetPerson !== person) {
                    e.target.style.backgroundColor = "#f8f9fa";
                  }
                }}
                onMouseLeave={(e) => {
                  if (targetPerson !== person) {
                    e.target.style.backgroundColor = "transparent";
                  }
                }}
              >
                {person}
              </div>
            ))}
          </div>

          {targetPerson && (
            <div
              style={{
                padding: "10px",
                backgroundColor: "#fff3cd",
                border: "1px solid #ffc107",

                fontSize: "11px",
                color: "#856404",
                marginBottom: "15px",
              }}
            >
              ⚠️ All interactions from <strong>{sourcePerson}</strong> will be
              moved to <strong>{targetPerson}</strong>. The person{" "}
              <strong>{sourcePerson}</strong> will be deleted.
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "15px",
            paddingTop: "15px",
            borderTop: "1px solid #e0e0e0",
          }}
        >
          <span onClick={onClose} style={styles.link}>
            [Cancel]
          </span>
          <span
            onClick={handleMerge}
            style={
              processing || !targetPerson ? styles.linkDisabled : styles.link
            }
          >
            {processing ? "[Merging...]" : "[Merge]"}
          </span>
        </div>
      </div>
    </>
  );
}

export default MergeDialog;
