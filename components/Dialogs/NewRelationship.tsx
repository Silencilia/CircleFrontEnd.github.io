import React, { useState, useRef, useEffect } from 'react';
import { useContacts, Relationship } from '../../contexts/ContactContext';
import { STRINGS } from '../../data/strings';
import RelationshipTag from '../Tag/RelationshipTag';
import NewButton from '../Button/NewButton';
import ConfirmButton from '../Button/ConfirmButton';
import CancelButton from '../Button/CancelButton';
import TextButton from '../Button/TextButton';

interface NewRelationshipProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (relationship: Relationship) => void;
  contactId: string;
}

const NewRelationship: React.FC<NewRelationshipProps> = ({
  isOpen,
  onClose,
  onSelect,
  contactId,
}) => {
  const { state, addRelationship, updateContact } = useContacts();
  const [selectedRelationship, setSelectedRelationship] = useState<Relationship | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newRelationshipLabel, setNewRelationshipLabel] = useState('');
  const [newRelationshipCategory, setNewRelationshipCategory] = useState<typeof STRINGS.RELATIONSHIPS[keyof typeof STRINGS.RELATIONSHIPS]>(STRINGS.RELATIONSHIPS.PERSONAL);
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ y: 0, scrollTop: 0 });

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedRelationship(null);
      setIsCreatingNew(false);
      setNewRelationshipLabel('');
      setNewRelationshipCategory(STRINGS.RELATIONSHIPS.PERSONAL);
    }
  }, [isOpen]);

  const handleSelectExisting = (relationship: Relationship) => {
    setSelectedRelationship(relationship);
    setIsCreatingNew(false);
  };

  const handleCreateNew = async () => {
    if (!newRelationshipLabel.trim()) return;

    setIsLoading(true);
    try {
      const newRelationship = await addRelationship({
        label: newRelationshipLabel.trim(),
        category: newRelationshipCategory,
      });
      setSelectedRelationship(newRelationship);
      setIsCreatingNew(false);
      setNewRelationshipLabel('');
    } catch (error) {
      console.error('Failed to create relationship:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryToggle = () => {
    setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
  };

  const handleCategorySelect = (category: typeof STRINGS.RELATIONSHIPS[keyof typeof STRINGS.RELATIONSHIPS]) => {
    setNewRelationshipCategory(category);
    setIsCategoryDropdownOpen(false);
  };

  const handleConfirm = async () => {
    if (selectedRelationship) {
      try {
        // Add the selected relationship to the contact's relationship_ids
        const currentContact = state.contacts.find(c => c.id === contactId);
        if (currentContact && !currentContact.relationship_ids.includes(selectedRelationship.id)) {
          const updatedRelationshipIds = [...currentContact.relationship_ids, selectedRelationship.id];
          await updateContact(contactId, { relationship_ids: updatedRelationshipIds });
        }
        
        onSelect(selectedRelationship);
        onClose();
      } catch (error) {
        console.error('Failed to add relationship to contact:', error);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && selectedRelationship) {
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

  return (
    <div className="dlg">
      <div
        className="bg-white rounded-md shadow-xl w-full max-w-[450px] h-fit  px-md py-md flex flex-col gap-4xl overflow-visible"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex flex-col gap-3xl">
          <h2 className="font-circletitlemedium text-circle-primary">Select Relationship</h2>
            <p className="font-circlebodymedium text-circle-primary">Pick an existing relationship or add a new one?</p>
        </div>

       
       <div className="flex flex-col h-fit gap-2xl">
        {/* Content */}
        <div className="flex flex-col h-fit gap-2xl">
          {/* Existing Relationships - Scrollable Column */}
          <div>
  
            <div
              ref={scrollContainerRef}
              className="space-y-1 max-h-[240px] overflow-y-auto rounded-md px-md cursor-grab active:cursor-grabbing"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onWheel={handleWheel}
            >
              {state.relationships.map((relationship) => (
                <div
                  key={relationship.id}
                  className={`p-2 rounded-md cursor-pointer group relative focus:outline-none ${
                    selectedRelationship?.id === relationship.id
                      ? 'border-2 border-circle-primary'
                      : 'focus:before:content-[""] focus:before:absolute focus:before:inset-0 focus:before:border-[2px] focus:before:border-solid focus:before:border-circle-primary focus:before:rounded-md hover:before:content-[""] hover:before:absolute hover:before:inset-0 hover:before:border-[2px] hover:before:border-dashed hover:before:border-circle-primary hover:before:rounded-md'
                  }`}
                  onClick={() => handleSelectExisting(relationship)}
                  tabIndex={0}
                >
                  <div className="flex items-center justify-between">
                    <RelationshipTag 
                      relationship={relationship} 
                      contactId={contactId}
                      fillColor={selectedRelationship?.id === relationship.id
                        ? 'bg-circle-primary'
                        : 'bg-circle-neutral group-hover:bg-circle-primary'
                      }
                      textColor={selectedRelationship?.id === relationship.id
                        ? 'text-white'
                        : 'text-circle-primary group-hover:text-white'
                      }
                      className={selectedRelationship?.id === relationship.id ? 'opacity-100' : 'opacity-75 group-hover:opacity-100'}
                    />
                    <span className="text-xs opacity-75 capitalize ml-2">
                      {relationship.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Create New Relationship */}
          {!isCreatingNew && (
            <div className="font-circlelabelsmall flex justify-center">
              <NewButton
                text="new relationship"
                onClick={() => setIsCreatingNew(true)}
                className="w-fit"
              />
            </div>
          )}

          {/* New Relationship Form */}
          {isCreatingNew && (
            <div className="w-full h-fit p-md rounded-sm bg-circle-neutral-variant text-circle-primary">

              

              {/* input zone */}
              <div className="flex flex-col gap-lg">
             

                 {/* Column 1: new relationship and input field */}  
                 <div className="flex flex-col gap-sm">
                   <h3 className="font-circlelabelmedium text-circle-primary">new relationship</h3>
                   <div className="flex flex-row justify-between items-center bg-white border border-circle-neutral-variant rounded-lg w-full h-[30px] px-sm">
                     <div className="flex flex-row items-center gap-4 flex-1">
                       <input
                         type="text"
                         value={newRelationshipLabel}
                         onChange={(e) => setNewRelationshipLabel(e.target.value)}
                         placeholder="Enter relationship label..."
                         className={`h-5 text-left flex-1 focus:outline-none ${
                           newRelationshipLabel.trim() 
                             ? 'font-circlebodymedium text-circle-primary' 
                             : 'font-circlebodymedium-draft text-circle-primary/50'
                         }`}
                         autoFocus
                       />
                     </div>
                   </div>
                 </div>

                 {/* Column 2: category and dropdown menu*/}  
                 <div className="flex flex-col gap-sm">
                   <h3 className="font-circlelabelmedium text-circle-primary">category</h3>
                   <div className="relative">
                     <div 
                       className="flex flex-row justify-between items-center bg-white border border-circle-neutral-variant rounded-lg w-full h-[30px] px-1.5 cursor-pointer hover:bg-circle-neutral transition-colors"
                       onClick={handleCategoryToggle}
                     >
                       <div className="flex flex-row items-center gap-4 flex-1">
                         <span className="font-circlelabelmedium text-left text-circle-primary pl-1.5 pr-2.5 flex-1 whitespace-nowrap overflow-hidden flex items-center">
                           {newRelationshipCategory}
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
                         {Object.values(STRINGS.RELATIONSHIPS).map((category) => (
                           <button
                             key={category}
                             onClick={() => handleCategorySelect(category)}
                             className={`w-full px-4 py-2 text-left text-sm hover:bg-circle-neutral transition-colors ${
                               newRelationshipCategory === category ? 'bg-circle-neutral font-medium' : ''
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
                 <div className="flex gap-lg">
                   <TextButton
                     onClick={handleCreateNew}
                     disabled={!newRelationshipLabel.trim() || isLoading}
                     className="flex-1"
                     minWidth={80}
                     inactiveClass="bg-circle-neutral text-circle-primary hover:bg-circle-primary hover:text-white"
                   >
                     {isLoading ? 'Creating...' : 'Create'}
                   </TextButton>
                   <TextButton
                     onClick={() => {
                       setIsCreatingNew(false);
                       setNewRelationshipLabel('');
                     }}
                     className="flex-1"
                     minWidth={80}
                     inactiveClass="bg-circle-neutral text-circle-primary hover:bg-circle-primary hover:text-white"
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
              <span className="font-circlebodysmall text-circle-primary">
                Total: {state.relationships.length} relationships
              </span>
            </div>
            <div className="flex flex-row gap-xs">
              <CancelButton onClick={onClose} />
              <ConfirmButton
                onClick={handleConfirm}
                ariaLabel="Select relationship"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default NewRelationship;
