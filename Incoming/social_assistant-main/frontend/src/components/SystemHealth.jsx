import { useState, useEffect } from "react";
import { styles } from "../styles";
import { api } from "../services/api";

function SystemHealth({ fontStyle }) {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetchHealth();
  }, []);

  const fetchHealth = async () => {
    try {
      const data = await api.checkHealth();
      setHealth(data);
    } catch (error) {
      console.error("Failed to fetch health:", error);
      setHealth({ status: "error", error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleResetDatabase = async () => {
    // 第一次确认
    if (!confirm("⚠️ WARNING: This will delete ALL data! Are you sure?")) {
      return;
    }

    // 第二次确认
    if (!confirm("Final confirmation: This action CANNOT be undone. Continue?")) {
      return;
    }

    setResetting(true);
    try {
      await api.resetDatabase();
      alert("Database reset successfully! The page will reload.");
      window.location.reload();
    } catch (error) {
      console.error("Reset failed:", error);
      alert(`Reset failed: ${error.message}`);
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ color: "#666", fontSize: "12px" }}>
        Loading system health...
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "healthy": return "#10b981"; // green
      case "degraded": return "#f59e0b"; // yellow
      case "error": return "#ef4444"; // red
      default: return "#666";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "healthy": return "✓";
      case "degraded": return "⚠";
      case "error": return "✗";
      default: return "?";
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: "800px" }}>
      {/* System Status Header */}
      <div style={{ marginBottom: "30px" }}>
        <h2
          style={{
            color: fontStyle === "tech" ? "#0ea5e9" : "#2c3e50",
            fontSize: "16px",
            marginBottom: "20px",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          &gt; System Health
        </h2>

        <div
          style={{
            padding: "15px",
            border: "1px solid #e4e4e7",
            backgroundColor: fontStyle === "tech" ? "#f8f9fa" : "#f8f9fa",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <span
              style={{
                fontSize: "18px",
                color: getStatusColor(health?.status),
                marginRight: "10px",
              }}
            >
              {getStatusIcon(health?.status)}
            </span>
            <span
              style={{
                fontSize: "14px",
                color: getStatusColor(health?.status),
                fontWeight: "bold",
                textTransform: "uppercase",
              }}
            >
              {health?.status || "unknown"}
            </span>
          </div>

          {health?.checks && (
            <div style={{ fontSize: "11px", color: "#666" }}>
              <div>Database: {health.checks.database_path}</div>
              <div>
                Connection: {health.checks.database_ok ? "✓ OK" : "✗ Failed"}
              </div>
              <div>
                Tables: {health.checks.tables_ok ? "✓ OK" : "✗ Issues"}
              </div>
              <div>
                Integrity: {health.checks.integrity === "ok" ? "✓ OK" : `⚠ ${health.checks.integrity}`}
              </div>
              {health.checks.missing_tables?.length > 0 && (
                <div style={{ color: "#ef4444" }}>
                  Missing tables: {health.checks.missing_tables.join(", ")}
                </div>
              )}
            </div>
          )}

          {health?.error && (
            <div style={{ color: "#ef4444", fontSize: "11px", marginTop: "10px" }}>
              Error: {health.error}
            </div>
          )}
        </div>
      </div>

      {/* Database Management */}
      <div>
        <h2
          style={{
            color: fontStyle === "tech" ? "#0ea5e9" : "#2c3e50",
            fontSize: "16px",
            marginBottom: "20px",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          &gt; Database Management
        </h2>

        <div
          style={{
            padding: "15px",
            border: "1px solid #e4e4e7",
            backgroundColor: fontStyle === "tech" ? "#f8f9fa" : "#f8f9fa",
          }}
        >
          <div style={{ marginBottom: "15px" }}>
            <div style={{ color: "#666", fontSize: "12px", marginBottom: "10px" }}>
              Database operations for development and testing:
            </div>
            
            <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
              <span
                onClick={fetchHealth}
                style={{
                  ...styles.link,
                  color: "#10b981",
                }}
              >
                [Refresh Status]
              </span>
              
              <span
                onClick={handleResetDatabase}
                style={{
                  ...styles.link,
                  color: resetting ? "#666" : "#ef4444",
                  cursor: resetting ? "not-allowed" : "pointer",
                  opacity: resetting ? 0.5 : 1,
                }}
              >
                {resetting ? "[Resetting...]" : "[⚠ Reset Database]"}
              </span>
            </div>
          </div>

          <div style={{ 
            fontSize: "11px", 
            color: "#ef4444", 
            padding: "10px",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
          }}>
            ⚠️ WARNING: Reset Database will permanently delete all data including interactions, people, aliases, and search indexes. This action cannot be undone!
          </div>
        </div>
      </div>
    </div>
  );
}

export default SystemHealth;
