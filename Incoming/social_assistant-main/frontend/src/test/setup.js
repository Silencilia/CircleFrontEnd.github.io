import '@testing-library/jest-dom'

// Mock window.speechSynthesis for VoiceInput component
global.window.speechSynthesis = {
  speak: () => {},
  cancel: () => {},
  getVoices: () => [],
}

// Mock SpeechRecognition
global.window.SpeechRecognition = class SpeechRecognition {
  constructor() {
    this.continuous = false
    this.interimResults = false
    this.lang = 'en-US'
    this.onstart = null
    this.onresult = null
    this.onerror = null
    this.onend = null
  }
  
  start() {
    if (this.onstart) this.onstart()
  }
  
  stop() {
    if (this.onend) this.onend()
  }
  
  abort() {
    if (this.onend) this.onend()
  }
}

global.window.webkitSpeechRecognition = global.window.SpeechRecognition
