import { useState, useEffect } from "react";
import { styles } from "../styles";
import UpdateDialog from "./UpdateDialog";
import MergeDialog from "./MergeDialog";
import AliasDetail from "./AliasDetail";
import { api } from "../services/api";

function PersonDetail({ personName, onClose, refreshTrigger, onDataChange }) {
  const [interactions, setInteractions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showPrep, setShowPrep] = useState(false);
  const [prepData, setPrepData] = useState(null);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showMerge, setShowMerge] = useState(false); // 添加状态
  const [showAliases, setShowAliases] = useState(false); // 添加Alias状态
  const [showEditMenu, setShowEditMenu] = useState(false); // Edit下拉菜单状态
  const [allPeople, setAllPeople] = useState([]); // 添加状态
  const [currentPersonName, setCurrentPersonName] = useState(personName); // 当前显示的人名

  const itemsPerPage = 5;

  // 处理raw_input文本：移除PRESELECTED部分，并将preselected人名转换为链接
  const processRawInput = (rawInput) => {
    if (!rawInput) return null;
    
    if (rawInput.includes('|PRESELECTED:')) {
      const [cleanText, preselectedData] = rawInput.split('|PRESELECTED:');
      
      try {
        const preselectedNames = JSON.parse(preselectedData);
        
        // 创建包含链接的文本
        let processedText = cleanText;
        const textParts = [];
        
        // 处理每个preselected的人名
        preselectedNames.forEach(name => {
          // 在文本中查找并替换人名为链接
          const nameRegex = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
          processedText = processedText.replace(nameRegex, `__LINK_${name}__`);
        });
        
        // 分割文本，创建包含链接的元素
        const parts = processedText.split(/(__LINK_[^_]+__)/);
        
        return parts.map((part, index) => {
          if (part.startsWith('__LINK_') && part.endsWith('__')) {
            const linkName = part.replace('__LINK_', '').replace('__', '');
            return (
              <span
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  // 直接在当前组件中切换到新人名
                  setCurrentPersonName(linkName);
                  setCurrentPage(1); // 重置到第一页
                  setShowPrep(false); // 关闭prep视图
                  setShowUpdate(false); // 关闭update对话框
                  setShowMerge(false); // 关闭merge对话框
                  setShowAliases(false); // 关闭aliases对话框
                }}
                style={{
                  color: "#0ea5e9",
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontWeight: "500"
                }}
                title={`View ${linkName}'s details`}
              >
                {linkName}
              </span>
            );
          }
          return part;
        });
      } catch (error) {
        console.error('Failed to parse preselected names:', error);
        // 如果解析失败，只返回清理后的文本
        return cleanText;
      }
    }
    
    // 如果没有PRESELECTED部分，直接返回原文本
    return rawInput;
  };

  // 获取所有关键词（去重）
  const getAllKeywords = () => {
    if (!interactions || interactions.length === 0) return [];
    
    const allKeywords = new Set();
    
    interactions.forEach(interaction => {
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
    
    return Array.from(allKeywords);
  };

  useEffect(() => {
    fetchPersonData();
    fetchAllPeople(); // 获取所有人名
  }, [currentPersonName]); // 当currentPersonName改变时重新获取数据

  const fetchPersonData = async () => {
    setLoading(true);
    try {
      const data = await api.getPersonInfo(currentPersonName);
      setInteractions(data.events || []);
    } catch (error) {
      console.error("Failed to fetch person data:", error);
    } finally {
      setLoading(false);
    }
  };

  // 添加获取所有人名的函数
  const fetchAllPeople = async () => {
    try {
      const data = await api.listRecent(100);
      const people = [...new Set(data.events?.map((e) => e.person_name) || [])];
      setAllPeople(people.filter((p) => p !== personName));
    } catch (error) {
      console.error("Failed to fetch people:", error);
    }
  };

  const handleDelete = async (eventId) => {
    if (!confirm("Delete this interaction?")) return;

    try {
      await api.deletePerson(personName, false, eventId);
      
      // 更新state
      const newInteractions = interactions.filter(
        (item) => item.id !== eventId
      );
      setInteractions(newInteractions);

      // 如果删除后没有记录了，关闭对话框并刷新主页面
      if (newInteractions.length === 0) {
        onClose();
        // 调用回调函数刷新主页面
        if (onDataChange) {
          onDataChange();
        }
      }

      // 如果当前页没有记录了，回到上一页
      const newTotalPages = Math.ceil(newInteractions.length / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    } catch (error) {
      console.error("Failed to delete:", error);
      alert(`Failed to delete interaction: ${error.message}`);
    }
  };

  // 添加删除整个人的函数
  const handleDeletePerson = async () => {
    if (
      !confirm(
        `Delete ALL interactions with ${currentPersonName}?\n\nThis action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await api.deletePerson(currentPersonName, true);
      onClose();
      if (onDataChange) {
        onDataChange();
      }
    } catch (error) {
      console.error("Delete failed:", error);
      alert(`Failed to delete person: ${error.message}`);
    }
  };

  const handleUpdate = () => {
    setShowUpdate(true);
  };

  const handlePrep = async () => {
    setLoading(true);
    try {
      const data = await api.prepareMeeting(currentPersonName);
      setPrepData(data);
      setShowPrep(true);
    } catch (error) {
      console.error("Prep failed:", error);
      alert(`Failed to prepare meeting: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(interactions.length / itemsPerPage);
  const paginatedItems = interactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 如果显示Aliases对话框
  if (showAliases) {
    return (
              <AliasDetail
          personName={currentPersonName}
          onClose={() => setShowAliases(false)}
        />
    );
  }

  // 如果显示Merge对话框
  if (showMerge) {
    return (
              <MergeDialog
          sourcePerson={currentPersonName}
          allPeople={allPeople}
          onClose={() => setShowMerge(false)}
          onSuccess={() => {
            onClose();
            if (onDataChange) {
              onDataChange();
            }
          }}
        />
    );
  }

  // 如果显示Update对话框
  if (showUpdate) {
    return (
              <UpdateDialog
          personName={currentPersonName}
          onClose={() => setShowUpdate(false)}
          onSuccess={() => {
            setShowUpdate(false);
            fetchPersonData(); // 刷新数据
          }}
        />
    );
  }

  // 如果显示Prep结果
  if (showPrep && prepData) {
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
            ...styles.dialog,
            backgroundColor: "#ffffff",
            border: "1px solid #e0e0e0",
            top: "10%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "90vw",
            maxWidth: "800px",
            maxHeight: "90vh",
            overflow: "auto",
          }}
        >
          <div style={{ marginBottom: "20px", fontSize: "12px" }}>
            <span style={{ color: "#0ea5e9" }}>&gt;</span>
            <span style={{ color: "#2c3e50", marginLeft: "10px" }}>
              Meeting Prep: {currentPersonName}
            </span>
          </div>

          <div
            style={{
              borderTop: "1px solid #e0e0e0",
              marginBottom: "15px",
              paddingTop: "15px",
              fontSize: "12px",
            }}
          >
            <div
              style={{ color: "#666", marginBottom: "10px", fontSize: "12px" }}
            >
              Total interactions: {prepData.total_interactions || 0}
            </div>

            {prepData.facts && prepData.facts.length > 0 && (
              <div style={{ marginBottom: "20px", fontSize: "12px" }}>
                <div style={{ color: "#0ea5e9", marginBottom: "10px" }}>
                  Key Facts:
                </div>
                {prepData.facts.map((fact, i) => (
                  <div
                    key={i}
                    style={{
                      color: "#2c3e50",
                      paddingLeft: "20px",
                      marginBottom: "5px",
                    }}
                  >
                    • {typeof fact === 'string' ? fact : fact.fact}
                  </div>
                ))}
              </div>
            )}

            {prepData.my_commitments && prepData.my_commitments.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <div style={{ color: "#ff6b6b", marginBottom: "10px" }}>
                  Your Commitments:
                </div>
                {prepData.my_commitments.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      color: "#2c3e50",
                      paddingLeft: "20px",
                      marginBottom: "5px",
                    }}
                  >
                    • {c.commitment}
                  </div>
                ))}
              </div>
            )}

            {prepData.ai_suggestions && (
              <div style={{ marginBottom: "20px" }}>
                <div style={{ color: "#0ea5e9", marginBottom: "10px" }}>
                  AI Suggestions:
                </div>
                <div
                  style={{
                    color: "#666",
                    paddingLeft: "20px",
                    whiteSpace: "pre-line",
                  }}
                >
                  {prepData.ai_suggestions}
                </div>
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap", // 允许换行
              gap: "12px", // 减少间距
              marginTop: "20px",
              justifyContent: "center",
            }}
          >
            <span onClick={() => setShowPrep(false)} style={styles.link}>
              [Back]
            </span>
            <span onClick={onClose} style={styles.link}>
              [Close]
            </span>
          </div>
        </div>
      </>
    );
  }

  // 正常的详情视图
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
          ...styles.dialog,
          backgroundColor: "#ffffff",
          border: "1px solid #e0e0e0",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(60vw, 800px)", // 最大宽度限制，避免在大屏幕上过宽
          minWidth: "320px", // 确保在小屏幕上有最小可用宽度
          maxWidth: "95vw", // 在极小屏幕上不超过95%
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        {/* 右上角Close按钮 */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "15px",
            right: "15px",
            background: "transparent",
            border: "none",
            fontSize: "18px",
            color: "#666",
            cursor: "pointer",
            padding: "5px",
            lineHeight: "1",
          }}
          title="Close"
        >
          ×
        </button>

        <div style={{ marginBottom: "20px", fontSize: "12px" }}>
          <span style={{ color: "#0ea5e9" }}>&gt;</span>
          <span style={{ color: "#2c3e50", marginLeft: "10px" }}>
            Person: {currentPersonName}
          </span>
          
          {/* 显示所有关键词 */}
          {!loading && getAllKeywords().length > 0 && (
            <div style={{ 
              marginTop: "8px", 
              marginLeft: "20px",
              display: "flex",
              flexWrap: "wrap",
              gap: "4px"
            }}>
              {getAllKeywords().map((keyword, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: "8px",
                    color: "white",
                    backgroundColor: "#f97316",
                    padding: "2px 6px",
                    borderRadius: "0",
                    fontFamily: "'JetBrains Mono', monospace",
                    display: "inline-block",
                  }}
                >
                  #{keyword}
                </span>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            borderTop: "1px solid #e0e0e0",
            marginBottom: "15px",
            fontSize: "12px",
          }}
        />

        {loading ? (
          <div style={{ color: "#666" }}>Loading...</div>
        ) : interactions.length === 0 ? (
          <div style={{ color: "#666" }}>No interactions found</div>
        ) : (
          <>
            <div
              style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                color: "#666", 
                marginBottom: "15px", 
                fontSize: "12px" 
              }}
            >
              <span>Total: {interactions.length} interactions</span>
              <button
                onClick={handleDeletePerson}
                style={{
                  background: "transparent",
                  border: "1px solid #ff6b6b",
                  color: "#ff6b6b",
                  fontSize: "10px",
                  padding: "4px 8px",
                  cursor: "pointer",
                  borderRadius: "0",
                }}
                title="Delete All Records"
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#ff6b6b";
                  e.target.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                  e.target.style.color = "#ff6b6b";
                }}
              >
                Delete All
              </button>
            </div>

            {paginatedItems.map((item, index) => (
              <div
                key={index}
                style={{
                  marginBottom: "20px",
                  position: "relative",
                  fontSize: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        color: "#0ea5e9",
                        fontSize: "12px",
                        marginBottom: "5px",
                      }}
                    >
                      {item.timestamp}
                    </div>
                    <div
                      style={{
                        color: "#2c3e50",
                        paddingLeft: "20px",
                        paddingRight: "30px",
                      }}
                    >
                      {processRawInput(item.raw_input)}
                    </div>
                  </div>
                  <span
                    onClick={() => handleDelete(item.id)}
                    onMouseEnter={(e) => (e.target.style.color = "#ff6b6b")}
                    onMouseLeave={(e) => (e.target.style.color = "#666")}
                    style={{
                      color: "#666",
                      cursor: "pointer",
                      fontSize: "12px",
                      padding: "0 5px",
                      flexShrink: 0,
                    }}
                  >
                    [×]
                  </span>
                </div>
              </div>
            ))}

            {totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap", // 允许换行
                  justifyContent: "center",
                  gap: "12px", // 减少间距
                  marginTop: "20px",
                  paddingTop: "15px",
                  borderTop: "1px solid #e0e0e0",
                }}
              >
                <span
                  onClick={() =>
                    currentPage > 1 && setCurrentPage((p) => p - 1)
                  }
                  style={currentPage === 1 ? styles.linkDisabled : styles.link}
                >
                  [←] Prev
                </span>

                <span style={{ ...styles.linkDisabled, cursor: "default" }}>
                  Page {currentPage}/{totalPages}
                </span>

                <span
                  onClick={() =>
                    currentPage < totalPages && setCurrentPage((p) => p + 1)
                  }
                  style={
                    currentPage === totalPages
                      ? styles.linkDisabled
                      : styles.link
                  }
                >
                  Next [→]
                </span>
              </div>
            )}
          </>
        )}

        <div
          style={{
            display: "flex",
            gap: "20px",
            marginTop: "30px",
            paddingTop: "15px",
            borderTop: "1px solid #e0e0e0",
            justifyContent: "center",
          }}
        >
          {/* Get Ready! 按钮 - 蓝色主题 */}
          <button
            onClick={handlePrep}
            style={{
              backgroundColor: "#0ea5e9",
              color: "white",
              border: "none",
              padding: "8px 16px",
              fontSize: "12px",
              cursor: "pointer",
              borderRadius: "0",
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: "bold",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#0284c7";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#0ea5e9";
            }}
          >
            Get Ready!
          </button>

          {/* Edit按钮 - 下拉菜单 */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowEditMenu(!showEditMenu)}
              style={{
                backgroundColor: "transparent",
                color: "#666",
                border: "1px solid #666",
                padding: "8px 16px",
                fontSize: "12px",
                cursor: "pointer",
                borderRadius: "0",
                fontFamily: "'JetBrains Mono', monospace",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              ✏️ Edit
            </button>
            
            {/* Edit下拉菜单 */}
            {showEditMenu && (
              <div
                style={{
                  position: "absolute",
                  bottom: "100%",
                  left: "0",
                  backgroundColor: "white",
                  border: "1px solid #e0e0e0",
                  boxShadow: "0 -4px 12px rgba(0,0,0,0.1)",
                  zIndex: 1000,
                  minWidth: "120px",
                }}
              >
                <div
                  onClick={() => {
                    setShowEditMenu(false);
                    handleUpdate();
                  }}
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    fontSize: "11px",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#f5f5f5";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "white";
                  }}
                >
                  Update Info
                </div>
                <div
                  onClick={() => {
                    setShowEditMenu(false);
                    setShowAliases(true);
                  }}
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    fontSize: "11px",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#f5f5f5";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "white";
                  }}
                >
                  Manage Aliases
                </div>
                <div
                  onClick={() => {
                    setShowEditMenu(false);
                    setShowMerge(true);
                  }}
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    fontSize: "11px",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#f5f5f5";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "white";
                  }}
                >
                  Merge Person
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default PersonDetail;
