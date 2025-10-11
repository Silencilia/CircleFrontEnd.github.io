import { useState, useEffect } from "react";
import { styles } from "../styles";
import { api } from "../services/api";

function NameConfirm({ text, onConfirm, onCancel }) {
  const [input, setInput] = useState("");
  const [processingMode, setProcessingMode] = useState(false);
  const [namesList, setNamesList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [checking, setChecking] = useState(false);
  const [currentCheckResult, setCurrentCheckResult] = useState(null);
  const [confirmedNames, setConfirmedNames] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [shadowConfirmations, setShadowConfirmations] = useState({});
  const [existingConfirmations, setExistingConfirmations] = useState({}); // 新增：existing记录的选择状态
  const [smartMatchConfirmation, setSmartMatchConfirmation] = useState(null); // 智能匹配的选择
  const [batchMode, setBatchMode] = useState(false); // 批量模式
  const [batchTarget, setBatchTarget] = useState(null); // 批量目标人物

  const currentName = processingMode ? namesList[currentIndex] : "";

  const startProcessing = () => {
    const names = input.includes(";")
      ? input
          .split(";")
          .map((n) => n.trim())
          .filter((n) => n)
      : [input.trim()].filter((n) => n);

    if (names.length > 0) {
      setNamesList(names);
      setProcessingMode(true);
      setCurrentIndex(0);
    }
  };

  useEffect(() => {
    if (!processingMode || !currentName) return;

    const checkCurrentName = async () => {
      setChecking(true);
      setCurrentCheckResult(null);
      setShadowConfirmations({});
      setExistingConfirmations({}); // 重置existing确认状态
      setSmartMatchConfirmation(null); // 重置智能匹配状态

      try {
        // 批量模式：如果设置了批量目标，直接使用
        if (batchMode && batchTarget) {
          // 自动添加alia并使用批量目标
          try {
            await api.addAlias(batchTarget, currentName);
            const confirmed = {
              name: batchTarget,
              action: "add",
              originalInput: currentName,
              eventIds: []
            };
            
            const updatedConfirmed = [...confirmedNames, confirmed];
            setConfirmedNames(updatedConfirmed);
            
            if (currentIndex < namesList.length - 1) {
              setCurrentIndex((prev) => prev + 1);
              setCurrentCheckResult(null);
              setShadowConfirmations({});
              setExistingConfirmations({});
              setSmartMatchConfirmation(null);
              setProcessing(false);
              return; // 直接进入下一个名字
            } else {
              // 批量处理完成，执行添加交互
              for (const item of updatedConfirmed) {
                try {
                  await api.addInteraction(item.name, text, item.eventIds || []);
                } catch (error) {
                  console.error(`Failed to process ${item.name}:`, error);
                }
              }
              onConfirm();
              return;
            }
          } catch (error) {
            console.error("Batch mode failed, falling back to normal mode:", error);
            setBatchMode(false);
            setBatchTarget(null);
          }
        }
        const whoData = await api.getPersonInfo(currentName);

        if (whoData.events && whoData.events.length > 0) {
          setCurrentCheckResult({
            type: "existing",
            count: whoData.total || whoData.events.length,
            recent: whoData.events.slice(0, 3),
          });

          // 默认全选existing记录
          const defaultSelections = {};
          whoData.events.slice(0, 3).forEach((_, i) => {
            defaultSelections[`${currentName}-existing-${i}`] = true;
          });
          setExistingConfirmations(defaultSelections);
        } else {
          // 使用智能匹配API检查名字
          try {
            const smartMatchData = await api.checkName(currentName);
            
            if (smartMatchData.type === "smart_match" && smartMatchData.data?.matches) {
              setCurrentCheckResult({
                type: "smart_match",
                matches: smartMatchData.data.matches,
              });
            } else {
              // 回退到原有的shadow检查
              const searchData = await api.search(currentName, 5);

              const mentions = searchData.results?.filter(
                (r) =>
                  r.document.toLowerCase().includes(currentName.toLowerCase()) &&
                  r.metadata?.person_name?.toLowerCase() !==
                    currentName.toLowerCase()
              );

              if (mentions && mentions.length > 0) {
                setCurrentCheckResult({
                  type: "shadow",
                  mentions: mentions.map((m) => ({
                    mentionedBy: m.metadata?.person_name,
                    context: m.document.substring(0, 50),
                    eventId: m.metadata?.event_id,
                  })),
                });
              } else {
                setCurrentCheckResult({
                  type: "new",
                });
              }
            }
          } catch (error) {
            console.error("Smart match check failed, falling back to search:", error);
            // 回退到原有逻辑
            const searchData = await api.search(currentName, 5);
            // ... 原有逻辑
            setCurrentCheckResult({ type: "new" });
          }
        }
      } catch (error) {
        console.error("Failed to check name:", error);
        setCurrentCheckResult({ type: "error" });
      } finally {
        setChecking(false);
      }
    };

    checkCurrentName();
  }, [processingMode, currentIndex]);

  const handleCurrentConfirm = async (action) => {
    if (processing) return;
    setProcessing(true);

    let confirmedEventIds = [];
    let confirmed = null;

    // 处理 existing 确认
    if (action === "add-selected") {
      const selectedIndices = Object.entries(existingConfirmations)
        .filter(([key, value]) => value)
        .map(([key]) => parseInt(key.split("-").pop()));

      confirmedEventIds = selectedIndices
        .map((index) => currentCheckResult.recent[index]?.id)
        .filter((id) => id);

      action = "add";
    }
    // 处理智能匹配确认
    else if (action === "smart-match-confirmed" && smartMatchConfirmation) {
      // 使用选择的匹配项作为Alias
      const selectedMatch = currentCheckResult.matches[smartMatchConfirmation];
      if (selectedMatch) {
        const matchedName = selectedMatch.name || selectedMatch.canonical_name;
        // 这里应该调用API来确认Alias关系，然后添加记录到已存在的人
        try {
          await api.addAlias(matchedName, currentName);
          // 使用匹配到的人的标准名字
          confirmed = {
            name: matchedName,
            action: "add",
            originalInput: currentName, // 保存原始输入
            eventIds: []
          };
        } catch (error) {
          console.error("Failed to add alias:", error);
          action = "create"; // 回退到创建新人
        }
      }
    }
    // 处理 shadow 确认
    else if (action === "shadow-confirmed") {
      const selectedIndices = Object.entries(shadowConfirmations)
        .filter(([key, value]) => key.startsWith(`${currentName}-`) && value)
        .map(([key]) => parseInt(key.split("-")[1]));

      confirmedEventIds = selectedIndices
        .map((index) => currentCheckResult.mentions[index]?.eventId)
        .filter((id) => id);

      action = "create";
    } else if (action === "shadow-none") {
      action = "create";
    } else if (action === "smart-match-none") {
      action = "create";
    }

    // 如果智能匹配中没有预先设置confirmed，则使用默认值
    if (!confirmed) {
      confirmed = {
        name: currentName,
        action: action,
        eventIds: confirmedEventIds,
      };
    }

    const updatedConfirmed = [...confirmedNames, confirmed];
    setConfirmedNames(updatedConfirmed);

    if (currentIndex < namesList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setCurrentCheckResult(null);
      setShadowConfirmations({});
      setExistingConfirmations({});
      setSmartMatchConfirmation(null);
      setProcessing(false);
    } else {
      for (const item of updatedConfirmed) {
        try {
          await api.addInteraction(item.name, text, item.eventIds || []);
        } catch (error) {
          console.error(`Failed to process ${item.name}:`, error);
        }
      }

      onConfirm(updatedConfirmed[0].name, {
        allNames: updatedConfirmed,
      });
      setProcessing(false);
    }
  };

  if (!processingMode) {
    return (
      <>
        <div
          onClick={onCancel}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255, 255, 255, 0.6)",
            zIndex: 999,
          }}
        />

        <div
          style={{
            position: "fixed",
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#ffffff",
            padding: "20px",
            zIndex: 1000,
            minWidth: "400px",
            fontFamily: "'JetBrains Mono', monospace",
            border: "1px solid #e0e0e0",
          }}
        >
          <div
            style={{ color: "#0ea5e9", marginBottom: "15px", fontSize: "12px" }}
          >
            &gt; Who is this about?
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && input.trim()) {
                  startProcessing();
                }
              }}
              placeholder="name or name1; name2"
              style={{
                width: "100%",
                padding: "4px",
                border: "none",
                backgroundColor: "transparent",
                color: "#2c3e50",
                fontSize: "12px",
                fontFamily: "'JetBrains Mono', monospace",
                outline: "none",
              }}
              autoFocus
            />
          </div>

          {input.includes(";") && (
            <div
              style={{ color: "#666", fontSize: "11px", marginBottom: "10px" }}
            >
              Multiple people will be processed
            </div>
          )}

          <div
            style={{
              marginTop: "15px",
              fontSize: "11px",
              color: "#666",
              borderTop: "1px solid #e0e0e0",
              paddingTop: "10px",
            }}
          >
            <div># Note preview:</div>
            <div style={{ color: "#888" }}>"{text.substring(0, 60)}..."</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div
        onClick={onCancel}
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
          position: "fixed",
          top: "40%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "#ffffff",
          padding: "20px",
          zIndex: 1000,
          minWidth: "400px",
          maxWidth: "600px",
          fontFamily: "'JetBrains Mono', monospace",
          border: "1px solid #e0e0e0",
        }}
      >
        <div
          style={{ color: "#0ea5e9", marginBottom: "15px", fontSize: "12px" }}
        >
          &gt; Who is this about?
        </div>

        {namesList.length > 1 && (
          <div
            style={{ color: "#666", fontSize: "11px", marginBottom: "10px" }}
          >
            Processing {currentIndex + 1} of {namesList.length}
          </div>
        )}

        <div
          style={{ fontSize: "14px", color: "#2c3e50", marginBottom: "20px" }}
        >
          {currentName}
          {batchMode && batchTarget && (
            <div style={{ color: "#8b5cf6", marginTop: "5px", fontSize: "11px" }}>
              🔗 Batch mode: Adding to "{batchTarget}"
            </div>
          )}
        </div>

        {checking && (
          <div style={{ color: "#666", fontSize: "12px" }}>Checking...</div>
        )}

        {!checking && currentCheckResult && (
          <div style={{ marginBottom: "20px" }}>
            {currentCheckResult.type === "existing" && (
              <>
                <div
                  style={{
                    color: "#0ea5e9",
                    marginBottom: "10px",
                    fontSize: "12px",
                  }}
                >
                  ✓ Found: {currentCheckResult.count} interactions
                </div>

                {/* 添加选择说明 */}
                <div
                  style={{
                    marginBottom: "10px",
                    fontSize: "11px",
                    color: "#999",
                  }}
                >
                  Select which interactions belong to this person:
                </div>

                {/* 让每个历史记录可选择 */}
                {currentCheckResult.recent &&
                  currentCheckResult.recent.length > 0 && (
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#666",
                        marginBottom: "15px",
                        padding: "10px",
                        border: "1px solid #e0e0e0",
                        maxHeight: "120px",
                        overflow: "auto",
                      }}
                    >
                      {currentCheckResult.recent.map((item, i) => (
                        <div key={i} style={{ marginBottom: "12px" }}>
                          <label
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              cursor: "pointer",
                            }}
                          >
                            <div
                              onClick={() => {
                                setExistingConfirmations({
                                  ...existingConfirmations,
                                  [`${currentName}-existing-${i}`]:
                                    !existingConfirmations[
                                      `${currentName}-existing-${i}`
                                    ],
                                });
                              }}
                              style={{
                                width: "14px",
                                height: "14px",
                                border: "1px solid #999",
                                backgroundColor: "transparent",
                                marginRight: "8px",
                                marginTop: "2px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",

                              }}
                            >
                              {existingConfirmations[
                                `${currentName}-existing-${i}`
                              ] && (
                                <span
                                  style={{
                                    color: "#0ea5e9",
                                    fontSize: "12px",
                                    lineHeight: "1",
                                    fontWeight: "bold",
                                  }}
                                >
                                  ✓
                                </span>
                              )}
                            </div>
                            <div style={{ flex: 1 }}>
                              <span style={{ color: "#444" }}>
                                {item.timestamp?.split("T")[0]}
                              </span>
                              <div
                                style={{ paddingLeft: "10px", color: "#888" }}
                              >
                                {item.raw_input.substring(0, 60)}...
                              </div>
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}

                <div style={{ display: "flex", gap: "15px" }}>
                  <span
                    onClick={() =>
                      !processing && handleCurrentConfirm("add-selected")
                    }
                    style={processing ? styles.linkProcessing : styles.link}
                  >
                    {processing ? "[Processing...]" : "[Add to selected]"}
                  </span>
                  <span
                    onClick={() =>
                      !processing && handleCurrentConfirm("create")
                    }
                    style={processing ? styles.linkProcessing : styles.link}
                  >
                    {processing ? "[Processing...]" : "[Create new person]"}
                  </span>
                </div>
              </>
            )}

            {currentCheckResult.type === "smart_match" && (
              <>
                <div
                  style={{
                    color: "#10b981",
                    marginBottom: "10px",
                    fontSize: "12px",
                  }}
                >
                  🎯 Found {currentCheckResult.matches.length} smart match(es) for "{currentName}"
                </div>
                <div
                  style={{
                    marginBottom: "10px",
                    fontSize: "11px",
                    color: "#999",
                  }}
                >
                  Select if any of these are the same person:
                </div>
                <div
                  style={{
                    maxHeight: "120px",
                    overflowY: "auto",
                    marginBottom: "15px",
                  }}
                >
                  {currentCheckResult.matches.map((match, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        marginBottom: "8px",
                        fontSize: "11px",
                        paddingLeft: "10px",
                      }}
                    >
                      <label
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          cursor: "pointer",
                          width: "100%",
                        }}
                      >
                        <input
                          type="radio"
                          name={`smart-match-${currentName}`}
                          checked={smartMatchConfirmation === i}
                          onChange={() => setSmartMatchConfirmation(i)}
                          style={{
                            marginRight: "8px",
                            marginTop: "2px",
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", marginBottom: "2px" }}>
                            <span style={{ color: "#10b981", fontWeight: "bold" }}>
                              {match.name || match.canonical_name}
                            </span>
                            <span 
                              style={{ 
                                color: match.confidence >= 0.8 ? "#10b981" : match.confidence >= 0.6 ? "#f59e0b" : "#ef4444",
                                marginLeft: "8px",
                                fontSize: "11px",
                                fontWeight: "bold"
                              }}
                            >
                              {(match.confidence * 100).toFixed(0)}%
                            </span>
                            <div
                              style={{
                                width: "40px",
                                height: "4px",
                                backgroundColor: "#e5e7eb",
                                marginLeft: "6px",
                                position: "relative"
                              }}
                            >
                              <div
                                style={{
                                  width: `${match.confidence * 100}%`,
                                  height: "100%",
                                  backgroundColor: match.confidence >= 0.8 ? "#10b981" : match.confidence >= 0.6 ? "#f59e0b" : "#ef4444",
                                }}
                              />
                            </div>
                          </div>
                          <div style={{ color: "#888", fontSize: "10px" }}>
                            {match.match_type || "exact"}
                            {match.reason && ` - ${match.reason}`}
                          </div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
                  <span
                    onClick={() =>
                      !processing && smartMatchConfirmation !== null && 
                      handleCurrentConfirm("smart-match-confirmed")
                    }
                    style={
                      processing || smartMatchConfirmation === null
                        ? styles.linkDisabled 
                        : styles.link
                    }
                  >
                    {processing ? "[Processing...]" : "[Use selected match]"}
                  </span>
                  {namesList.length > 1 && currentIndex < namesList.length - 1 && smartMatchConfirmation !== null && (
                    <span
                      onClick={() => {
                        if (!processing && smartMatchConfirmation !== null) {
                          const selectedMatch = currentCheckResult.matches[smartMatchConfirmation];
                          const matchedName = selectedMatch.name || selectedMatch.canonical_name;
                          setBatchMode(true);
                          setBatchTarget(matchedName);
                          handleCurrentConfirm("smart-match-confirmed");
                        }
                      }}
                      style={
                        processing || smartMatchConfirmation === null
                          ? styles.linkDisabled 
                          : { ...styles.link, color: "#8b5cf6" }
                      }
                    >
                      {processing ? "[Processing...]" : "[Use for remaining names]"}
                    </span>
                  )}
                  <span
                    onClick={() =>
                      !processing && handleCurrentConfirm("smart-match-none")
                    }
                    style={processing ? styles.linkProcessing : styles.link}
                  >
                    {processing ? "[Processing...]" : "[Create new person]"}
                  </span>
                </div>
              </>
            )}

            {currentCheckResult.type === "shadow" && (
              <>
                <div
                  style={{
                    color: "#ffa500",
                    marginBottom: "10px",
                    fontSize: "12px",
                  }}
                >
                  ⚠ {currentCheckResult.mentions.length} person(s) mentioned "
                  {currentName}"
                </div>
                <div
                  style={{
                    marginBottom: "10px",
                    fontSize: "11px",
                    color: "#999",
                  }}
                >
                  Select which are the same person:
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#666",
                    marginBottom: "15px",
                    padding: "10px",
                    border: "1px solid #e0e0e0",
                    maxHeight: "150px",
                    overflow: "auto",
                  }}
                >
                  {currentCheckResult.mentions.map((mention, i) => (
                    <div key={i} style={{ marginBottom: "12px" }}>
                      <label
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          cursor: "pointer",
                        }}
                      >
                        <div
                          onClick={() => {
                            setShadowConfirmations({
                              ...shadowConfirmations,
                              [`${currentName}-${i}`]:
                                !shadowConfirmations[`${currentName}-${i}`],
                            });
                          }}
                          style={{
                            width: "14px",
                            height: "14px",
                            border: "1px solid #999",
                            backgroundColor: "transparent",
                            marginRight: "8px",
                            marginTop: "2px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",

                          }}
                        >
                          {shadowConfirmations[`${currentName}-${i}`] && (
                            <span
                              style={{
                                color: "#0ea5e9",
                                fontSize: "12px",
                                lineHeight: "1",
                                fontWeight: "bold",
                              }}
                            >
                              ✓
                            </span>
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <span style={{ color: "#0ea5e9" }}>
                            {mention.mentionedBy}:
                          </span>
                          <div
                            style={{
                              paddingLeft: "10px",
                              color: "#888",
                              marginTop: "2px",
                            }}
                          >
                            "{mention.context}..."
                          </div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "15px" }}>
                  <span
                    onClick={() =>
                      !processing && handleCurrentConfirm("shadow-confirmed")
                    }
                    style={processing ? styles.linkProcessing : styles.link}
                  >
                    {processing ? "[Processing...]" : "[Confirm selected]"}
                  </span>
                  <span
                    onClick={() =>
                      !processing && handleCurrentConfirm("shadow-none")
                    }
                    style={processing ? styles.linkProcessing : styles.link}
                  >
                    {processing ? "[Processing...]" : "[None - create new]"}
                  </span>
                </div>
              </>
            )}

            {currentCheckResult.type === "new" && (
              <span
                onClick={() => !processing && handleCurrentConfirm("create")}
                style={processing ? styles.linkProcessing : styles.link}
              >
                {processing ? "[Processing...]" : "[Create new person]"}
              </span>
            )}
          </div>
        )}

        <div
          style={{
            marginTop: "15px",
            fontSize: "11px",
            color: "#666",
            borderTop: "1px solid #e0e0e0",
            paddingTop: "10px",
          }}
        >
          <div># Note preview:</div>
          <div style={{ color: "#888" }}>"{text.substring(0, 60)}..."</div>
        </div>
      </div>
    </>
  );
}

export default NameConfirm;
