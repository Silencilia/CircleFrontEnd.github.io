import { useState, useEffect } from "react";
import { api } from "../services/api";
import PersonPicker from "./PersonPicker";

function NameConfirmNew({ text, onConfirm, onCancel }) {
  const [input, setInput] = useState("");
  const [processingMode, setProcessingMode] = useState(false);
  const [namesList, setNamesList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [confirmedNames, setConfirmedNames] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [showDuplicateCheck, setShowDuplicateCheck] = useState(false);
  const [duplicateGroups, setDuplicateGroups] = useState([]);

  // 检查是否有预选名字
  useEffect(() => {
    if (text && text.includes('|PRESELECTED:')) {
      const [originalText, preselectedData] = text.split('|PRESELECTED:');
      try {
        const preselectedNames = JSON.parse(preselectedData);
        setInput(originalText);
        
        // 检测预选名字中的重复
        const duplicates = detectDuplicates(preselectedNames);
        
        if (duplicates.length > 0) {
          // 有重复，显示重复检查界面
          setDuplicateGroups(duplicates);
          setShowDuplicateCheck(true);
          setNamesList(preselectedNames); // 保存原始列表
        } else {
          // 无重复，直接开始处理
          setNamesList(preselectedNames);
          setCurrentIndex(0);
          setProcessingMode(true);
          setConfirmedNames([]);
        }
      } catch (error) {
        console.error('Failed to parse preselected names:', error);
        setInput(text);
      }
    } else {
      setInput(text || "");
    }
  }, [text]);

  const currentName = processingMode ? namesList[currentIndex] : "";

  // 检测重复人名的函数
  const detectDuplicates = (names) => {
    const groups = [];
    const processed = new Set();
    
    names.forEach((name, index) => {
      if (processed.has(index)) return;
      
      const group = { primary: name, primaryIndex: index, duplicates: [] };
      
      // 查找可能的重复
      names.forEach((otherName, otherIndex) => {
        if (otherIndex <= index || processed.has(otherIndex)) return;
        
        // 简单的重复检测规则
        const nameLower = name.toLowerCase().trim();
        const otherLower = otherName.toLowerCase().trim();
        
        // 规则1: 完全相同
        if (nameLower === otherLower) {
          group.duplicates.push({ name: otherName, index: otherIndex, reason: 'identical' });
          processed.add(otherIndex);
        }
        // 规则2: 短名字包含在长名字中
        else if (nameLower.length > otherLower.length && nameLower.includes(otherLower)) {
          group.duplicates.push({ name: otherName, index: otherIndex, reason: 'substring' });
          processed.add(otherIndex);
        }
        else if (otherLower.length > nameLower.length && otherLower.includes(nameLower)) {
          // 如果发现更长的名字，交换primary
          group.duplicates.push({ name: group.primary, index: group.primaryIndex, reason: 'substring' });
          group.primary = otherName;
          group.primaryIndex = otherIndex;
          processed.add(otherIndex);
        }
        // 规则3: 首名相同
        else {
          const nameParts = nameLower.split(' ');
          const otherParts = otherLower.split(' ');
          if (nameParts[0] === otherParts[0] && nameParts[0].length > 2) {
            group.duplicates.push({ name: otherName, index: otherIndex, reason: 'firstname' });
            processed.add(otherIndex);
          }
        }
      });
      
      processed.add(index);
      if (group.duplicates.length > 0) {
        groups.push(group);
      }
    });
    
    return groups;
  };

  const startProcessing = () => {
    const names = input.includes(";")
      ? input
          .split(";")
          .map((n) => n.trim())
          .filter((n) => n)
      : [input.trim()].filter((n) => n);

    if (names.length > 0) {
      // 检测重复
      const duplicates = detectDuplicates(names);
      
      if (duplicates.length > 0) {
        // 有重复，显示重复检查界面
        setDuplicateGroups(duplicates);
        setShowDuplicateCheck(true);
        setNamesList(names); // 保存原始列表
      } else {
        // 无重复，直接开始处理
        setNamesList(names);
        setCurrentIndex(0);
        setProcessingMode(true);
        setConfirmedNames([]);
      }
    }
  };

  const handleSelectExistingPerson = async (selectedPerson) => {
    try {
      // 将当前名字作为选中人物的Alias
      await api.addAlias(selectedPerson.person_name, currentName);
      
      const confirmed = {
        name: selectedPerson.person_name,  // 用已存在人物的canonical_name
        action: "existing",
        alias: currentName,
        canonical_name: selectedPerson.person_name  // 确保使用正确的canonical_name
      };

      const newConfirmed = [...confirmedNames, confirmed];
      setConfirmedNames(newConfirmed);

      // 继续下一个名字或完成
      if (currentIndex < namesList.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        finishProcessing(newConfirmed);
      }
    } catch (error) {
      console.error("Failed to add alias:", error);
      alert(`Failed to add alias: ${error.message}`);
    }
  };

  const handleCreateNewPerson = (name) => {
    const confirmed = {
      name: name,
      action: "add"
    };

    const newConfirmed = [...confirmedNames, confirmed];
    setConfirmedNames(newConfirmed);

    // 继续下一个名字或完成
    if (currentIndex < namesList.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      finishProcessing(newConfirmed);
    }
  };

  const finishProcessing = async (confirmed) => {
    setProcessing(true);
    try {
      // 为每个确认的人物添加交互记录
      const results = [];
      for (const person of confirmed) {
        if (person.action === "add") {
          // 创建新人物
          const result = await api.addInteraction(person.name, text);
          results.push(result);
        } else if (person.action === "existing") {
          // 使用现有人物，为该人物添加记录
          // 使用canonical_name确保记录添加到正确的人物
          const result = await api.addInteraction(person.canonical_name || person.name, text);
          results.push(result);
        }
      }
      
      // 调用App.jsx的handleNameConfirm，格式：(name, options)
      onConfirm(input, {
        type: "confirm",
        confirmed: confirmed,
        allNames: confirmed,
        results: results
      });
    } catch (error) {
      console.error("Error adding interaction:", error);
      alert(`Failed to add record: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const cancelProcessing = () => {
    // 直接调用onCancel，回到首页，保留输入文字
    onCancel();
  };

  // 处理重复检查的确认
  const handleDuplicateConfirm = () => {
    // 根据用户选择构建最终的名字列表
    const finalNames = [...namesList];
    const toRemove = new Set();
    
    duplicateGroups.forEach(group => {
      // 标记要移除的重复项
      group.duplicates.forEach(dup => {
        if (dup.merge) {
          toRemove.add(dup.index);
        }
      });
    });
    
    // 构建过滤后的名字列表
    const filteredNames = finalNames.filter((_, index) => !toRemove.has(index));
    
    // 开始处理
    setShowDuplicateCheck(false);
    setNamesList(filteredNames);
    setCurrentIndex(0);
    setProcessingMode(true);
    setConfirmedNames([]);
  };

  // 取消重复检查，回到编辑
  const handleDuplicateCancel = () => {
    setShowDuplicateCheck(false);
    setDuplicateGroups([]);
  };

  // 切换重复项的合并状态
  const toggleDuplicateMerge = (groupIndex, dupIndex) => {
    const newGroups = [...duplicateGroups];
    newGroups[groupIndex].duplicates[dupIndex].merge = 
      !newGroups[groupIndex].duplicates[dupIndex].merge;
    setDuplicateGroups(newGroups);
  };

  // 重复检查界面
  if (showDuplicateCheck) {
    return (
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: "white",
          padding: "24px",
          maxWidth: "600px",
          width: "90%",
          maxHeight: "80vh",
          overflowY: "auto",
          border: "1px solid #d1d5db",
          fontFamily: "'JetBrains Mono', monospace"
        }}>
          <h3 style={{
            margin: "0 0 16px 0",
            color: "#1f2937",
            fontSize: "16px"
          }}>
            🔗 Detected Possible Duplicates
          </h3>
          
          <p style={{
            margin: "0 0 20px 0",
            color: "#6b7280",
            fontSize: "12px"
          }}>
            We found names that might refer to the same person. Choose how to handle them:
          </p>

          {duplicateGroups.map((group, groupIndex) => (
            <div key={groupIndex} style={{
              marginBottom: "20px",
              padding: "16px",
              backgroundColor: "#f9fafb",
              border: "1px solid #e5e7eb"
            }}>
              {/* Primary name */}
              <div style={{
                marginBottom: "12px",
                padding: "8px 12px",
                backgroundColor: "#10b981",
                color: "white",
                fontSize: "12px",
                fontWeight: "500"
              }}>
                ✓ Primary: {group.primary}
              </div>

              {/* Duplicates */}
              {group.duplicates.map((dup, dupIndex) => (
                <div key={dupIndex} style={{
                  marginBottom: "8px",
                  padding: "8px 12px",
                  backgroundColor: "#fef3c7",
                  border: "1px solid #f59e0b",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <div style={{ fontSize: "12px" }}>
                    <span style={{ fontWeight: "500" }}>{dup.name}</span>
                    <span style={{ color: "#6b7280", marginLeft: "8px" }}>
                      ({dup.reason === 'identical' ? 'Identical' : 
                        dup.reason === 'substring' ? 'Contains' : 'Same first name'})
                    </span>
                  </div>
                  
                  <label style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: "11px",
                    cursor: "pointer"
                  }}>
                    <input
                      type="checkbox"
                      checked={dup.merge || false}
                      onChange={() => toggleDuplicateMerge(groupIndex, dupIndex)}
                      style={{ marginRight: "6px" }}
                    />
                    Merge
                  </label>
                </div>
              ))}
            </div>
          ))}

          <div style={{
            marginTop: "24px",
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px"
          }}>
            <button
              onClick={handleDuplicateCancel}
              style={{
                padding: "8px 16px",
                backgroundColor: "#6b7280",
                color: "white",
                border: "none",
                fontSize: "12px",
                cursor: "pointer"
              }}
            >
              Back to Edit
            </button>
            
            <button
              onClick={handleDuplicateConfirm}
              style={{
                padding: "8px 16px",
                backgroundColor: "#10b981",
                color: "white",
                border: "none",
                fontSize: "12px",
                cursor: "pointer"
              }}
            >
              Continue Processing
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!processingMode) {
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
        zIndex: 1000,
        fontFamily: "'JetBrains Mono', monospace"
      }}>
        <div style={{
          backgroundColor: "white",
          padding: "30px",
          maxWidth: "600px",
          width: "90%",
          maxHeight: "80vh",
          overflowY: "auto",
          border: "1px solid #d1d5db"
        }}>
        <div style={{
          fontSize: "16px",
          fontWeight: "bold",
          marginBottom: "15px",
          color: "#333"
        }}>
          Confirm Person Information
        </div>
        
        <div style={{
          fontSize: "14px",
          color: "#666",
          marginBottom: "15px",
          padding: "10px",
          backgroundColor: "#f9fafb",
          border: "1px solid #e5e7eb"
        }}>
          <strong>Content:</strong> {text}
        </div>

        <div style={{
          fontSize: "14px",
          color: "#666",
          marginBottom: "10px"
        }}>
          Enter person names (separate multiple names with semicolons):
        </div>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g.: John Smith; Jane Doe; Alex"
          style={{
            width: "100%",
            padding: "10px",
            fontSize: "14px",
            fontFamily: "'JetBrains Mono', monospace",
            border: "1px solid #d1d5db",
            backgroundColor: "#f9fafb",
            color: "#374151",
            outline: "none",
            marginBottom: "15px"
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && input.trim()) {
              startProcessing();
            }
          }}
        />

        <div style={{
          display: "flex",
          gap: "10px"
        }}>
          <button
            onClick={startProcessing}
            disabled={!input.trim()}
            style={{
              padding: "10px 20px",
              backgroundColor: input.trim() ? "#0ea5e9" : "#d1d5db",
              color: input.trim() ? "white" : "#6b7280",
              border: "none",
              fontSize: "14px",
              fontFamily: "'JetBrains Mono', monospace",
              cursor: input.trim() ? "pointer" : "not-allowed"
            }}
          >
Start Processing
          </button>
          
          <button
            onClick={onCancel}
            style={{
              padding: "10px 20px",
              backgroundColor: "#6b7280",
              color: "white",
              border: "none",
              fontSize: "14px",
              fontFamily: "'JetBrains Mono', monospace",
              cursor: "pointer"
            }}
          >
Cancel
          </button>
        </div>
        </div>
      </div>
    );
  }

  if (processing) {
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
        zIndex: 1000,
        fontFamily: "'JetBrains Mono', monospace"
      }}>
        <div style={{
          backgroundColor: "white",
          padding: "40px",
          textAlign: "center",
          border: "1px solid #d1d5db"
        }}>
          <div style={{
            fontSize: "16px",
            color: "#0ea5e9",
            marginBottom: "10px"
          }}>
Saving record...
          </div>
          <div style={{
            fontSize: "14px",
            color: "#666"
          }}>
Please wait
          </div>
        </div>
      </div>
    );
  }

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
      zIndex: 1000,
      fontFamily: "'JetBrains Mono', monospace"
    }}>
      <div style={{
        backgroundColor: "white",
        maxWidth: "800px",
        width: "90%",
        maxHeight: "90vh",
        overflowY: "auto",
        border: "1px solid #d1d5db"
      }}>
        <div style={{
          padding: "20px 20px 10px 20px",
          borderBottom: "1px solid #e5e7eb",
          backgroundColor: "#f9fafb"
        }}>
        <div style={{
          fontSize: "16px",
          fontWeight: "bold",
          marginBottom: "10px",
          color: "#333"
        }}>
Processing Person {currentIndex + 1} / {namesList.length}
        </div>
        
        <div style={{
          fontSize: "14px",
          color: "#666",
          marginBottom: "10px"
        }}>
          <strong>Content:</strong> {text}
        </div>

        <div style={{
          fontSize: "14px",
          color: "#666",
          marginBottom: "15px"
        }}>
          <strong>Current:</strong> <span style={{ color: "#0ea5e9", fontWeight: "bold" }}>{currentName}</span>
        </div>

        {confirmedNames.length > 0 && (
          <div style={{
            fontSize: "12px",
            color: "#10b981",
            marginBottom: "10px"
          }}>
Confirmed: {confirmedNames.map(c => c.name).join(", ")}
          </div>
        )}

        <div style={{
          display: "flex",
          gap: "10px",
          marginBottom: "10px"
        }}>
          <button
            onClick={cancelProcessing}
            style={{
              padding: "8px 16px",
              backgroundColor: "#6b7280",
              color: "white",
              border: "none",
              fontSize: "12px",
              fontFamily: "'JetBrains Mono', monospace",
              cursor: "pointer"
            }}
          >
Cancel Processing
          </button>
        </div>
      </div>

      <PersonPicker
        name={currentName}
        onSelect={handleSelectExistingPerson}
        onCreateNew={handleCreateNewPerson}
      />
      </div>
    </div>
  );
}

export default NameConfirmNew;
