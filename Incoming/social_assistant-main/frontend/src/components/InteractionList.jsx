import { useState } from "react";
import PersonDetail from "./PersonDetail";
import MergeDialog from "./MergeDialog";
import { api } from "../services/api";

function InteractionList({
  interactions,
  fontStyle,
  refreshTrigger,
  onDataChange,
}) {
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showMerge, setShowMerge] = useState(false);
  const [mergeSource, setMergeSource] = useState(null);

  if (interactions.length === 0) return null;

  // 获取所有人名列表（用于merge dialog）
  const allPeople = [...new Set(interactions.map((item) => item.person_name))];

  // 删除整个人的函数
  const handleDeletePerson = async (personName, e) => {
    e.stopPropagation(); // 防止触发卡片点击

    if (
      !confirm(
        `Delete ALL interactions with ${personName}?\n\nThis action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await api.deletePerson(personName, true); // 使用API服务
      if (onDataChange) {
        onDataChange();
      }
    } catch (error) {
      console.error("Delete failed:", error);
      alert(`Failed to delete person: ${error.message}`);
    }
  };

  // 从提取的数据中获取关键词
  const getKeywords = (item) => {
    if (!item.extracted_json) {
      // 如果没有提取数据，从原始文本生成简单关键词
      if (item.raw_input) {
        const words = item.raw_input
          .toLowerCase()
          .split(/\s+/)
          .filter(word => word.length > 3 && !['with', 'about', 'discussed', 'talked', 'said', 'told', 'asked'].includes(word))
          .slice(0, 3);
        return words.length > 0 ? words : ['conversation'];
      }
      return [];
    }

    try {
      const extracted = JSON.parse(item.extracted_json);

      // 优先使用 AI 提取的 keywords
      if (extracted.keywords && extracted.keywords.length > 0) {
        return extracted.keywords.slice(0, 3);
      }

      // 回退到 topics
      if (extracted.topics && extracted.topics.length > 0) {
        return extracted.topics.slice(0, 3);
      }

      // 没有关键词就返回空
      return [];
    } catch {
      return [];
    }
  };

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(180px, 100%), 1fr))",
          gap: "15px",
          marginTop: "30px",
          position: "relative",
          zIndex: 1,
          width: "100%",
          // 移除固定最小宽度，改为响应式
        }}
      >
        {interactions.map((item, index) => {
          const keywords = getKeywords(item);

          return (
            <div
              key={index}
              style={{
                backgroundColor: fontStyle === "tech" ? "#f8f9fa" : "#f8f9fa",
                padding: "12px",
                borderRadius: fontStyle === "tech" ? "0px" : "0px",
                // 移除固定宽度，让grid控制宽度
                minWidth: "160px", // 设置最小宽度确保可读性
                height: "120px",
                boxShadow:
                  fontStyle === "tech"
                    ? "0 2px 8px rgba(0,0,0,0.2)"
                    : "2px 2px 6px rgba(0,0,0,0.1)",
                fontSize: fontStyle === "handwritten" ? "13px" : "12px",
                transform:
                  fontStyle === "handwritten"
                    ? `rotate(${index % 2 === 0 ? -1 : 1}deg)`
                    : "none",
                transition: "transform 0.2s",
                cursor: "pointer",
                border: fontStyle === "tech" ? "1px solid #444" : "none",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative", // 添加这个以便定位按钮
              }}
              className={fontStyle}
              onClick={() => setSelectedPerson(item.person_name)}
              onMouseEnter={(e) => {
                if (fontStyle === "handwritten") {
                  e.currentTarget.style.transform = "rotate(0deg) scale(1.05)";
                } else {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.borderColor = "#0ea5e9";
                }
                // 显示按钮
                const deleteBtn = e.currentTarget.querySelector(".delete-btn");
                const mergeBtn = e.currentTarget.querySelector(".merge-btn");
                if (deleteBtn) deleteBtn.style.display = "flex";
                if (mergeBtn) mergeBtn.style.display = "block";
              }}
              onMouseLeave={(e) => {
                if (fontStyle === "handwritten") {
                  e.currentTarget.style.transform = `rotate(${
                    index % 2 === 0 ? -1 : 1
                  }deg)`;
                } else {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.borderColor = "#444";
                }
                // 隐藏按钮
                const deleteBtn = e.currentTarget.querySelector(".delete-btn");
                const mergeBtn = e.currentTarget.querySelector(".merge-btn");
                if (deleteBtn) deleteBtn.style.display = "none";
                if (mergeBtn) mergeBtn.style.display = "none";
              }}
            >
              {/* 删除按钮 - 右上角 */}
              <span
                className="delete-btn"
                onClick={(e) => handleDeletePerson(item.person_name, e)}
                style={{
                  position: "absolute",
                  top: "5px",
                  right: "5px",
                  color: "#666",
                  cursor: "pointer",
                  fontSize: "16px",
                  padding: "2px",

                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                  display: "none", // 默认隐藏
                  alignItems: "center",
                  justifyContent: "center",
                  width: "20px",
                  height: "20px",
                  zIndex: 2,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "rgba(255, 255, 255, 0.9)";
                  e.currentTarget.style.color = "#ff0000";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "rgba(255, 255, 255, 0.7)";
                  e.currentTarget.style.color = "#666";
                }}
              >
                ×
              </span>

              {/* Merge按钮 - 右下角 */}
              <span
                className="merge-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setMergeSource(item.person_name);
                  setShowMerge(true);
                }}
                style={{
                  position: "absolute",
                  bottom: "5px",
                  right: "5px",
                  color: "#666",
                  cursor: "pointer",
                  fontSize: "10px",
                  padding: "2px 4px",
                  backgroundColor: "rgba(255, 255, 255, 0.7)",

                  display: "none", // 默认隐藏
                  zIndex: 2,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "rgba(255, 255, 255, 0.9)";
                  e.currentTarget.style.color = "#0ea5e9";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "rgba(255, 255, 255, 0.7)";
                  e.currentTarget.style.color = "#666";
                }}
              >
                [merge]
              </span>

              <div>
                <strong
                  style={{
                    color: fontStyle === "tech" ? "#0ea5e9" : "#2c3e50",
                    fontFamily: fontStyle === "tech" ? "monospace" : "inherit",
                    fontSize: "13px",
                  }}
                >
                  {fontStyle === "tech" && "> "}
                  {item.person_name}
                </strong>

                {/* 显示关键词 - 如果有的话 */}
                {keywords.length > 0 ? (
                  <div
                    style={{
                      marginTop: "10px",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "5px",
                    }}
                  >
                    {keywords.map((keyword, i) => (
                      <span
                        key={i}
                        style={{
                          color: fontStyle === "tech" ? "#666" : "#7f8c8d",
                          fontSize: "7px",
                          padding: "1px 4px",
                          backgroundColor:
                            fontStyle === "tech"
                              ? "rgba(14, 165, 233, 0.1)"
                              : "rgba(44, 62, 80, 0.1)",
                          border: `1px solid ${
                            fontStyle === "tech" ? "#333" : "#ddd"
                          }`,
        
                        }}
                      >
                        #{keyword}
                      </span>
                    ))}
                  </div>
                ) : (
                  // 没有关键词时显示省略号或空白
                  <div
                    style={{
                      marginTop: "10px",
                      color: fontStyle === "tech" ? "#444" : "#bbb",
                      fontSize: "11px",
                      fontStyle: "italic",
                    }}
                  >
                    {fontStyle === "tech" ? "// ..." : "..."}
                  </div>
                )}
              </div>

              <small
                style={{
                  color: fontStyle === "tech" ? "#666" : "#7f8c8d",
                  fontFamily: fontStyle === "tech" ? "monospace" : "inherit",
                  fontSize: "10px",
                }}
              >
                {fontStyle === "tech" && "// "}
                {new Date(item.timestamp).toLocaleDateString()}
              </small>
            </div>
          );
        })}
      </div>

      {/* Person Detail Dialog */}
      {selectedPerson && (
        <PersonDetail
          personName={selectedPerson}
          onClose={() => setSelectedPerson(null)}
          refreshTrigger={refreshTrigger}
          onDataChange={onDataChange}
        />
      )}

      {/* Merge Dialog */}
      {showMerge && mergeSource && (
        <MergeDialog
          sourcePerson={mergeSource}
          allPeople={allPeople}
          onClose={() => {
            setShowMerge(false);
            setMergeSource(null);
          }}
          onSuccess={() => {
            setShowMerge(false);
            setMergeSource(null);
            if (onDataChange) {
              onDataChange();
            }
          }}
        />
      )}
    </>
  );
}

export default InteractionList;
