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
    const textNode = range.startContainer;
    
    if (textNode.nodeType !== Node.TEXT_NODE) return;

    // Replace the current word with contact reference
    const text = textNode.textContent || '';
    const beforeWord = text.slice(0, wordStartIndex);
    const afterWord = text.slice(wordStartIndex + currentWord.length);
    const contactReference = `{{contact:${contact.id}}}`;
    
    const newText = beforeWord + contactReference + afterWord;
    textNode.textContent = newText;
    
    // Position cursor after the contact reference
    const newRange = document.createRange();
    newRange.setStart(textNode, wordStartIndex + contactReference.length);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);
    
    setShowAutocomplete(false);
    onContactSelect(contact);
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