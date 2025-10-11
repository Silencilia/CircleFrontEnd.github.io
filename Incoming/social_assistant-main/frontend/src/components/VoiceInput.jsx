import React, { useState, useRef, useEffect } from 'react';

/**
 * 语音输入组件
 * 使用 Web Speech API 实现语音转文字功能
 */
const VoiceInput = ({ onTranscript, onError }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [language, setLanguage] = useState('en-US');
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef(null);

  // 检查浏览器支持
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      
      // 初始化语音识别
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = language;

      // 语音识别结果处理
      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          onTranscript && onTranscript(finalTranscript);
          setInterimText('');
        } else {
          setInterimText(interimTranscript);
        }
      };

      // 错误处理
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setInterimText('');
        
        let errorMessage = 'Speech recognition error';
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone not accessible. Please check permissions.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone permission denied. Please allow microphone access.';
            break;
          case 'network':
            errorMessage = 'Network error. Please check your connection.';
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }
        
        onError && onError(errorMessage);
      };

      // 语音识别结束
      recognition.onend = () => {
        setIsListening(false);
        setInterimText('');
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, onTranscript, onError]);

  // 开始录音
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.lang = language;
        recognitionRef.current.start();
        setIsListening(true);
        setInterimText('');
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        onError && onError('Failed to start voice input');
      }
    }
  };

  // 停止录音
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setInterimText('');
    }
  };

  // 切换录音状态
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // 切换语言
  const toggleLanguage = () => {
    const newLang = language === 'en-US' ? 'zh-CN' : 'en-US';
    setLanguage(newLang);
    
    // 如果正在录音，重启以应用新语言
    if (isListening) {
      stopListening();
      setTimeout(() => {
        startListening();
      }, 100);
    }
  };

  if (!isSupported) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        color: '#9ca3af',
        fontSize: '10px',
        fontFamily: "'JetBrains Mono', monospace"
      }}>
        <span>🎤 Voice input not supported</span>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      {/* 麦克风按钮 - Pinterest风格 */}
      <button
        onClick={toggleListening}
        style={{
          width: '60px',
          height: '60px',
          backgroundColor: isListening ? '#ef4444' : '#e5e7eb',
          border: 'none',
          borderRadius: '50%', // 圆形，模仿Pinterest
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
          position: 'relative',
          boxShadow: isListening ? '0 0 0 4px rgba(239, 68, 68, 0.2)' : '0 2px 8px rgba(0,0,0,0.1)',
        }}
        title={isListening ? 'Stop recording' : 'Start voice input'}
        onMouseEnter={(e) => {
          if (!isListening) {
            e.target.style.backgroundColor = '#d1d5db';
            e.target.style.transform = 'scale(1.05)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isListening) {
            e.target.style.backgroundColor = '#e5e7eb';
            e.target.style.transform = 'scale(1)';
          }
        }}
      >
        {/* 现代麦克风SVG图标 */}
        <svg 
          width="50" 
          height="50" 
          viewBox="0 0 25 25" 
          fill="none" 
          stroke={isListening ? "white" : "#6b7280"} 
          strokeWidth="2"
          style={{ transition: 'all 0.2s' }}
        >
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="23"/>
          <line x1="8" y1="23" x2="16" y2="23"/>
        </svg>
        
        {/* 录音时的脉动效果 */}
        {isListening && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(239, 68, 68, 0.3)',
            animation: 'pulse 1.5s ease-in-out infinite',
            pointerEvents: 'none'
          }} />
        )}
      </button>

      {/* 录音状态指示 */}
      {isListening && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          color: '#ef4444',
          fontSize: '10px',
          fontFamily: "'JetBrains Mono', monospace"
        }}>
          <span>Recording...</span>
          {interimText && (
            <span style={{ 
              color: '#9ca3af',
              fontStyle: 'italic',
              maxWidth: '200px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              "{interimText}"
            </span>
          )}
        </div>
      )}


    </div>
  );
};

export default VoiceInput;
