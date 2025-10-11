import { useState, useEffect } from "react";
import { styles } from "../styles";
import PersonDetail from "./PersonDetail";
import ConnectionDetail from "./ConnectionDetail";
import { api } from "../services/api";

function SearchBar({ onClose, fontStyle, initialQuery = "" }) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedConnection, setSelectedConnection] = useState(null);

  const resultsPerPage = 5;

  // 自动搜索初始词
  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, []);

  const handleSearch = async (searchQuery) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    setLoading(true);
    try {
      const data = await api.search(q, 20);

      // 分类处理结果
      const allResults = data.results || [];
      const processed = allResults.map((r) => ({
        ...r,
        // 判断是否是这个人的记录
        isPerson: r.metadata?.person_name?.toLowerCase() === q.toLowerCase(),
        // 检测embedding_type (兼容性处理)
        isPersonName: r.metadata?.embedding_type === 'person_name' || r.embedding_type === 'person_name',
        // 计算相关度
        relevance: r.similarity || 0,
        // 结果类型分类
        resultType: getResultType(r, q),
      }));

      // 按类型和相关度排序 - 优先显示人名类型
      processed.sort((a, b) => {
        // 人名类型结果优先
        if (a.isPersonName && !b.isPersonName) return -1;
        if (!a.isPersonName && b.isPersonName) return 1;
        // 然后是直接匹配的人员
        if (a.isPerson && !b.isPerson) return -1;
        if (!a.isPerson && b.isPerson) return 1;
        // 最后按相关度排序
        return b.relevance - a.relevance;
      });

      // 移除相似度过滤阈值，显示所有结果
      const filtered = processed.filter((r) => r.relevance > -1);

      // 调试信息：显示结果类型分布
      const typeStats = {
        person_name: filtered.filter(r => r.isPersonName).length,
        person: filtered.filter(r => r.isPerson && !r.isPersonName).length,
        connection: filtered.filter(r => !r.isPerson && !r.isPersonName).length
      };
      console.log('Search results by type:', typeStats);

      setResults(filtered);
      setTotalResults(filtered.length);
      setCurrentPage(1);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // 结果类型判断函数
  const getResultType = (result, searchQuery) => {
    // 检查是否是人名类型 (兼容多种可能的字段位置)
    const isPersonName = result.metadata?.embedding_type === 'person_name' || 
                        result.embedding_type === 'person_name';
    
    // 检查是否是直接人员匹配
    const isPerson = result.metadata?.person_name?.toLowerCase() === searchQuery.toLowerCase();
    
    if (isPersonName) return 'person_name';
    if (isPerson) return 'person';
    return 'connection';
  };

  const totalPages = Math.ceil(results.length / resultsPerPage);
  const paginatedResults = results.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

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
          position: "fixed",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "#ffffff",
          padding: "20px",
          zIndex: 1000,
          width: "min(600px, 90vw)", // 响应式宽度：最大600px，但不超过视口90%
          maxHeight: "80vh",
          fontFamily: "'JetBrains Mono', monospace",
          border: "1px solid #e0e0e0",
        }}
      >
        {/* Search input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <span style={{ color: "#0ea5e9", marginRight: "10px" }}>&gt;</span>
          <span style={{ color: "#666", marginRight: "10px" }}>Search:</span>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              // 实时搜索
              if (e.target.value.trim()) {
                handleSearch(e.target.value);
              } else {
                setResults([]);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch(query);
              }
            }}
            style={{
              flex: 1,
              padding: "6px 8px",
              border: "1px solid #d1d5db",
              backgroundColor: "#f9fafb",
              color: "#374151",
              fontSize: "14px",
              fontFamily: "'JetBrains Mono', monospace",
              outline: "none",
            }}
            autoFocus
          />
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid #e0e0e0", marginBottom: "15px" }} />

        {/* Results */}
        {loading ? (
          <div style={{ color: "#666" }}>Searching...</div>
        ) : results.length > 0 ? (
          <>
            <div style={{ color: "#666", marginBottom: "10px" }}>
              Found {totalResults} matches:
            </div>

            {paginatedResults.map((result, index) => (
              <div
                key={index}
                style={{
                  padding: "8px",
                  cursor: "pointer",
                  color: "#2c3e50",
                  fontSize: "13px",
                  lineHeight: "1.8",
                  fontFamily: "'JetBrains Mono', monospace",
                  borderLeft: "2px solid transparent",
                  backgroundColor: "transparent",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!result.isPerson) {
                    e.currentTarget.style.borderLeftColor = "#0ea5e9";
                  }
                  e.currentTarget.style.paddingLeft = "12px";
                }}
                onMouseLeave={(e) => {
                  if (!result.isPerson) {
                    e.currentTarget.style.borderLeftColor = "transparent";
                  }
                  e.currentTarget.style.paddingLeft = "8px";
                }}
                onClick={() => {
                  if (result.isPerson || result.isPersonName) {
                    const personName = result.metadata?.person_name || result.person_name || "Unknown";
                    setSelectedPerson(personName);
                  } else {
                    setSelectedConnection(result);
                  }
                }}
              >
                <span style={{ color: "#0ea5e9" }}>
                  [{(currentPage - 1) * 5 + index + 1}]
                </span>{" "}
                {/* 优化的标签系统 */}
                {result.isPersonName && (
                  <span style={{ 
                    color: "#10b981", 
                    fontSize: "11px",
                    fontWeight: "bold",
                    backgroundColor: "rgba(16, 185, 129, 0.1)",
                    padding: "1px 4px",
                    marginRight: "4px"
                  }}>
                    [Person Name]{" "}
                  </span>
                )}
                {result.isPerson && !result.isPersonName && (
                  <span style={{ 
                    color: "#0ea5e9", 
                    fontSize: "11px",
                    backgroundColor: "rgba(14, 165, 233, 0.1)",
                    padding: "1px 4px",
                    marginRight: "4px"
                  }}>
                    [Person]{" "}
                  </span>
                )}
                {!result.isPerson && !result.isPersonName && (
                  <span style={{ 
                    color: "#666", 
                    fontSize: "11px",
                    backgroundColor: "rgba(102, 102, 102, 0.1)",
                    padding: "1px 4px",
                    marginRight: "4px"
                  }}>
                    [Connection]{" "}
                  </span>
                )}
                {result.metadata?.person_name && result.metadata.person_name !== "Unknown" && (
                  <span>{result.metadata.person_name}</span>
                )}
                {" - "}
                <span style={{ color: "#999" }}>
                  {result.document.substring(0, 50)}...
                </span>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "20px",
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
        ) : query && !loading ? (
          <div style={{ color: "#666" }}>No results found</div>
        ) : null}
      </div>

      {/* Person Detail Dialog */}
      {selectedPerson && (
        <PersonDetail
          personName={selectedPerson}
          onClose={() => setSelectedPerson(null)}
        />
      )}

      {/* Connection Detail Dialog */}
      {selectedConnection && (
        <ConnectionDetail
          connection={selectedConnection}
          onClose={() => setSelectedConnection(null)}
        />
      )}
    </>
  );
}

export default SearchBar;
