import { useState } from "react";
import { styles } from "../styles";
import PersonDetail from "./PersonDetail";

function ConnectionDetail({ connection, onClose }) {
  const [selectedPerson, setSelectedPerson] = useState(null);

  // 如果点击了人名，显示PersonDetail
  if (selectedPerson) {
    return (
      <PersonDetail
        personName={selectedPerson}
        onClose={() => setSelectedPerson(null)}
      />
    );
  }

  // 识别文本中的人名（简单版本 - 识别大写开头的词）
  const renderTextWithLinks = (text) => {
    const words = text.split(" ");
    return words.map((word, index) => {
      // 检查是否像人名（大写开头，不是常见词）
      const isName =
        /^[A-Z][a-z]+/.test(word) &&
        ![
          "The",
          "This",
          "That",
          "These",
          "Those",
          "What",
          "When",
          "Where",
          "Who",
          "Why",
          "How",
        ].includes(word);

      if (isName) {
        const cleanName = word.replace(/[.,!?;:]$/, ""); // 去掉标点
        return (
          <span key={index}>
            <span
              onClick={() => setSelectedPerson(cleanName)}
              style={{
                textDecoration: "underline",
                color: "#0ea5e9",
                cursor: "pointer",
              }}
            >
              {cleanName}
            </span>
            {word.slice(cleanName.length)}{" "}
          </span>
        );
      }
      return word + " ";
    });
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
          width: "600px",
          padding: "30px",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "15px" }}>
          <span style={{ color: "#0ea5e9" }}>&gt;</span>
          <span style={{ color: "#2c3e50", marginLeft: "10px" }}>
            Connection
          </span>
        </div>

        <div
          style={{
            borderTop: "1px solid #e0e0e0",
            paddingTop: "20px",
            marginBottom: "20px",
          }}
        >
          {/* Timestamp */}
          <div
            style={{ color: "#666", fontSize: "12px", marginBottom: "15px" }}
          >
            {connection.metadata?.timestamp || "Unknown time"}
          </div>

          {/* Main content with clickable names */}
          <div
            style={{
              color: "#2c3e50",
              fontSize: "12px",
              lineHeight: "1.8",
            }}
          >
            {renderTextWithLinks(connection.document)}
          </div>
        </div>

        {/* Close button */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingTop: "15px",
            borderTop: "1px solid #e0e0e0",
          }}
        >
          <span onClick={onClose} style={styles.link}>
            [Close]
          </span>
        </div>
      </div>
    </>
  );
}

export default ConnectionDetail;
