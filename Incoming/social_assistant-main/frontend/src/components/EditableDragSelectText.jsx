import React, { useState, useRef, useCallback } from 'react';

/**
 * 可编辑的拖动选择文本组件
 * 结合了文本编辑和拖动选择功能
 */
const EditableDragSelectText = ({ 
  value,
  onChange,
  onSelection, 
  placeholder = "Enter text here...",
  style = {},
  fontStyle = "tech"
}) => {
  const [selectedRanges, setSelectedRanges] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const textRef = useRef(null);
  const textareaRef = useRef(null);

  // 清理文本 - 去掉首尾空格和标点符号
  const cleanText = useCallback((text) => {
    if (!text) return '';
    return text
      .replace(/^[\s\p{P}]+|[\s\p{P}]+$/gu, '')
      .replace(/\s+/g, ' ')
      .trim();
  }, []);

  // 查找单词边界
  const findWordBoundary = useCallback((text, position, direction = 'both') => {
    const wordRegex = /[\w'-]/;
    let start = position;
    let end = position;

    if (direction === 'both' || direction === 'left') {
      while (start > 0 && wordRegex.test(text[start - 1])) {
        start--;
      }
    }

    if (direction === 'both' || direction === 'right') {
      while (end < text.length && wordRegex.test(text[end])) {
        end++;
      }
    }

    return { start, end };
  }, []);

  // 获取鼠标位置对应的文本位置
  const getTextPositionFromEvent = useCallback((e) => {
    const textElement = textRef.current;
    if (!textElement) return 0;

    // 使用 document.caretPositionFromPoint 或 document.caretRangeFromPoint
    let range = null;
    if (document.caretPositionFromPoint) {
      const caretPos = document.caretPositionFromPoint(e.clientX, e.clientY);
      if (caretPos) {
        range = document.createRange();
        range.setStart(caretPos.offsetNode, caretPos.offset);
        range.collapse(true);
      }
    } else if (document.caretRangeFromPoint) {
      range = document.caretRangeFromPoint(e.clientX, e.clientY);
    }

    if (range && textElement.contains(range.startContainer)) {
      const walker = document.createTreeWalker(
        textElement,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );

      let position = 0;
      let node;
      while (node = walker.nextNode()) {
        if (node === range.startContainer) {
          return position + range.startOffset;
        }
        position += node.textContent.length;
      }
    }

    return 0;
  }, []);

  // 检查点击是否在高亮区域内
  const isClickInHighlightedArea = useCallback((e, range) => {
    const textElement = textRef.current;
    if (!textElement) return false;

    const tempRange = document.createRange();
    const walker = document.createTreeWalker(
      textElement,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let position = 0;
    let node;
    while (node = walker.nextNode()) {
      const nodeStart = position;
      const nodeEnd = position + node.textContent.length;
      
      if (nodeStart < range.end && nodeEnd > range.start) {
        const rangeStart = Math.max(range.start - position, 0);
        const rangeEnd = Math.min(range.end - position, node.textContent.length);
        
        tempRange.setStart(node, rangeStart);
        tempRange.setEnd(node, rangeEnd);
        
        const rects = tempRange.getClientRects();
        for (let rect of rects) {
          if (e.clientX >= rect.left && e.clientX <= rect.right &&
              e.clientY >= rect.top && e.clientY <= rect.bottom) {
            return true;
          }
        }
      }
      
      position += node.textContent.length;
    }

    return false;
  }, []);

  // 鼠标按下事件
  const handleMouseDown = useCallback((e) => {
    if (isEditing) return; // 编辑模式下不处理拖选

    e.preventDefault();
    
    // 检查是否点击在高亮区域内
    const clickedRangeIndex = selectedRanges.findIndex(range => 
      isClickInHighlightedArea(e, range)
    );

    if (clickedRangeIndex !== -1) {
      // 取消点击的选择区域
      const newRanges = selectedRanges.filter((_, index) => index !== clickedRangeIndex);
      setSelectedRanges(newRanges);
      
      const selectedTexts = newRanges.map(range => 
        cleanText(value.slice(range.start, range.end))
      ).filter(t => t);
      onSelection && onSelection(selectedTexts);
      return;
    }

    // 开始新的选择
    const position = getTextPositionFromEvent(e);
    setIsDragging(true);
    setDragStart(position);
  }, [isEditing, selectedRanges, isClickInHighlightedArea, getTextPositionFromEvent, onSelection, cleanText, value]);

  // 鼠标移动事件
  const handleMouseMove = useCallback((e) => {
    if (!isDragging || dragStart === null || isEditing) return;

    e.preventDefault();
    const currentPosition = getTextPositionFromEvent(e);
    
    const start = Math.min(dragStart, currentPosition);
    const end = Math.max(dragStart, currentPosition);

    if (start === end) return;

    const startBoundary = findWordBoundary(value, start, 'left');
    const endBoundary = findWordBoundary(value, end, 'right');

    const newRange = {
      start: startBoundary.start,
      end: endBoundary.end,
      isTemporary: true
    };

    const permanentRanges = selectedRanges.filter(range => !range.isTemporary);
    const overlaps = permanentRanges.some(range => 
      (newRange.start < range.end && newRange.end > range.start)
    );

    if (!overlaps) {
      setSelectedRanges([...permanentRanges, newRange]);
    } else {
      setSelectedRanges(permanentRanges);
    }
  }, [isDragging, dragStart, isEditing, getTextPositionFromEvent, findWordBoundary, value, selectedRanges]);

  // 鼠标释放事件
  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setDragStart(null);

      const finalRanges = selectedRanges.map(range => ({
        start: range.start,
        end: range.end
      }));
      
      setSelectedRanges(finalRanges);

      if (finalRanges.length > 0) {
        const selectedTexts = finalRanges
          .map(range => cleanText(value.slice(range.start, range.end)))
          .filter(t => t);
        onSelection && onSelection(selectedTexts);
      }
    }
  }, [isDragging, selectedRanges, value, onSelection, cleanText]);

  // 渲染文本，包含高亮
  const renderTextWithHighlight = useCallback(() => {
    if (selectedRanges.length === 0) {
      return value;
    }

    const sortedRanges = [...selectedRanges].sort((a, b) => a.start - b.start);
    const parts = [];
    let lastIndex = 0;

    sortedRanges.forEach((range, index) => {
      if (lastIndex < range.start) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {value.slice(lastIndex, range.start)}
          </span>
        );
      }

      const isTemporary = range.isTemporary;
      parts.push(
        <span 
          key={`highlight-${range.start}-${index}`}
          style={{
            backgroundColor: isTemporary ? '#93c5fd' : '#3b82f6',
            color: 'white',
            padding: '1px 2px',
            cursor: 'pointer',
            opacity: isTemporary ? 0.7 : 1
          }}
        >
          {value.slice(range.start, range.end)}
        </span>
      );

      lastIndex = range.end;
    });

    if (lastIndex < value.length) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {value.slice(lastIndex)}
        </span>
      );
    }

    return parts;
  }, [value, selectedRanges]);

  // 双击进入编辑模式
  const handleDoubleClick = useCallback(() => {
    if (!isDragging) {
      setIsEditing(true);
      setSelectedRanges([]); // 清除选择
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 0);
    }
  }, [isDragging]);

  // 退出编辑模式
  const handleEditBlur = useCallback(() => {
    setIsEditing(false);
  }, []);

  // 全局事件监听
  React.useEffect(() => {
    const handleGlobalMouseMove = (e) => handleMouseMove(e);
    const handleGlobalMouseUp = () => handleMouseUp();

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div style={{ position: 'relative' }}>
      {isEditing ? (
        // 编辑模式：显示textarea
        <textarea
          ref={textareaRef}
          value={value}
          onChange={onChange}
          onBlur={handleEditBlur}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsEditing(false);
            }
          }}
          style={{
            width: "100%",
            minHeight: "280px",
            padding: "8px 12px",
            border: "2px solid #3b82f6",
            backgroundColor: "#ffffff",
            fontSize: fontStyle === "handwritten" ? "12px" : "12px",
            lineHeight: "28px",
            outline: "none",
            resize: "vertical",
            color: fontStyle === "tech" ? "#2c3e50" : "#2c3e50",
            fontFamily:
              fontStyle === "handwritten"
                ? "'Kalam', cursive"
                : "'JetBrains Mono', monospace",
            ...style
          }}
          placeholder={placeholder}
          autoFocus
        />
      ) : (
        // 拖选模式：显示可拖选的文本
        <div
          ref={textRef}
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
          style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            backgroundColor: '#f9fafb',
            color: '#374151',
            minHeight: '280px',
            cursor: isDragging ? 'text' : 'default',
            userSelect: 'none',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            fontSize: fontStyle === "handwritten" ? "12px" : "12px",
            lineHeight: "28px",
            fontFamily:
              fontStyle === "handwritten"
                ? "'Kalam', cursive"
                : "'JetBrains Mono', monospace",
            ...style
          }}
          title="Double-click to edit text"
        >
          {value ? renderTextWithHighlight() : (
            <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>
              {placeholder}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default EditableDragSelectText;
