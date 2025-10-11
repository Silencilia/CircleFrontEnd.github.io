import { useState } from "react";
import VoiceInput from "./VoiceInput";

function QuickInput({ onSubmit, fontStyle }) {
  const [text, setText] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyDown = (e) => {
    // Enter 提交，Shift+Enter 换行
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const trimmedText = text.trim();
      if (trimmedText) {
        onSubmit(trimmedText);
        setText("");
      }
    }
  };

  // 处理语音输入
  const handleVoiceTranscript = (transcript) => {
    // 将语音转录文本添加到现有文本中
    setText(prevText => {
      const newText = prevText ? `${prevText} ${transcript}` : transcript;
      return newText;
    });
  };

  const handleVoiceError = (errorMessage) => {
    console.error('Voice input error:', errorMessage);
    // 可以选择显示错误提示，但保持界面简洁
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
          autoFocus
        />

        {/* 语音输入组件 */}
        <div style={{
          position: "absolute",
          bottom: "15px",
          right: "15px",
          zIndex: 10
        }}>
          <VoiceInput
            onTranscript={handleVoiceTranscript}
            onError={handleVoiceError}
          />
        </div>

        {/* 提示文字 - 改为 Enter */}
        {isFocused && text.length < 50 && (
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
      </div>
    </div>
  );
}

export default QuickInput;
