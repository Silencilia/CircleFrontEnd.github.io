import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import PersonDetail from './PersonDetail';

/**
 * 水平滚动的交互列表组件
 * 单行显示，左右滑动，固定位置动画
 */
const HorizontalInteractionList = ({ 
  interactions, 
  fontStyle, 
  onDataChange,
  refreshTrigger 
}) => {
  const [showMerge, setShowMerge] = useState(false);
  const [mergeSource, setMergeSource] = useState("");
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [peopleDetails, setPeopleDetails] = useState({});
  const scrollRef = useRef(null);

  // 获取人员详细信息（包括关键词）
  useEffect(() => {
    const fetchPeopleDetails = async () => {
      const details = {};
      
      for (const item of interactions) {
        if (item.person_name && !details[item.person_name]) {
          try {
            const personData = await api.getPersonInfo(item.person_name);
            
            // 提取所有关键词（与PersonDetail完全一致的逻辑）
            const personInteractions = personData.events || [];
            const allKeywords = new Set();
            
            personInteractions.forEach(interaction => {
              if (interaction.extracted_json) {
                try {
                  const extracted = JSON.parse(interaction.extracted_json);
                  if (extracted.keywords) {
                    extracted.keywords.forEach(keyword => allKeywords.add(keyword));
                  }
                  if (extracted.topics) {
                    extracted.topics.forEach(topic => allKeywords.add(topic));
                  }
                } catch (e) {
                  // 忽略解析错误
                }
              }
            });
            
            details[item.person_name] = {
              keywords: Array.from(allKeywords),
              totalInteractions: personData.events ? personData.events.length : 0
            };
          } catch (error) {
            console.error(`Failed to fetch details for ${item.person_name}:`, error);
            details[item.person_name] = { keywords: [], totalInteractions: 0 };
          }
        }
      }
      
      setPeopleDetails(details);
    };

    if (interactions.length > 0) {
      fetchPeopleDetails();
    }
  }, [interactions, refreshTrigger]);

  // 获取关键词
  const getKeywords = (item) => {
    const personDetail = peopleDetails[item.person_name];
    return personDetail ? personDetail.keywords : [];
  };

  // 删除人物
  const handleDeletePerson = async (personName, e) => {
    e.stopPropagation();
    if (window.confirm(`Delete all records for ${personName}?`)) {
      try {
        await api.deletePerson(personName, true);
        onDataChange && onDataChange();
      } catch (error) {
        console.error("Delete failed:", error);
        alert(`Failed to delete person: ${error.message}`);
      }
    }
  };

  // 左右滚动
  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 200; // 每次滚动200px
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
    <div style={{ 
      position: 'fixed', // 改为固定定位
      bottom: '40px', // 距离底部80px（为底部导航栏留空间）
      left: '0',
      width: '100vw',
      paddingLeft: '2vw',
      paddingRight: '2vw',
      boxSizing: 'border-box',
      zIndex: 50 // 确保在其他内容上方
    }}>
      {/* 水平滚动容器 */}
      <div 
        ref={scrollRef}
        style={{
          display: 'flex',
          gap: '12px',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE
          paddingBottom: '10px',
          scrollBehavior: 'smooth',
        }}
      >
        {interactions.map((item, index) => {
          const keywords = getKeywords(item);
          
          return (
            <div
              key={index}
              style={{
                minWidth: "160px",
                width: "160px",
                height: "120px",
                padding: "12px",
                border: "1px solid #e5e7eb",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                cursor: "pointer",
                transition: "all 0.2s",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                // 显示删除按钮
                const deleteBtn = e.currentTarget.querySelector(".delete-btn");
                if (deleteBtn) deleteBtn.style.display = "flex";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
                // 隐藏删除按钮
                const deleteBtn = e.currentTarget.querySelector(".delete-btn");
                if (deleteBtn) deleteBtn.style.display = "none";
              }}
              onClick={() => {
                setSelectedPerson(item.person_name);
              }}
            >
              {/* 删除按钮 */}
              <span
                className="delete-btn"
                onClick={(e) => handleDeletePerson(item.person_name, e)}
                style={{
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                  color: "#666",
                  cursor: "pointer",
                  fontSize: "14px",
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  display: "none",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "16px",
                  height: "16px",
                  zIndex: 2,
                }}
              >
                ×
              </span>

              {/* 人名 */}
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#1f2937",
                  fontFamily: "'JetBrains Mono', monospace",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {item.person_name}
              </div>

              {/* 关键词 */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: "4px",
                  marginTop: "4px",
                  alignItems: "flex-start",
                }}
              >
                {keywords.length > 0 ? (
                  <>
                    {keywords.slice(0, 3).map((keyword, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: "8px",
                          color: "white",
                          backgroundColor: "#f97316", // 橙色背景
                          padding: "2px 6px",
                          borderRadius: "0", // 无圆角
                          fontFamily: "'JetBrains Mono', monospace",
                          marginRight: "4px",
                          marginBottom: "2px",
                          display: "inline-block",
                          maxWidth: "60px", // 最大宽度限制
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={`#${keyword}`} // 悬停显示完整词汇
                      >
                        #{keyword.length > 10 ? keyword.substring(0, 10) + "..." : keyword}
                      </span>
                    ))}
                    {keywords.length > 3 && (
                      <span
                        style={{
                          fontSize: "8px",
                          color: "#6b7280",
                          backgroundColor: "#e5e7eb",
                          padding: "2px 6px",
                          borderRadius: "0",
                          fontFamily: "'JetBrains Mono', monospace",
                          marginRight: "4px",
                          marginBottom: "2px",
                          display: "inline-block",
                        }}
                        title={`${keywords.length - 3} more keywords: ${keywords.slice(3).join(', ')}`}
                      >
                        +{keywords.length - 3}
                      </span>
                    )}
                  </>
                ) : (
                  <span
                    style={{
                      fontSize: "10px",
                      color: "#9ca3af",
                      fontStyle: "italic",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    no keywords
                  </span>
                )}
              </div>

              {/* 时间戳 */}
              <div
                style={{
                  fontSize: "9px",
                  color: "#9ca3af",
                  fontFamily: "'JetBrains Mono', monospace",
                  marginTop: "4px",
                }}
              >
                {new Date(item.timestamp).toLocaleDateString()}
              </div>
            </div>
          );
        })}
      </div>


    </div>

    {/* Person Detail Dialog */}
    {selectedPerson && (
      <PersonDetail
        personName={selectedPerson}
        onClose={() => setSelectedPerson(null)}
        refreshTrigger={refreshTrigger}
        onDataChange={onDataChange}
        fontStyle={fontStyle}
      />
    )}
    </>
  );
};

export default HorizontalInteractionList;
