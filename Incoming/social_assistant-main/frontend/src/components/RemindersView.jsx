import { useState, useEffect } from "react";
import { styles } from "../styles";
import { api } from "../services/api";
import PersonDetail from "./PersonDetail";

function RemindersView({ fontStyle }) {
  const [reminders, setReminders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const data = await api.getReminders();
      setReminders(data);
    } catch (error) {
      console.error("Failed to fetch reminders:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ color: "#666", fontSize: "12px" }}>
        Loading reminders...
      </div>
    );
  }

  if (!reminders) {
    return (
      <div style={{ color: "#666", fontSize: "12px" }}>
        Failed to load reminders
      </div>
    );
  }

  return (
    <>
      <div style={{ width: "100%", maxWidth: "800px" }}>
      {/* Commitments Section */}
      <div style={{ marginBottom: "40px" }}>
        <h2
          style={{
            color: fontStyle === "tech" ? "#0ea5e9" : "#2c3e50",
            fontSize: "16px",
            marginBottom: "20px",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          &gt; Your Commitments
        </h2>

        {reminders.commitments && reminders.commitments.length > 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "15px",
            }}
          >
            {reminders.commitments.map((item, index) => (
              <div
                key={index}
                style={{
                  padding: "12px",
                  border: "1px solid #e4e4e7",
                  backgroundColor:
                    fontStyle === "tech"
                      ? "rgba(255, 255, 255, 0.8)"
                      : "rgba(255, 255, 255, 0.8)",
                  fontSize: "12px",
                }}
              >
                <div style={{ color: "#ff6b6b", marginBottom: "8px" }}>
                  <span 
                    style={{ 
                      color: "#0ea5e9", 
                      cursor: "pointer", 
                      textDecoration: "underline" 
                    }}
                    onClick={() => setSelectedPerson(item.person)}
                  >
                    {item.person}
                  </span>
                  {item.deadline && (
                    <span style={{ color: "#ffa500", marginLeft: "15px" }}>
                      Due: {item.deadline}
                    </span>
                  )}
                </div>
                <div style={{ color: "#2c3e50", paddingLeft: "10px" }}>
                  {item.commitment} 
                  {item.by_whom && (
                    <span style={{ color: "#666", marginLeft: "10px" }}>
                      (by {item.by_whom})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: "#666", fontSize: "12px", paddingLeft: "20px" }}>
            No pending commitments
          </div>
        )}
      </div>

      {/* Reconnect Section */}
      <div>
        <h2
          style={{
            color: fontStyle === "tech" ? "#0ea5e9" : "#2c3e50",
            fontSize: "16px",
            marginBottom: "20px",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          &gt; People to Reconnect
        </h2>

        {reminders.reconnect && reminders.reconnect.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "15px",
            }}
          >
            {reminders.reconnect.map((person, index) => (
              <div
                key={index}
                style={{
                  padding: "12px",
                  border: "1px solid #444",
                  backgroundColor:
                    fontStyle === "tech"
                      ? "rgba(255, 255, 255, 0.8)"
                      : "rgba(255, 255, 255, 0.8)",
                  fontSize: "12px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onClick={() => setSelectedPerson(person.person)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#0ea5e9";
                  e.currentTarget.style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#444";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <div
                  style={{
                    color:
                      person.urgency === "urgent"
                        ? "#dc2626"  // 红色 - 超过6个月
                        : person.urgency === "soon"
                        ? "#f59e0b"  // 橙色 - 超过3个月
                        : "#0ea5e9", // 蓝色 - 1-3个月
                    marginBottom: "8px",
                    fontWeight: "bold",
                  }}
                >
                  {person.person}
                </div>
                
                {/* 显示主题/关键词 */}
                {person.topics && person.topics.length > 0 && (
                  <div style={{ 
                    color: "#6b7280", 
                    fontSize: "10px", 
                    marginBottom: "6px",
                    fontStyle: "italic"
                  }}>
                    {person.topics.join(", ")}
                  </div>
                )}
                
                <div style={{ 
                  color: person.urgency === "urgent" ? "#dc2626" : 
                         person.urgency === "soon" ? "#f59e0b" : "#6b7280", 
                  fontSize: "11px" 
                }}>
                  {person.days_ago} days ago
                </div>
                <div
                  style={{ color: "#9ca3af", fontSize: "10px", marginTop: "2px" }}
                >
                  {person.interaction_count} interactions
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: "#666", fontSize: "12px", paddingLeft: "20px" }}>
            Everyone contacted recently!
          </div>
        )}
      </div>
    </div>

    {/* PersonDetail Dialog */}
    {selectedPerson && (
      <PersonDetail
        personName={selectedPerson}
        onClose={() => setSelectedPerson(null)}
        refreshTrigger={refreshTrigger}
        onDataChange={() => {
          setRefreshTrigger(prev => prev + 1);
          fetchReminders(); // 刷新reminders数据
        }}
        fontStyle={fontStyle}
      />
    )}
    </>
  );
}

export default RemindersView;
