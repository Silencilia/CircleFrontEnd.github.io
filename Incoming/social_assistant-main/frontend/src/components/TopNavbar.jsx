import React, { useState } from 'react';
import VoiceInputButton from './VoiceInputButton';

/**
 * 顶部导航栏组件
 * 模仿 Pinterest 的布局：App名称 + 长搜索条 + 设置按钮
 */
const TopNavbar = ({ 
  onSearch, 
  fontStyle, 
  onFontStyleChange, 
  voiceLanguage, 
  onVoiceLanguageChange,
  onVoiceTranscript 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch && onSearch(searchQuery.trim());
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(e);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      width: '100vw',
      height: '48px', // 减小高度，模仿Pinterest
      backgroundColor: 'white',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      padding: '0 4vw', // 使用vw单位，适应屏幕宽度
      zIndex: 100,
      gap: '3vw', // 使用vw单位
      boxSizing: 'border-box'
    }}>
      {/* App 名称 - 更合适的比例 */}
      <div style={{
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#0ea5e9',
        fontFamily: "'JetBrains Mono', monospace",
        width: '12vw', // 增加宽度，更协调
        minWidth: '80px',
        flexShrink: 0
      }}>
        Cirkel
      </div>

      {/* 搜索条 - 调整比例，更协调 */}
      <div style={{
        flex: 1,
        width: '65vw', // 减少宽度，给两边留更多空间
        maxWidth: 'none',
        position: 'relative'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#f3f4f6',
          border: '1px solid #d1d5db',
          borderRadius: '0', // 无圆角
          padding: '8px 16px',
          gap: '12px',
          height: '32px' // 固定高度
        }}>
          {/* 搜索图标 */}
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="#6b7280" 
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>

          {/* 搜索输入框 */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="ask Cirkel"
            style={{
              flex: 1,
              border: 'none',
              backgroundColor: 'transparent',
              outline: 'none',
              fontSize: '14px',
              color: '#374151',
              fontFamily: "'JetBrains Mono', monospace"
            }}
          />


        </div>
      </div>

      {/* 设置按钮 */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowSettings(!showSettings)}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            padding: '6px',
            cursor: 'pointer',
            color: '#6b7280',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px'
          }}
          title="Settings"
        >
          {/* 控制面板图标 - 模仿你提供的设计 */}
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5"
          >
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
        </button>

        {/* 设置下拉菜单 */}
        {showSettings && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #d1d5db',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            padding: '8px',
            minWidth: '200px',
            zIndex: 200
          }}>
            {/* 风格切换 */}
            <div style={{
              marginBottom: '12px',
              borderBottom: '1px solid #e5e7eb',
              paddingBottom: '8px'
            }}>
              <div style={{
                fontSize: '12px',
                color: '#6b7280',
                marginBottom: '6px',
                fontFamily: "'JetBrains Mono', monospace"
              }}>
                Display Style
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => onFontStyleChange('tech')}
                  style={{
                    backgroundColor: fontStyle === 'tech' ? '#3b82f6' : '#f3f4f6',
                    color: fontStyle === 'tech' ? 'white' : '#374151',
                    border: '1px solid #d1d5db',
                    padding: '4px 8px',
                    fontSize: '10px',
                    cursor: 'pointer',
                    fontFamily: "'JetBrains Mono', monospace"
                  }}
                >
                  Tech
                </button>
                <button
                  onClick={() => onFontStyleChange('handwritten')}
                  style={{
                    backgroundColor: fontStyle === 'handwritten' ? '#3b82f6' : '#f3f4f6',
                    color: fontStyle === 'handwritten' ? 'white' : '#374151',
                    border: '1px solid #d1d5db',
                    padding: '4px 8px',
                    fontSize: '10px',
                    cursor: 'pointer',
                    fontFamily: "'Kalam', cursive"
                  }}
                >
                  Hand
                </button>
              </div>
            </div>

            {/* 语音语言切换 */}
            <div>
              <div style={{
                fontSize: '12px',
                color: '#6b7280',
                marginBottom: '6px',
                fontFamily: "'JetBrains Mono', monospace"
              }}>
                Voice Language
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => onVoiceLanguageChange('en-US')}
                  style={{
                    backgroundColor: voiceLanguage === 'en-US' ? '#3b82f6' : '#f3f4f6',
                    color: voiceLanguage === 'en-US' ? 'white' : '#374151',
                    border: '1px solid #d1d5db',
                    padding: '4px 8px',
                    fontSize: '10px',
                    cursor: 'pointer',
                    fontFamily: "'JetBrains Mono', monospace"
                  }}
                >
                  English
                </button>
                <button
                  onClick={() => onVoiceLanguageChange('zh-CN')}
                  style={{
                    backgroundColor: voiceLanguage === 'zh-CN' ? '#3b82f6' : '#f3f4f6',
                    color: voiceLanguage === 'zh-CN' ? 'white' : '#374151',
                    border: '1px solid #d1d5db',
                    padding: '4px 8px',
                    fontSize: '10px',
                    cursor: 'pointer',
                    fontFamily: "'JetBrains Mono', monospace"
                  }}
                >
                  中文
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 点击外部关闭设置菜单 */}
      {showSettings && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 150
          }}
          onClick={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};

export default TopNavbar;
