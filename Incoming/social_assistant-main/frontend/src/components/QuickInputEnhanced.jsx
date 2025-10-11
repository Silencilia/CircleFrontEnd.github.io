import { useState } from "react";
import EditableDragSelectText from "./EditableDragSelectText";

/**
 * 增强版QuickInput组件
 * 集成拖动选择功能，支持传统输入和名字拖选两种模式
 */
function QuickInputEnhanced({ onSubmit, fontStyle }) {
  const [text, setText] = useState("");
  const [selectedNames, setSelectedNames] = useState([]);
  const [isDragMode, setIsDragMode] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyDown = (e) => {
    // Enter 提交，Shift+Enter 换行
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    // 如果有选中的名字，传递给父组件
    if (selectedNames.length > 0) {
      onSubmit(trimmedText, selectedNames);
    } else {
      // 传统流程
      onSubmit(trimmedText);
    }
    
    // 重置状态
    setText("");
    setSelectedNames([]);
    setIsDragMode(false);
  };

  const handleNameSelection = (names) => {
    setSelectedNames(Array.isArray(names) ? names : []);
  };

  const toggleDragMode = () => {
    setIsDragMode(!isDragMode);
    setSelectedNames([]); // 切换模式时清除选择
  };

  const clearSelections = () => {
    setSelectedNames([]);
  };

  return (
    <div
      style={{
        position: "relative",
        zIndex: 1,
        marginTop: "0px",
        display: "flex",
        alignItems: "flex-start",
        width: "100%",
      }}
    >
      {/* 命令行提示符 */}
      <span
        style={{
          color: fontStyle === "tech" ? "#2c3e50" : "#999",
          fontSize: fontStyle === "handwritten" ? "12px" : "12px",
          lineHeight: "28px",
          paddingTop: "10px",
          marginRight: "8px",
          fontFamily:
            fontStyle === "handwritten"
              ? "'Kalam', cursive"
              : "'JetBrains Mono', monospace",
        }}
      >
        &gt;
      </span>

      <div style={{ position: "relative", width: "100%" }}>
        {/* 模式切换按钮 */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: "8px"
        }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={toggleDragMode}
              style={{
                backgroundColor: isDragMode ? "#3b82f6" : "#e5e7eb",
                color: isDragMode ? "white" : "#374151",
                border: "1px solid #d1d5db",
                padding: "4px 8px",
                fontSize: "10px",
                cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace"
              }}
              title="Toggle drag selection mode"
            >
              {isDragMode ? "🎯 Drag Mode" : "📝 Type Mode"}
            </button>
            
            {selectedNames.length > 0 && (
              <button
                onClick={clearSelections}
                style={{
                  backgroundColor: "#ef4444",
                  color: "white",
                  border: "1px solid #dc2626",
                  padding: "4px 8px",
                  fontSize: "10px",
                  cursor: "pointer",
                  fontFamily: "'JetBrains Mono', monospace"
                }}
                title="Clear selected names"
              >
                Clear ({selectedNames.length})
              </button>
            )}
          </div>

          {selectedNames.length > 0 && (
            <button
              onClick={handleSubmit}
              style={{
                backgroundColor: "#10b981",
                color: "white",
                border: "1px solid #059669",
                padding: "4px 12px",
                fontSize: "10px",
                cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace"
              }}
              title="Submit with selected names"
            >
              Submit with Names
            </button>
          )}
        </div>

        {/* 输入区域 */}
        {isDragMode ? (
          // 拖选模式
          <EditableDragSelectText
            value={text}
            onChange={(e) => setText(e.target.value)}
            onSelection={handleNameSelection}
            placeholder="Enter text and drag to select names..."
            fontStyle={fontStyle}
            style={{
              minHeight: "280px"
            }}
          />
        ) : (
          // 传统输入模式
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Start writing here..."
            className={fontStyle}
            style={{
              width: "100%",
              minHeight: "280px",
              padding: "0",
              paddingTop: "10px",
              border: "none",
              backgroundColor: "transparent",
              fontSize: fontStyle === "handwritten" ? "12px" : "12px",
              lineHeight: "28px",
              outline: "none",
              resize: "vertical",
              color: fontStyle === "tech" ? "#2c3e50" : "#2c3e50",
              fontFamily:
                fontStyle === "handwritten"
                  ? "'Kalam', cursive"
                  : "'JetBrains Mono', monospace",
            }}
            autoFocus={!isDragMode}
          />
        )}

        {/* 选中名字预览 */}
        {selectedNames.length > 0 && (
          <div style={{
            marginTop: "8px",
            padding: "8px",
            backgroundColor: "#f0f9ff",
            border: "1px solid #0ea5e9",
            fontSize: "10px",
            fontFamily: "'JetBrains Mono', monospace"
          }}>
            <span style={{ color: "#0369a1", fontWeight: "500" }}>
              Selected Names ({selectedNames.length}):
            </span>
            <div style={{ marginTop: "4px" }}>
              {selectedNames.map((name, index) => (
                <span 
                  key={index}
                  style={{
                    display: "inline-block",
                    backgroundColor: "#0ea5e9",
                    color: "white",
                    padding: "2px 6px",
                    marginRight: "4px",
                    marginBottom: "2px",
                    fontSize: "9px"
                  }}
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 传统模式的提示文字 */}
        {!isDragMode && isFocused && text.length < 50 && (
          <span
            style={{
              position: "absolute",
              left:
                text.length * (fontStyle === "handwritten" ? 10 : 8) +
                20 +
                "px",
              top: "10px",
              color: fontStyle === "tech" ? "#4a4a4a" : "#ccc",
              fontSize: fontStyle === "handwritten" ? "12px" : "12px",
              fontFamily:
                fontStyle === "handwritten"
                  ? "'Kalam', cursive"
                  : "'JetBrains Mono', monospace",
              pointerEvents: "none",
              opacity: 0.6,
            }}
          >
            {text.length === 0 ? "" : "enter to save"}
          </span>
        )}

        {/* 拖选模式的说明 */}
        {isDragMode && (
          <div style={{
            marginTop: "8px",
            padding: "6px",
            backgroundColor: "#fef3c7",
            border: "1px solid #f59e0b",
            fontSize: "9px",
            color: "#92400e",
            fontFamily: "'JetBrains Mono', monospace"
          }}>
            💡 <strong>Drag Mode:</strong> First type your text, then drag across names to select them. 
            Click "Submit with Names" when ready.
          </div>
        )}
      </div>
    </div>
  );
}

export default QuickInputEnhanced;
