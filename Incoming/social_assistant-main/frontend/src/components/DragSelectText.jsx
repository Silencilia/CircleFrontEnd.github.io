import React, { useState, useRef, useCallback } from 'react';

/**
 * 拖动选择文本组件
 * 功能：
 * 1. 拖动选择文本
 * 2. 自动单词边界对齐
 * 3. 视觉高亮选中区域
 * 4. 点击高亮区域取消选择
 * 5. 返回选中的文本内容
 */
const DragSelectText = ({ 
  text, 
  onSelection, 
  placeholder = "Enter text here...",
  style = {},
  showClearButton = true 
}) => {
  const [selectedRanges, setSelectedRanges] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const textRef = useRef(null);

  // 清理文本 - 去掉首尾空格和标点符号
  const cleanText = useCallback((text) => {
    if (!text) return '';
    // 去掉首尾的空格、标点符号，但保留内部的单引号和连字符
    return text
      .replace(/^[\s\p{P}]+|[\s\p{P}]+$/gu, '') // 去掉首尾空格和标点
      .replace(/\s+/g, ' ') // 合并多个空格
      .trim();
  }, []);

  // 查找单词边界
  const findWordBoundary = useCallback((text, position, direction = 'both') => {
    const wordRegex = /\w/;
    let start = position;
    let end = position;

    if (direction === 'both' || direction === 'left') {
      // 向左查找单词开始
      while (start > 0 && wordRegex.test(text[start - 1])) {
        start--;
      }
    }

    if (direction === 'both' || direction === 'right') {
      // 向右查找单词结束
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
      // 计算从文本开始到range位置的字符数
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

    // 回退方案：使用原来的方法但更精确
    return getTextPositionFallback(e);
  }, [text]);

  // 回退的文本位置计算方法
  const getTextPositionFallback = useCallback((e) => {
    const textElement = textRef.current;
    if (!textElement) return 0;

    const range = document.createRange();
    let position = 0;
    let bestPosition = 0;
    let minDistance = Infinity;

    const walker = document.createTreeWalker(
      textElement,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let node;
    while (node = walker.nextNode()) {
      for (let i = 0; i <= node.textContent.length; i++) {
        range.setStart(node, i);
        range.setEnd(node, i);
        
        const rect = range.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) continue;

        // 计算鼠标到字符位置的距离
        const distance = Math.sqrt(
          Math.pow(e.clientX - rect.left, 2) + 
          Math.pow(e.clientY - rect.top, 2)
        );

        if (distance < minDistance) {
          minDistance = distance;
          bestPosition = position + i;
        }
      }
      position += node.textContent.length;
    }

    return Math.min(bestPosition, text.length);
  }, [text]);

  // 检查点击是否真的在高亮区域内
  const isClickInHighlightedArea = useCallback((e, range) => {
    const textElement = textRef.current;
    if (!textElement) return false;

    // 获取该范围的所有矩形区域
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
      
      // 检查这个节点是否与我们的范围重叠
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
    e.preventDefault();
    
    // 首先检查是否真的点击在高亮区域内
    const clickedRangeIndex = selectedRanges.findIndex(range => 
      isClickInHighlightedArea(e, range)
    );

    if (clickedRangeIndex !== -1) {
      // 取消点击的那个选择区域
      const newRanges = selectedRanges.filter((_, index) => index !== clickedRangeIndex);
      setSelectedRanges(newRanges);
      
      // 更新选中文本
      const selectedTexts = newRanges.map(range => 
        cleanText(text.slice(range.start, range.end))
      ).filter(t => t);
      onSelection && onSelection(selectedTexts);
      return;
    }

    // 开始新的选择
    const position = getTextPositionFromEvent(e);
    setIsDragging(true);
    setDragStart(position);
  }, [selectedRanges, isClickInHighlightedArea, getTextPositionFromEvent, onSelection, cleanText, text]);

  // 鼠标移动事件
  const handleMouseMove = useCallback((e) => {
    if (!isDragging || dragStart === null) return;

    e.preventDefault();
    const currentPosition = getTextPositionFromEvent(e);
    
    const start = Math.min(dragStart, currentPosition);
    const end = Math.max(dragStart, currentPosition);

    if (start === end) {
      return;
    }

    // 调整到单词边界
    const startBoundary = findWordBoundary(text, start, 'left');
    const endBoundary = findWordBoundary(text, end, 'right');

    const newRange = {
      start: startBoundary.start,
      end: endBoundary.end,
      isTemporary: true // 标记为临时选择
    };

    // 移除所有临时选择，只保留正式选择
    const permanentRanges = selectedRanges.filter(range => !range.isTemporary);
    
    // 检查是否与现有正式选择重叠
    const overlaps = permanentRanges.some(range => 
      (newRange.start < range.end && newRange.end > range.start)
    );

    if (!overlaps) {
      // 添加新的临时选择
      setSelectedRanges([...permanentRanges, newRange]);
    } else {
      // 如果重叠，只保留正式选择
      setSelectedRanges(permanentRanges);
    }
  }, [isDragging, dragStart, getTextPositionFromEvent, findWordBoundary, text, selectedRanges]);

  // 鼠标释放事件
  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setDragStart(null);

      // 将临时选择变为正式选择
      const finalRanges = selectedRanges.map(range => ({
        start: range.start,
        end: range.end
        // 移除 isTemporary 标记
      }));
      
      setSelectedRanges(finalRanges);

      // 通知父组件选中的文本（清理后的）
      if (finalRanges.length > 0) {
        const selectedTexts = finalRanges
          .map(range => cleanText(text.slice(range.start, range.end)))
          .filter(t => t); // 过滤掉空字符串
        onSelection && onSelection(selectedTexts);
      }
    }
  }, [isDragging, selectedRanges, text, onSelection, cleanText]);

  // 清除所有选择
  const clearAllSelections = useCallback(() => {
    setSelectedRanges([]);
    onSelection && onSelection([]);
  }, [onSelection]);

  // 渲染文本，包含高亮
  const renderTextWithHighlight = useCallback(() => {
    if (selectedRanges.length === 0) {
      return text;
    }

    // 按开始位置排序，避免重叠问题
    const sortedRanges = [...selectedRanges].sort((a, b) => a.start - b.start);
    
    const parts = [];
    let lastIndex = 0;

    sortedRanges.forEach((range, index) => {
      // 添加选中区域前的文本
      if (lastIndex < range.start) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {text.slice(lastIndex, range.start)}
          </span>
        );
      }

      // 添加选中的文本（高亮）
      const isTemporary = range.isTemporary;
      parts.push(
        <span 
          key={`highlight-${range.start}-${index}`}
          style={{
            backgroundColor: isTemporary ? '#93c5fd' : '#3b82f6', // 临时选择用浅蓝色
            color: 'white',
            padding: '1px 2px',
            cursor: 'pointer',
            opacity: isTemporary ? 0.7 : 1
          }}
        >
          {text.slice(range.start, range.end)}
        </span>
      );

      lastIndex = range.end;
    });

    // 添加最后剩余的文本
    if (lastIndex < text.length) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {text.slice(lastIndex)}
        </span>
      );
    }

    return parts;
  }, [text, selectedRanges]);

  // 组件挂载时添加全局事件监听
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
      <div
        ref={textRef}
        onMouseDown={handleMouseDown}
        style={{
          padding: '8px 12px',
          border: '1px solid #d1d5db',
          backgroundColor: '#f9fafb',
          color: '#374151',
          minHeight: '20px',
          cursor: isDragging ? 'text' : 'default',
          userSelect: 'none',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          ...style
        }}
      >
        {text ? renderTextWithHighlight() : (
          <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>
            {placeholder}
          </span>
        )}
      </div>
      
      {/* 清除所有选择按钮 */}
      {showClearButton && selectedRanges.length > 0 && (
        <button
          onClick={clearAllSelections}
          style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '2px 6px',
            fontSize: '10px',
            cursor: 'pointer',
            zIndex: 10
          }}
          title="Clear all selections"
        >
          Clear All
        </button>
      )}
    </div>
  );
};

export default DragSelectText;
