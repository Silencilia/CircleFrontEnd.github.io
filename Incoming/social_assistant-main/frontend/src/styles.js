// 统一的样式定义
export const styles = {
  // 标准链接样式
  link: {
    color: "#0ea5e9",
    cursor: "pointer",
    fontSize: "12px",
    textDecoration: "none",
    display: "inline-block",
    padding: "2px 4px",
    transition: "all 0.2s",
    fontFamily: "'JetBrains Mono', monospace",
  },

  // 处理中的链接样式
  linkProcessing: {
    color: "#0ea5e9",
    cursor: "not-allowed",
    fontSize: "12px",
    textDecoration: "none",
    display: "inline-block",
    padding: "2px 4px",
    opacity: 0.3,
    pointerEvents: "none",
    fontFamily: "'JetBrains Mono', monospace",
  },

  linkDisabled: {
    color: "#333",
    cursor: "default",
    fontSize: "12px",
    fontFamily: "'JetBrains Mono', monospace",
  },
  // 标准按钮（无边框文字按钮）
  button: {
    padding: "6px 12px",
    border: "none",
    backgroundColor: "transparent",
    color: "#666",
    cursor: "pointer",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "12px",
    borderRadius: "0", // 强制无圆角
  },

  // 禁用按钮
  buttonDisabled: {
    padding: "6px 12px",
    border: "none",
    backgroundColor: "transparent",
    color: "#333",
    cursor: "default",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "12px",
    borderRadius: "0",
  },

  // 主要按钮（蓝色高亮）
  buttonPrimary: {
    padding: "6px 12px",
    border: "none",
    backgroundColor: "transparent",
    color: "#0ea5e9",
    cursor: "pointer",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "12px",
    borderRadius: "0",
  },

  // 输入框
  input: {
    border: "none",
    backgroundColor: "transparent",
    color: "#e4e4e7",
    fontSize: "12px",
    fontFamily: "'JetBrains Mono', monospace",
    outline: "none",
    borderRadius: "0",
  },

  // 对话框
  dialog: {
    position: "fixed",
    backgroundColor: "#f8f9fa",
    padding: "20px",
    border: "1px solid #444",
    fontFamily: "'JetBrains Mono', monospace",
    borderRadius: "0",
    zIndex: 1000,
  },
};