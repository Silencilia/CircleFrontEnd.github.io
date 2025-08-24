import React, { useRef, useState, useCallback, useEffect } from 'react';
import ContactCardSimple from './ContactCardSimple';
import { Contact, Subject } from '../contexts/ContactContext';

interface ContactPreviewProps {
  contacts: Contact[];
}

const ContactPreview: React.FC<ContactPreviewProps> = ({ contacts }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    
    setIsDragging(true);
    setStartX(e.clientX); // Use clientX instead of pageX
    setScrollLeft(scrollRef.current.scrollLeft);
    
    // Prevent text selection during drag
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    
    const x = e.clientX;
    const walk = (startX - x) * 1.5; // Inverted and adjusted multiplier
    scrollRef.current.scrollLeft = scrollLeft + walk;
  }, [isDragging, startX, scrollLeft]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch events for mobile devices
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setScrollLeft(scrollRef.current.scrollLeft);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !scrollRef.current) return;
    
    const x = e.touches[0].clientX;
    const walk = (startX - x) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft + walk;
  }, [isDragging, startX, scrollLeft]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global mouse event listeners for better drag handling
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Use contacts directly without strict validation for now
  const validContacts = contacts || [];

  return (
    <div className="w-full bg-circle-neutral px-4 pt-0 pb-6">
      <div className="max-w-7xl mx-auto">
        <div 
          ref={scrollRef}
          className={`flex gap-4 overflow-x-auto pb-4 scrollbar-hide select-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ 
            scrollBehavior: isDragging ? 'auto' : 'smooth',
            userSelect: isDragging ? 'none' : 'auto'
          }}
        >
          {validContacts.length > 0 ? (
            validContacts.map((contact) => (
              <div key={contact.id} className="flex-shrink-0">
                <ContactCardSimple
                  name={contact.name}
                  occupation={contact.occupation}
                  birthDate={contact.birthDate}
                  subjects={contact.subjects || []}
                />
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>No contacts to display</p>
            </div>
          )}
        </div>
        
        {/* Scroll hint for users */}
        <div className="text-center mt-2">
          <span className="text-xs text-circle-primary/60 font-inter">
            {isDragging ? 'Drag to scroll' : 'Drag or scroll to see more contacts'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ContactPreview;
