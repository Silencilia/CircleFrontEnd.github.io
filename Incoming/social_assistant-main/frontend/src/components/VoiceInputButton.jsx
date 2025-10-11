import React, { useState, useRef, useEffect } from 'react';

/**
 * Pinterest 风格的语音输入按钮
 * 圆形设计，现代麦克风图标
 */
const VoiceInputButton = ({ onTranscript, onError, language = 'en-US' }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);

  // 检查浏览器支持并初始化
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = language;

      recognition.onresult = (event) => {
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          onTranscript && onTranscript(finalTranscript);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        let errorMessage = 'Voice input error';
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone not accessible';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone permission denied';
            break;
          case 'network':
            errorMessage = 'Network error';
            break;
        }
        
        onError && onError(errorMessage);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, onTranscript, onError]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = language;
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        onError && onError('Failed to start voice input');
      }
    }
  };

  if (!isSupported) {
    return null; // 不支持时不显示按钮
  }

  return (
    <button
      onClick={toggleListening}
      style={{
        width: '24px',
        height: '24px',
        backgroundColor: isListening ? '#ef4444' : 'transparent',
        border: `1px solid ${isListening ? '#dc2626' : '#d1d5db'}`,
        borderRadius: '0', // 无圆角
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        boxShadow: isListening ? '0 0 0 2px rgba(239, 68, 68, 0.1)' : 'none',
        position: 'relative',
        overflow: 'hidden'
      }}
      title={isListening ? 'Stop recording' : 'Start voice input'}
      onMouseEnter={(e) => {
        if (!isListening) {
          e.currentTarget.style.backgroundColor = '#f3f4f6';
          e.currentTarget.style.transform = 'scale(1.05)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isListening) {
          e.currentTarget.style.backgroundColor = '#f9fafb';
          e.currentTarget.style.transform = 'scale(1)';
        }
      }}
    >
      {/* 圆形外框麦克风图标 */}
      <svg 
        width="14" 
        height="14" 
        viewBox="0 0 24 24" 
        fill="none"
        stroke={isListening ? 'white' : '#6b7280'}
        strokeWidth="1.5"
        style={{
          transition: 'all 0.2s ease'
        }}
      >
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6"/>
        <path d="M8 12h8"/>
        <path d="M12 18v2"/>
        <path d="M8 22h8"/>
      </svg>

      {/* 录音时的脉动效果 */}
      {isListening && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: '50%',
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          animation: 'pulse 1.5s ease-in-out infinite'
        }} />
      )}
    </button>
  );
};

export default VoiceInputButton;
