import { useState, useEffect } from "react";
import { api } from "./services/api";
import QuickInput from "./components/QuickInput";
import InteractionList from "./components/InteractionList";
import HorizontalInteractionList from "./components/HorizontalInteractionList";
import NameConfirmNew from "./components/NameConfirmNew";
import ContactSelectDialog from "./components/ContactSelectDialog";
import TopNavbar from "./components/TopNavbar";
import SearchBar from "./components/SearchBar";
import RemindersView from "./components/RemindersView";
import SystemHealth from "./components/SystemHealth";
import DragSelectDemo from "./components/DragSelectDemo";
import "./App.css";

function App() {
  // React组件就是返回UI的函数
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fontStyle, setFontStyle] = useState("tech");
  const [pendingText, setPendingText] = useState("");
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [showContactSelectDialog, setShowContactSelectDialog] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentView, setCurrentView] = useState("timeline"); // 新增：当前视图
  

  const [voiceLanguage, setVoiceLanguage] = useState("en-US"); // 语音输入语言
  


  useEffect(() => {
    if (currentView === "timeline") {
      fetchData();
    }
  }, [currentView]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    document.body.className = `${fontStyle}-mode`;
  }, [fontStyle]);

  //get data ================================================
  const fetchData = async () => {
    try {
      const data = await api.listRecent();
      // 根据后端返回的结构调整
      setInteractions(data.people || data.events || []);
    } catch (error) {
      console.error("Failed to load data:", error);
      // 更友好的错误提示
      if (error.message.includes('Network error')) {
        alert('Unable to connect to server. Please check if the backend is running.');
      } else {
        alert(`Failed to load data: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // 处理提交的函数 ================================================
  const handleAddInteraction = async (text) => {
    setPendingText(text);
    setShowContactSelectDialog(true); // 先弹出联系人选择窗口
  };

  // 处理联系人选择
  const handleContactSelect = (selectedNames) => {
    setShowContactSelectDialog(false);
    
    // 将选中的名字传递给NameConfirmNew
    const textWithPreselected = `${pendingText}|PRESELECTED:${JSON.stringify(selectedNames)}`;
    setPendingText(textWithPreselected);
    setShowNameDialog(true);
  };

  // 跳过联系人选择，使用原流程
  const handleSkipContactSelect = () => {
    setShowContactSelectDialog(false);
    setShowNameDialog(true); // 直接进入原来的名字确认流程
  };

  // 取消联系人选择
  const handleCancelContactSelect = () => {
    setShowContactSelectDialog(false);
    setPendingText("");
  };

  // 处理顶部搜索
  const handleTopSearch = (query) => {
    setSearchQuery(query);
    setShowSearchBar(true);
  };

  // 处理语音转录 (可以用于QuickInput)
  const handleVoiceTranscript = (transcript) => {
    console.log('Voice transcript:', transcript);
  };

  const handleNameConfirm = async (name, options = {}) => {
    try {
      setShowNameDialog(false);
      setPendingText("");

      if (options.allNames && options.allNames.length > 1) {
        console.log(
          `Processed ${options.allNames.length} names:`,
          options.allNames.map((n) => n.name)
        );
      }

      fetchData();
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to add:", error);
    }
  };

  //render ================================================
  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {/* 顶部导航栏 */}
      <TopNavbar
        onSearch={handleTopSearch}
        fontStyle={fontStyle}
        onFontStyleChange={setFontStyle}
        voiceLanguage={voiceLanguage}
        onVoiceLanguageChange={setVoiceLanguage}
        onVoiceTranscript={handleVoiceTranscript}
      />

      {/* 主内容容器 */}
      <div
        className="app-container"
        style={{
          width: "100vw",
          margin: "0 auto",
          padding: "60px 2vw 50px 2vw", // 顶部padding为导航栏留空间，底部padding为底部导航栏留空间
          minHeight: "100vh",
          position: "relative",
          backgroundColor: fontStyle === "tech" ? "#f8f9fa" : "transparent",
          boxSizing: "border-box",
        }}
      >
        {/* 主内容区域 - 根据当前视图切换 */}

        {currentView === "timeline" && (
          <>
            <QuickInput onSubmit={handleAddInteraction} fontStyle={fontStyle} />
            <HorizontalInteractionList
              interactions={interactions}
              fontStyle={fontStyle}
              refreshTrigger={refreshTrigger}
              onDataChange={fetchData}
            />
          </>
        )}

        {currentView === "reminders" && <RemindersView fontStyle={fontStyle} />}
        
        {currentView === "system" && <SystemHealth fontStyle={fontStyle} />}

        {/* DragSelect Demo - 暂时隐藏，功能已集成 */}
        {/* {currentView === "dragselect" && <DragSelectDemo />} */}
      </div>

      {/* 底部导航栏 */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "40px",
          backgroundColor: fontStyle === "tech" ? "#f5f5f5" : "#f5f5f5",
          borderTop: "1px solid #333",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "20px",
          zIndex: 1000,
        }}

      >
        <button
          onClick={() => setCurrentView("timeline")}
          style={{
            color: currentView === "timeline" ? "#0ea5e9" : "#666",
            cursor: "pointer",
            fontSize: "12px",
            fontFamily: "'JetBrains Mono', monospace",
            padding: "4px 12px",
            border: currentView === "timeline" ? "1px solid #0ea5e9" : "none",
            background: "transparent",
            transition: "all 0.2s",
          }}
        >
          [Notebook]
        </button>
        <button
          onClick={() => setCurrentView("reminders")}
          style={{
            color: currentView === "reminders" ? "#0ea5e9" : "#666",
            cursor: "pointer",
            fontSize: "12px",
            fontFamily: "'JetBrains Mono', monospace",
            padding: "4px 12px",
            border: currentView === "reminders" ? "1px solid #0ea5e9" : "none",
            background: "transparent",
            transition: "all 0.2s",
          }}
        >
          [Reminders]
        </button>
        <button
          onClick={() => setCurrentView("system")}
          style={{
            color: currentView === "system" ? "#0ea5e9" : "#666",
            cursor: "pointer",
            fontSize: "12px",
            fontFamily: "'JetBrains Mono', monospace",
            padding: "4px 12px",
            border: currentView === "system" ? "1px solid #0ea5e9" : "none",
            background: "transparent",
            transition: "all 0.2s",
          }}
        >
          [System]
        </button>
        {/* DragSelect标签页 - 暂时隐藏，功能已集成到ContactSelectDialog */}
        {/* 
        <button
          onClick={() => setCurrentView("dragselect")}
          style={{
            color: currentView === "dragselect" ? "#0ea5e9" : "#666",
            cursor: "pointer",
            fontSize: "12px",
            fontFamily: "'JetBrains Mono', monospace",
            padding: "4px 12px",
            border: currentView === "dragselect" ? "1px solid #0ea5e9" : "none",
            background: "transparent",
            transition: "all 0.2s",
          }}
        >
          [DragSelect]
        </button>
        */}
      </div>

      {/* Dialogs */}
      {showContactSelectDialog && (
        <ContactSelectDialog
          text={pendingText}
          onConfirm={handleContactSelect}
          onSkip={handleSkipContactSelect}
          onCancel={handleCancelContactSelect}
        />
      )}

      {showNameDialog && (
        <NameConfirmNew
          text={pendingText}
          onConfirm={handleNameConfirm}
          onCancel={() => setShowNameDialog(false)}
        />
      )}

      {showSearchBar && (
        <SearchBar
          onClose={() => {
            setShowSearchBar(false);
            setSearchQuery("");
          }}
          fontStyle={fontStyle}
          initialQuery={searchQuery}
        />
      )}
    </div>
  );
}

export default App;
