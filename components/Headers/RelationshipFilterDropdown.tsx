import React, { useState, useRef, useEffect } from 'react';
import { Relationship } from '../../contexts/ContactContext';

interface RelationshipFilterDropdownProps {
  relationships: Relationship[];
  selectedRelationshipIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

const RelationshipFilterDropdown: React.FC<RelationshipFilterDropdownProps> = ({
  relationships,
  selectedRelationshipIds,
  onSelectionChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [availableWidth, setAvailableWidth] = useState<number>(0);
  const [fontMetrics, setFontMetrics] = useState<{ font: string; separatorWidth: number } | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Compute available width and font metrics (pixel-accurate)
  useEffect(() => {
    const computeMetrics = () => {
      if (!textRef.current) return;
      const span = textRef.current;
      const width = span.clientWidth; // px
      if (width <= 0) return;

      const style = window.getComputedStyle(span);
      const font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.font = font;

      const separatorWidth = ctx.measureText(' + ').width;

      setAvailableWidth(width);
      setFontMetrics({ font, separatorWidth });
    };

    computeMetrics();
    window.addEventListener('resize', computeMetrics);
    return () => window.removeEventListener('resize', computeMetrics);
  }, []);

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleRelationshipToggle = (relationshipId: string) => {
    const newSelection = selectedRelationshipIds.includes(relationshipId)
      ? selectedRelationshipIds.filter(id => id !== relationshipId)
      : [...selectedRelationshipIds, relationshipId];
    
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    onSelectionChange([]);
  };

  // Measure text width with the exact font
  const measureTextWidth = (text: string): number => {
    if (!fontMetrics) return 0;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;
    ctx.font = fontMetrics.font;
    return ctx.measureText(text).width;
  };

  // Fit function used by both passes
  const fitLabels = (labels: string[], maxWidth: number): number => {
    if (!fontMetrics) return 0;
    const SAFETY_PX = 2; // prevent borderline wrapping due to subpixel differences
    let used = 0;
    let count = 0;
    for (let i = 0; i < labels.length; i++) {
      const partWidth = measureTextWidth(labels[i]);
      const sep = i === 0 ? 0 : fontMetrics.separatorWidth;
      if (used + sep + partWidth <= maxWidth - SAFETY_PX) {
        used += sep + partWidth;
        count++;
      } else {
        break;
      }
    }
    return count;
  };

  const getDisplayText = () => {
    if (selectedRelationshipIds.length === 0) return 'All relationships';

    const selectedRelationships = relationships.filter(r => selectedRelationshipIds.includes(r.id));
    if (selectedRelationships.length === relationships.length) return 'All relationships';

    const labels = selectedRelationships.map(r => r.label);
    if (availableWidth <= 0 || !fontMetrics) {
      const overflowCount = labels.length;
      return overflowCount > 0 ? `+${overflowCount}` : '';
    }

    // Pass 1: Try full width with no indicator
    const allFitCount = fitLabels(labels, availableWidth);
    if (allFitCount === labels.length) {
      return labels.join(' + ');
    }

    // Pass 2: With indicator, iterate until stable
    let shownCount = 0;
    let overflowCount = labels.length; // initial guess
    for (let i = 0; i < 3; i++) { // converges fast; 2-3 iterations are enough
      const indicator = `+${overflowCount}`;
      const indicatorWidth = measureTextWidth(indicator);
      const usable = Math.max(0, availableWidth - indicatorWidth);
      shownCount = fitLabels(labels, usable);
      const nextOverflow = labels.length - shownCount;
      if (nextOverflow === overflowCount) break; // stable
      overflowCount = nextOverflow;
    }

    const base = labels.slice(0, shownCount).join(' + ');
    return overflowCount > 0 ? (base ? `${base} +${overflowCount}` : `+${overflowCount}`) : base;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Button */}
      <div className="flex flex-row justify-between items-center bg-white border border-circle-neutral-variant rounded-[25px] w-[240px] h-[30px] px-1.5">
        <div className="flex flex-row items-center gap-4 flex-1">
          <span ref={textRef} className="h-5 font-circlebodymedium text-left text-circle-primary/35 pl-1.5 pr-2.5 flex-1 whitespace-nowrap overflow-hidden">
            {getDisplayText()}
          </span>
        </div>
        <button
          onClick={handleToggleDropdown}
          className="flex items-center justify-center w-[30px] h-[30px] p-1 hover:bg-circle-neutral rounded transition-colors"
          aria-label="Toggle relationship filter"
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 20 20" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
          >
            <path d="M5 7.5L10 12.5L15 7.5" stroke="#1E1E1E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-circle-neutral-variant rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {/* Select All Option */}
          <button
            onClick={handleSelectAll}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-circle-neutral transition-colors ${
              selectedRelationshipIds.length === 0 ? 'bg-circle-neutral font-medium' : ''
            }`}
          >
            All relationships
          </button>
          
          {/* Divider */}
          <div className="border-t border-circle-neutral-variant"></div>
          
          {/* Individual Relationship Options */}
          {relationships.map((relationship) => (
            <button
              key={relationship.id}
              onClick={() => handleRelationshipToggle(relationship.id)}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-circle-neutral transition-colors flex items-center gap-2 ${
                selectedRelationshipIds.includes(relationship.id) ? 'bg-circle-neutral font-medium' : ''
              }`}
            >
              {/* Checkbox */}
              <div className="w-4 h-4 border border-circle-neutral-variant rounded flex items-center justify-center">
                {selectedRelationshipIds.includes(relationship.id) && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 6L5 9L10 3" stroke="#1E1E1E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span className="capitalize">{relationship.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default RelationshipFilterDropdown;
