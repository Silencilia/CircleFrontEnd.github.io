import { useState, useEffect } from "react";
import { api } from "../services/api";

function PersonPicker({ name, onSelect, onCreateNew, fontStyle }) {
  const [similarPeople, setSimilarPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPersonId, setSelectedPersonId] = useState(null);

  useEffect(() => {
    fetchSimilarPeople();
  }, [name]);

  const fetchSimilarPeople = async () => {
    setLoading(true);
    try {
      const data = await api.findSimilarPeople(name, 8); // 最多显示8个
      setSimilarPeople(data.similar_people || []);
    } catch (error) {
      console.error("Failed to fetch similar people:", error);
      setSimilarPeople([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPerson = () => {
    if (selectedPersonId) {
      const selectedPerson = similarPeople.find(p => p.person_id === selectedPersonId);
      if (selectedPerson) {
        onSelect(selectedPerson);
      }
    }
  };

  const getConfidenceColor = (similarity) => {
    if (similarity >= 0.8) return "#10b981"; // 绿色
    if (similarity >= 0.6) return "#f59e0b"; // 黄色
    return "#ef4444"; // 红色
  };

  const getConfidenceText = (similarity) => {
    if (similarity >= 0.8) return "High";
    if (similarity >= 0.6) return "Medium";
    return "Low";
  };

  if (loading) {
    return (
      <div style={{
        padding: "20px",
        textAlign: "center",
        color: "#666",
        fontSize: "14px",
        fontFamily: "'JetBrains Mono', monospace"
      }}>
        Finding similar people...
      </div>
    );
  }

  return (
    <div style={{
      padding: "20px",
      maxWidth: "600px",
      fontFamily: "'JetBrains Mono', monospace"
    }}>
      <div style={{
        marginBottom: "20px",
        fontSize: "16px",
        fontWeight: "bold",
        color: "#333"
      }}>
        Name: <span style={{ color: "#0ea5e9" }}>{name}</span>
      </div>

      {similarPeople.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <div style={{
            fontSize: "14px",
            color: "#666",
            marginBottom: "15px"
          }}>
            Found {similarPeople.length} similar {similarPeople.length === 1 ? 'person' : 'people'}. Select one or create new:
          </div>

          <div style={{
            border: "1px solid #d1d5db",
            maxHeight: "300px",
            overflowY: "auto"
          }}>
            {similarPeople.map((person) => (
              <div
                key={person.person_id}
                onClick={() => setSelectedPersonId(person.person_id)}
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid #e5e7eb",
                  cursor: "pointer",
                  backgroundColor: selectedPersonId === person.person_id ? "#f0f9ff" : "#fff",
                  borderLeft: selectedPersonId === person.person_id ? "4px solid #0ea5e9" : "4px solid transparent",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (selectedPersonId !== person.person_id) {
                    e.target.style.backgroundColor = "#f9fafb";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedPersonId !== person.person_id) {
                    e.target.style.backgroundColor = "#fff";
                  }
                }}
              >
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "4px"
                }}>
                  <div style={{
                    fontSize: "16px",
                    fontWeight: "bold",
                    color: "#1f2937"
                  }}>
                    {person.person_name}
                  </div>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}>
                    <span style={{
                      color: getConfidenceColor(person.similarity),
                      fontSize: "12px",
                      fontWeight: "bold"
                    }}>
                      {(person.similarity * 100).toFixed(0)}%
                    </span>
                    <span style={{
                      color: getConfidenceColor(person.similarity),
                      fontSize: "10px",
                      padding: "2px 6px",
                      backgroundColor: getConfidenceColor(person.similarity) + "20",
                      border: `1px solid ${getConfidenceColor(person.similarity)}40`
                    }}>
                      {getConfidenceText(person.similarity)}
                    </span>
                  </div>
                </div>
                <div style={{
                  fontSize: "13px",
                  color: "#6b7280",
                  lineHeight: "1.4"
                }}>
                  {person.brief}
                </div>
                <div style={{
                  fontSize: "11px",
                  color: "#9ca3af",
                  marginTop: "4px"
                }}>
                  Last updated: {new Date(person.timestamp).toLocaleDateString('en-US')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{
        display: "flex",
        gap: "10px",
        marginTop: "20px"
      }}>
        {similarPeople.length > 0 && (
          <button
            onClick={handleSelectPerson}
            disabled={!selectedPersonId}
            style={{
              padding: "10px 20px",
              backgroundColor: selectedPersonId ? "#0ea5e9" : "#d1d5db",
              color: selectedPersonId ? "white" : "#6b7280",
              border: "none",
              fontSize: "14px",
              fontFamily: "'JetBrains Mono', monospace",
              cursor: selectedPersonId ? "pointer" : "not-allowed",
              transition: "all 0.2s"
            }}
          >
Use Selected Person
          </button>
        )}
        
        <button
          onClick={() => onCreateNew(name)}
          style={{
            padding: "10px 20px",
            backgroundColor: "#10b981",
            color: "white",
            border: "none",
            fontSize: "14px",
            fontFamily: "'JetBrains Mono', monospace",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
Create New: {name}
        </button>
      </div>

      {similarPeople.length === 0 && (
        <div style={{
          textAlign: "center",
          color: "#6b7280",
          fontSize: "14px",
          marginBottom: "20px"
        }}>
          No similar people found
        </div>
      )}
    </div>
  );
}

export default PersonPicker;
