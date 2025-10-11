import React, { useState } from 'react';
import DragSelectText from './DragSelectText';

/**
 * 联系人选择对话框
 * 用户写完文本后，在此对话框中拖选联系人名字
 */
const ContactSelectDialog = ({ text, onConfirm, onCancel, onSkip }) => {
  const [selectedNames, setSelectedNames] = useState([]);

  const handleNameSelection = (names) => {
    setSelectedNames(Array.isArray(names) ? names : []);
  };

  const handleContinue = () => {
    if (selectedNames.length > 0) {
      onConfirm(selectedNames);
    }
  };

  const handleSkip = () => {
    onSkip(); // 使用原来的流程
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: "white",
        padding: "24px",
        maxWidth: "700px",
        width: "90%",
        maxHeight: "80vh",
        overflowY: "auto",
        border: "1px solid #d1d5db"
      }}>
        {/* 标题 */}
        <h3 style={{
          margin: "0 0 16px 0",
          color: "#1f2937",
          fontSize: "18px",
          fontFamily: "'JetBrains Mono', monospace"
        }}>
          🔗 Select Contacts
        </h3>

        {/* 说明 */}
        <p style={{
          margin: "0 0 16px 0",
          color: "#6b7280",
          fontSize: "14px",
          fontFamily: "'JetBrains Mono', monospace"
        }}>
          Drag across names in your text to select contacts:
        </p>

        {/* 拖选区域 */}
        <DragSelectText
          text={text}
          onSelection={handleNameSelection}
          placeholder="No text to select..."
          style={{
            minHeight: "200px",
            maxHeight: "300px",
            overflowY: "auto",
            fontSize: "14px",
            lineHeight: "1.6",
            fontFamily: "'JetBrains Mono', monospace"
          }}
        />

        {/* 选中的联系人预览 */}
        {selectedNames.length > 0 && (
          <div style={{
            marginTop: "16px",
            padding: "12px",
            backgroundColor: "#f0f9ff",
            border: "1px solid #0ea5e9"
          }}>
            <div style={{
              color: "#0369a1",
              fontSize: "12px",
              fontWeight: "500",
              marginBottom: "8px",
              fontFamily: "'JetBrains Mono', monospace"
            }}>
              Selected Contacts ({selectedNames.length}):
            </div>
            <div>
              {selectedNames.map((name, index) => (
                <span 
                  key={index}
                  style={{
                    display: "inline-block",
                    backgroundColor: "#0ea5e9",
                    color: "white",
                    padding: "4px 8px",
                    marginRight: "6px",
                    marginBottom: "4px",
                    fontSize: "12px",
                    fontFamily: "'JetBrains Mono', monospace"
                  }}
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div style={{
          marginTop: "20px",
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px"
        }}>
          <button
            onClick={onCancel}
            style={{
              backgroundColor: "#6b7280",
              color: "white",
              border: "none",
              padding: "8px 16px",
              fontSize: "12px",
              cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace"
            }}
          >
            Cancel
          </button>
          
          <button
            onClick={handleSkip}
            style={{
              backgroundColor: "#f59e0b",
              color: "white",
              border: "none",
              padding: "8px 16px",
              fontSize: "12px",
              cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace"
            }}
          >
            Skip - Use Original
          </button>

          {selectedNames.length > 0 && (
            <button
              onClick={handleContinue}
              style={{
                backgroundColor: "#10b981",
                color: "white",
                border: "none",
                padding: "8px 16px",
                fontSize: "12px",
                cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace"
              }}
            >
              Continue with Contacts
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactSelectDialog;
