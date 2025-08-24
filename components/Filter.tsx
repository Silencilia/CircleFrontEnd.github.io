import React, { useState } from 'react';

const Filter: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRelationship, setSelectedRelationship] = useState('All relationships');

  // Placeholder filter function - to be implemented later
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // TODO: Implement search filtering logic
  };

  const handleRelationshipChange = (relationship: string) => {
    setSelectedRelationship(relationship);
    // TODO: Implement relationship filtering logic
  };

  return (
    <div className="w-full bg-circle-neutral px-4 py-4">
      <div className="flex justify-center">
        <div className="flex flex-row items-center gap-5">
          {/* Search Field */}
          <div className="flex flex-row justify-between items-center bg-white border border-circle-neutral-variant rounded-[25px] w-[560px] h-[30px] px-1.5">
            <div className="flex flex-row justify-center items-center gap-4">
              {/* Search Icon */}
              <div className="w-5 h-5 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z" stroke="#1E1E1E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search contacts"
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-[111px] h-5 font-inter font-medium text-sm leading-5 text-center text-circle-primary/35 placeholder-circle-primary/35 focus:outline-none"
              />
            </div>
          </div>

          {/* Relationship Checker */}
          <div className="flex flex-row justify-between items-center bg-white border border-circle-neutral-variant rounded-[25px] w-[240px] h-[30px] px-1.5">
            <div className="flex flex-row justify-center items-center gap-4">
              <span className="w-[108px] h-5 font-inter font-medium text-sm leading-5 text-center text-circle-primary/35">
                {selectedRelationship}
              </span>
            </div>
            <button
              onClick={() => handleRelationshipChange('All relationships')}
              className="flex items-center justify-center w-[30px] h-[30px] p-1"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 7.5L10 12.5L15 7.5" stroke="#1E1E1E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filter;
