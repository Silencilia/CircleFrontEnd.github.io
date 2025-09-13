import React, { useRef, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ContactCardDetail from './Cards/ContactCardDetail';
import NoteCardDetail from './Cards/NoteCardDetail';
import ContactCardSimple from './Cards/ContactCardSimple';
import { Contact, Subject } from '../contexts/ContactContext';

interface ContactPreviewProps {
  contacts: Contact[];
}

const ContactPreview: React.FC<ContactPreviewProps> = ({ contacts }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [selectedNote, setSelectedNote] = useState<import('../contexts/ContactContext').Note | null>(null);

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

  // Use contacts directly without strict validation for now, filter out trashed
  const validContacts = (contacts || []).filter(c => !c.isTrashed);

  return (
    <div className="w-full bg-circle-neutral px-4 pt-0 pb-6">
      <div className="w-full">
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
                  contact={contact}
                  onMenuClick={() => setSelectedContact(contact)}
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

      {/* Overlay for ContactCardDetail via portal */}
      {typeof window !== 'undefined' && selectedContact
        ? createPortal(
            (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]" onClick={(e) => { if (e.target === e.currentTarget) setSelectedContact(null); }}>
                <ContactCardDetail 
                  contact={selectedContact} 
                  onMinimize={() => setSelectedContact(null)}
                  onOpenNote={(note) => {
                    setSelectedNote(note);
                    setSelectedContact(null);
                  }}
                  onOpenContactDetail={(nextContact) => setSelectedContact(nextContact)}
                />
              </div>
            ),
            document.body
          )
        : null}

      {/* Overlay for NoteCardDetail via portal */}
      {typeof window !== 'undefined' && selectedNote
        ? createPortal(
            (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]" onClick={(e) => { if (e.target === e.currentTarget) setSelectedNote(null); }}>
                <NoteCardDetail 
                  note={selectedNote}
                  onMinimize={() => setSelectedNote(null)}
                  onOpenContactDetail={(contact) => {
                    setSelectedContact(contact);
                    setSelectedNote(null);
                  }}
                />
              </div>
            ),
            document.body
          )
        : null}
    </div>
  );
};

export default ContactPreview;
