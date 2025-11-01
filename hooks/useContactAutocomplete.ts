import { useState, useCallback } from 'react';
import { Contact } from '../contexts/ContactContext';

interface UseContactAutocompleteProps {
  contacts: Contact[];
  onContactSelect: (contact: Contact) => void;
  textContentEditableRef: React.RefObject<HTMLElement>;
}

export const useContactAutocomplete = ({ contacts, onContactSelect, textContentEditableRef }: UseContactAutocompleteProps) => {
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteQuery, setAutocompleteQuery] = useState('');
  const [autocompletePosition, setAutocompletePosition] = useState({ top: 0, left: 0 });
  const [currentWord, setCurrentWord] = useState('');
  const [wordStartIndex, setWordStartIndex] = useState(0);

  const getCaretPosition = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return { top: 0, left: 0 };

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    return {
      top: rect.bottom + window.scrollY + 5,
      left: rect.left + window.scrollX
    };
  }, []);

  const getCurrentWord = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return { word: '', startIndex: 0 };

    const range = selection.getRangeAt(0);
    const textNode = range.startContainer;
    
    if (textNode.nodeType !== Node.TEXT_NODE) return { word: '', startIndex: 0 };

    const text = textNode.textContent || '';
    const offset = range.startOffset;
    
    // Find word boundaries
    let start = offset;
    let end = offset;
    
    // Look backwards for word start
    while (start > 0 && /\S/.test(text[start - 1])) {
      start--;
    }
    
    // Look forwards for word end
    while (end < text.length && /\S/.test(text[end])) {
      end++;
    }
    
    const word = text.slice(start, end);
    return { word, startIndex: start };
  }, []);

  const handleTextChange = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    const { word, startIndex } = getCurrentWord();
    
    // Check if we should show autocomplete (word starts with letters and is at least 2 characters)
    if (word.length >= 2 && word.match(/^[a-zA-Z]/)) {
      setCurrentWord(word);
      setWordStartIndex(startIndex);
      setAutocompleteQuery(word);
      setAutocompletePosition(getCaretPosition());
      setShowAutocomplete(true);
    } else {
      setShowAutocomplete(false);
    }
  }, [getCurrentWord, getCaretPosition]);

  const handleContactSelect = useCallback((contact: Contact) => {
    if (!textContentEditableRef.current) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const element = textContentEditableRef.current;
    
    // Get the full text content
    const fullText = element.textContent || '';
    
    // Create ranges to find the word boundaries in the DOM
    const beforeRange = document.createRange();
    const afterRange = document.createRange();
    
    // Find the start position
    let charCount = 0;
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    let textNode: Node | null = null;
    let startNode: Node | null = null;
    let startOffset = 0;
    let endNode: Node | null = null;
    let endOffset = 0;
    
    // Find the text node and offset for the start of the word
    while (textNode = walker.nextNode()) {
      const nodeText = textNode.textContent || '';
      const nodeLength = nodeText.length;
      
      if (charCount + nodeLength >= wordStartIndex) {
        startNode = textNode;
        startOffset = wordStartIndex - charCount;
        break;
      }
      charCount += nodeLength;
    }
    
    // Find the text node and offset for the end of the word
    charCount = 0;
    walker.currentNode = element;
    const wordEnd = wordStartIndex + currentWord.length;
    
    while (textNode = walker.nextNode()) {
      const nodeText = textNode.textContent || '';
      const nodeLength = nodeText.length;
      
      if (charCount + nodeLength >= wordEnd) {
        endNode = textNode;
        endOffset = wordEnd - charCount;
        break;
      }
      charCount += nodeLength;
    }
    
    if (!startNode || !endNode) return;
    
    // Create range for the word to replace
    const wordRange = document.createRange();
    wordRange.setStart(startNode, startOffset);
    wordRange.setEnd(endNode, endOffset);
    
    // Replace the word with contact reference
    const contactReference = `{{contact:${contact.id}}}`;
    const newTextNode = document.createTextNode(contactReference);
    wordRange.deleteContents();
    wordRange.insertNode(newTextNode);
    
    // Position cursor after the contact reference
    const newRange = document.createRange();
    newRange.setStartAfter(newTextNode);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);
    
    setShowAutocomplete(false);
    
    // Trigger input event so ContentEditable's onChange fires
    // This ensures the component state updates with the new HTML
    const inputEvent = new Event('input', { bubbles: true });
    element.dispatchEvent(inputEvent);
    
    // Call onContactSelect which will handle the HTML conversion and formatting
    setTimeout(() => {
      onContactSelect(contact);
    }, 0);
  }, [currentWord, wordStartIndex, onContactSelect, textContentEditableRef]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (showAutocomplete) {
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowAutocomplete(false);
      }
    }
  }, [showAutocomplete]);

  return {
    showAutocomplete,
    autocompleteQuery,
    autocompletePosition,
    handleTextChange,
    handleContactSelect,
    handleKeyDown,
    setShowAutocomplete
  };
};