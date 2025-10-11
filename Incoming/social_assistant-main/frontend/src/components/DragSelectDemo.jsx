import React, { useState } from 'react';
import DragSelectText from './DragSelectText';

/**
 * 拖动选择演示组件
 * 用于测试和演示拖动选择功能
 */
const DragSelectDemo = () => {
  const [selectedTexts, setSelectedTexts] = useState([]);
  const [inputText, setInputText] = useState('Ho Chi Minh is the son of Ho Chi and Minh. Alexander met with Joshua Hagen yesterday. Tom Jerry is a great person. O\'Connor, D\'Angelo, and Jean-Pierre are also here.');

  const handleSelection = (texts) => {
    setSelectedTexts(Array.isArray(texts) ? texts : [texts].filter(Boolean));
    console.log('Selected texts:', texts);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <h3 style={{ marginBottom: '16px', color: '#1f2937' }}>
        Drag Select Text Demo
      </h3>
      
      <div style={{ marginBottom: '16px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          fontWeight: '500',
          color: '#374151' 
        }}>
          Test Text (try dragging to select names):
        </label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          style={{
            width: '100%',
            minHeight: '80px',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            backgroundColor: '#ffffff',
            color: '#374151',
            resize: 'vertical'
          }}
          placeholder="Enter text to test drag selection..."
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          fontWeight: '500',
          color: '#374151' 
        }}>
          Drag Select Area:
        </label>
        <DragSelectText
          text={inputText}
          onSelection={handleSelection}
          placeholder="No text to select..."
          style={{
            minHeight: '100px',
            border: '2px solid #e5e7eb',
            borderRadius: '0'
          }}
        />
      </div>

      {selectedTexts.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: '#374151' 
          }}>
            Selected Names ({selectedTexts.length}):
          </label>
          <div style={{
            padding: '8px 12px',
            backgroundColor: '#f3f4f6',
            border: '1px solid #d1d5db',
            color: '#1f2937',
            fontFamily: 'monospace'
          }}>
            {selectedTexts.map((text, index) => (
              <div key={index} style={{ 
                padding: '2px 4px',
                backgroundColor: '#e5e7eb',
                display: 'inline-block',
                marginRight: '8px',
                marginBottom: '4px'
              }}>
                "{text}"
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ 
        marginTop: '24px', 
        padding: '16px', 
        backgroundColor: '#fef3c7', 
        border: '1px solid #f59e0b',
        color: '#92400e'
      }}>
        <h4 style={{ margin: '0 0 8px 0' }}>How to use:</h4>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li><strong>Multi-Select:</strong> Drag across different names to select multiple names</li>
          <li><strong>Auto-Clean:</strong> Punctuation and spaces are automatically cleaned from selections</li>
          <li><strong>Click to Remove:</strong> Click on any highlighted text to remove that selection</li>
          <li><strong>Clear All:</strong> Use the red "Clear All" button to remove all selections</li>
          <li><strong>Test Cases:</strong> Try "Ho Chi Minh", "Ho Chi", "Minh", "O'Connor", "D'Angelo"</li>
        </ul>
      </div>
    </div>
  );
};

export default DragSelectDemo;
