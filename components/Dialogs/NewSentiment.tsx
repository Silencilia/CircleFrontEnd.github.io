import React, { useState, useRef, useEffect } from 'react';

import { createPortal } from 'react-dom';
import { useContacts, Sentiment } from '../../contexts/ContactContext';
import { STRINGS } from '../../data/strings';
import SentimentTag from '../Tag/SentimentTag';
import NewButton from '../Button/NewButton';
import ConfirmButton from '../Button/ConfirmButton';
import CancelButton from '../Button/CancelButton';
import TextButton from '../Button/TextButton';

interface NewSentimentProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (sentiment: Sentiment) => void;
  noteId: string;
}

const NewSentiment: React.FC<NewSentimentProps> = ({
  isOpen,
  onClose,
  onSelect,
  noteId,
}) => {
  const { state, addSentiment } = useContacts();
  const [selectedSentiment, setSelectedSentiment] = useState<Sentiment | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newSentimentLabel, setNewSentimentLabel] = useState('');
  const [newSentimentCategory, setNewSentimentCategory] = useState<typeof STRINGS.SENTIMENTS[keyof typeof STRINGS.SENTIMENTS]>(STRINGS.SENTIMENTS.POSITIVE);
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ y: 0, scrollTop: 0 });

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedSentiment(null);
      setIsCreatingNew(false);
      setNewSentimentLabel('');
      setNewSentimentCategory(STRINGS.SENTIMENTS.POSITIVE);
    }
  }, [isOpen]);

  const handleSelectExisting = (sentiment: Sentiment) => {
    setSelectedSentiment(sentiment);
    setIsCreatingNew(false);
  };

  const handleCreateNew = async () => {
    if (!newSentimentLabel.trim()) return;

    setIsLoading(true);
    try {
      const newSentiment = await addSentiment({
        label: newSentimentLabel.trim(),
        category: newSentimentCategory,
      });
      setSelectedSentiment(newSentiment);
      setIsCreatingNew(false);
      setNewSentimentLabel('');
    } catch (error) {
      console.error('Failed to create sentiment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryToggle = () => {
    setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
  };

  const handleCategorySelect = (category: typeof STRINGS.SENTIMENTS[keyof typeof STRINGS.SENTIMENTS]) => {
    setNewSentimentCategory(category);
    setIsCategoryDropdownOpen(false);
  };

  const handleConfirm = () => {
    if (selectedSentiment) {
      onSelect(selectedSentiment);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && selectedSentiment) {
      handleConfirm();
    }
  };

  // Drag scrolling handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scrollContainerRef.current) {
      setIsDragging(true);
      setDragStart({
        y: e.clientY,
        scrollTop: scrollContainerRef.current.scrollTop,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scrollContainerRef.current) {
      const deltaY = e.clientY - dragStart.y;
      scrollContainerRef.current.scrollTop = dragStart.scrollTop - deltaY;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Mouse wheel scrolling
  const handleWheel = (e: React.WheelEvent) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop += e.deltaY;
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
        <div
          className="bg-white rounded-lg shadow-xl max-w-md w-[450px] max-h-[80vh] px-[15px] py-[15px] flex flex-col gap-[40px] overflow-visible"
          onKeyDown={handleKeyDown}
        >
        {/* Header */}
        <div className="flex flex-col gap-[25px]">
          <h2 className="Circletitlemedium text-circle-primary">Select Sentiment</h2>
            <p className="Circlebodymedium text-circle-primary">Pick an existing sentiment or add a new one?</p>
        </div>

       
       <div className="flex flex-col h-fit gap-[40px]">
        {/* Content */}
        <div className="flex flex-col h-fit gap-[40px]">
          {/* Existing Sentiments - Scrollable Column */}
          <div>
  
            <div
              ref={scrollContainerRef}
              className="space-y-1 max-h-[240px] overflow-y-auto rounded-md px-[15px] cursor-grab active:cursor-grabbing"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onWheel={handleWheel}
            >
              {state.sentiments.map((sentiment) => (
                <div
                  key={sentiment.id}
                  className={`p-2 rounded-md cursor-pointer group relative focus:outline-none ${
                    selectedSentiment?.id === sentiment.id
                      ? 'border-2 border-circle-primary'
                      : 'focus:before:content-[""] focus:before:absolute focus:before:inset-0 focus:before:border-[2px] focus:before:border-solid focus:before:border-circle-primary focus:before:rounded-md hover:before:content-[""] hover:before:absolute hover:before:inset-0 hover:before:border-[2px] hover:before:border-dashed hover:before:border-circle-primary hover:before:rounded-md'
                  }`}
                  onClick={() => handleSelectExisting(sentiment)}
                  tabIndex={0}
                >
                  <div className="flex items-center justify-between">
                    <SentimentTag 
                      sentiment={sentiment} 
                      noteId={noteId}
                      fillColor={selectedSentiment?.id === sentiment.id
                        ? 'bg-circle-primary'
                        : 'bg-circle-neutral group-hover:bg-circle-primary'
                      }
                      textColor={selectedSentiment?.id === sentiment.id
                        ? 'text-white'
                        : 'text-circle-primary group-hover:text-white'
                      }
                      className={selectedSentiment?.id === sentiment.id ? 'opacity-100' : 'opacity-75 group-hover:opacity-100'}
                    />
                    <span className="text-xs opacity-75 capitalize ml-2">
                      {sentiment.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Create New Sentiment */}
          {!isCreatingNew && (
            <div className="Circlelabelsmall flex justify-center">
              <NewButton
                text="new sentiment"
                onClick={() => setIsCreatingNew(true)}
                className="w-fit"
              />
            </div>
          )}

          {/* New Sentiment Form */}
          {isCreatingNew && (
            <div className="px-[15px] rounded-[12px] gap-[10px]bg-circle-neutral-variant text-circle-primary">

              

              {/* input zone */}
              <div className="flex flex-col gap-[30px]">
             

                 {/* Column 1: new sentiment and input field */}  
                 <div className="flex flex-col gap-[10px]">
                   <h3 className="Circlelabelmedium text-circle-primary/50">new sentiment</h3>
                   <div className="flex flex-row justify-between items-center bg-white border border-circle-neutral-variant rounded-[25px] w-full h-[30px] px-1.5">
                     <div className="flex flex-row items-center gap-4 flex-1">
                       <input
                         type="text"
                         value={newSentimentLabel}
                         onChange={(e) => setNewSentimentLabel(e.target.value)}
                         placeholder="Enter sentiment label..."
                         className={`h-5 text-left pl-1.5 pr-2.5 flex-1 focus:outline-none ${
                           newSentimentLabel.trim() 
                             ? 'font-circlebodymedium text-circle-primary' 
                             : 'font-circlebodymedium-draft text-circle-primary/50'
                         }`}
                         autoFocus
                       />
                     </div>
                   </div>
                 </div>

                 {/* Column 2: category and dropdown menu*/}  
                 <div className="flex flex-col gap-[10px]">
                   <h3 className="Circlelabelmedium text-circle-primary/50">category</h3>
                   <div className="relative">
                     <div 
                       className="flex flex-row justify-between items-center bg-white border border-circle-neutral-variant rounded-[25px] w-full h-[30px] px-1.5 cursor-pointer hover:bg-circle-neutral transition-colors"
                       onClick={handleCategoryToggle}
                     >
                       <div className="flex flex-row items-center gap-4 flex-1">
                         <span className="font-circlelabelmedium text-left text-circle-primary pl-1.5 pr-2.5 flex-1 whitespace-nowrap overflow-hidden flex items-center">
                           {newSentimentCategory}
                         </span>
                       </div>
                       <div className="flex items-center justify-center w-[30px] h-[30px] p-1">
                         <svg 
                           width="20" 
                           height="20" 
                           viewBox="0 0 20 20" 
                           fill="none" 
                           xmlns="http://www.w3.org/2000/svg"
                           className={`transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`}
                         >
                           <path d="M5 7.5L10 12.5L15 7.5" stroke="#1E1E1E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                         </svg>
                       </div>
                     </div>

                     {/* Dropdown Menu */}
                     {isCategoryDropdownOpen && (
                       <div className="absolute top-full left-0 mt-1 w-full bg-white border border-circle-neutral-variant rounded-lg shadow-lg z-[10001] max-h-48 overflow-y-auto">
                         {Object.values(STRINGS.SENTIMENTS).map((category) => (
                           <button
                             key={category}
                             onClick={() => handleCategorySelect(category)}
                             className={`w-full px-4 py-2 text-left text-sm hover:bg-circle-neutral transition-colors ${
                               newSentimentCategory === category ? 'bg-circle-neutral font-medium' : ''
                             }`}
                           >
                             {category}
                           </button>
                         ))}
                       </div>
                     )}
                   </div>
                 </div>

                 {/* Buttons */}
                 <div className="flex gap-[10px]">
                   <TextButton
                     onClick={handleCreateNew}
                     disabled={!newSentimentLabel.trim() || isLoading}
                     className="flex-1 !h-[30px] !rounded-[15px]"
                     minWidth={80}
                     paddingX={12}
                     inactiveClass="bg-circle-neutral-variant text-circle-primary hover:bg-circle-primary hover:text-white"
                   >
                     {isLoading ? 'Creating...' : 'Create'}
                   </TextButton>
                   <TextButton
                     onClick={() => {
                       setIsCreatingNew(false);
                       setNewSentimentLabel('');
                     }}
                     className="flex-1 !h-[30px] !rounded-[15px]"
                     minWidth={80}
                     paddingX={12}
                     inactiveClass="bg-circle-neutral-variant text-circle-primary hover:bg-circle-primary hover:text-white"
                   >
                     Cancel
                   </TextButton>
                 </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div>
          <div className="w-full items-center flex justify-between">
            <div className="flex justify-start items-center">
              <span className="Circlebodysmall text-circle-primary">
                Total: {state.sentiments.length} sentiments
              </span>
            </div>
            <div className="flex flex-row gap-[2px]">
              <CancelButton onClick={onClose} />
              <ConfirmButton
                onClick={handleConfirm}
                ariaLabel="Select sentiment"
              />
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default NewSentiment;
