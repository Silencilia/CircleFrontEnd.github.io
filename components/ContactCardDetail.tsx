import React, { useRef, useState } from 'react';
import { Contact, Subject, Relationship, Note, useContacts } from '../contexts/ContactContext';
import { SubjectTag, RelationshipTag } from './Tag';
import NoteCard from './NoteCard';
import { CalendarIcon, MinimizeIcon, NoteIcon } from './icons';

interface ContactCardDetailProps {
  contact: Contact;
  onMinimize?: () => void;
}

const ContactCardDetail: React.FC<ContactCardDetailProps> = ({ contact, onMinimize }) => {
  const { state } = useContacts();
  const notesContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  // Get related data
  const occupation = contact.occupationId ? state.occupations.find(o => o.id === contact.occupationId) : null;
  const organization = contact.organizationId ? state.organizations.find(org => org.id === contact.organizationId) : null;
  const subjects = contact.subjectIds ? contact.subjectIds.map(id => state.subjects.find(s => s.id === id)).filter(Boolean) as Subject[] : [];
  const relationships = contact.relationshipIds ? contact.relationshipIds.map(id => state.relationships.find(r => r.id === id)).filter(Boolean) as Relationship[] : [];
  const notes = contact.noteIds ? contact.noteIds.map(id => state.notes.find(n => n.id === id)).filter(Boolean) as Note[] : [];

  // Format birth date
  const formatBirthDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      return dateString;
    }
  };

  // Mouse drag scrolling handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!notesContainerRef.current) return;
    
    setIsDragging(true);
    setStartY(e.clientY - notesContainerRef.current.offsetTop);
    setScrollTop(notesContainerRef.current.scrollTop);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !notesContainerRef.current) return;
    
    const y = e.clientY - notesContainerRef.current.offsetTop;
    const walk = (y - startY) * 2;
    notesContainerRef.current.scrollTop = scrollTop - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="w-fit h-[889px] bg-white shadow-[2px_2px_10px_rgba(0,0,0,0.25)] rounded-xl p-[15px] flex flex-col gap-[40px]">
      {/* Contact Info Section */}
      <div className="w-fit h-[104px] flex flex-col gap-[10px]">
        <div className="w-[600px] h-[74px] flex flex-row justify-between items-start gap-[136px]">
          {/* Left side - Contact Info */}
          <div className="w-fit h-[74px] flex flex-col gap-[10px]">
            {/* Name */}
            <div className="w-fit h-[24px] flex items-center">
              <div className="font-inter font-medium text-base leading-6 text-circle-primary">
                {contact.name}
              </div>
            </div>
            
            {/* Occupation and Organization */}
            <div className="w-fit h-[40px] flex flex-col gap-0">
              <div className="w-fit h-[20px] flex items-center">
                <div className="font-inter font-normal text-sm leading-5 text-circle-primary h-[20px]">
                  {occupation?.title || ''}
                </div>
              </div>
              <div className="font-inter font-normal text-sm leading-5 text-circle-primary h-[20px]">
                {organization?.name || ''}
              </div>
            </div>
          </div>

          {/* Right side - Minimize button and Edit/Save buttons */}
          <div className="w-fit h-[16px] flex flex-row justify-end items-center gap-[10px]">
            <button
              onClick={onMinimize}
              className="w-4 h-4 flex items-center justify-center hover:bg-circle-neutral rounded transition-colors"
              aria-label="Minimize contact detail"
            >
              <MinimizeIcon width={16} height={16} className="text-circle-primary" />
            </button>
          </div>
        </div>

        {/* Birth Date */}
        <div className="w-fit h-[20px] flex flex-col gap-0">
          <div className="w-fit h-[20px] flex flex-row items-center gap-[10px]">
            <CalendarIcon width={16} height={16} className="text-circle-primary" />
            <span className="font-inter font-normal text-sm leading-5 text-circle-primary tracking-[0.25px]">
              {contact.birthDate ? formatBirthDate(contact.birthDate) : 'No birth date'}
            </span>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="w-fit h-[580px] flex flex-col gap-[20px]">
        {/* Notes Header */}
        <div className="w-fit h-[20px] flex flex-row items-center gap-[10px]">
          <NoteIcon width={16} height={16} className="text-circle-primary" />
          <span className="font-inter font-normal text-sm leading-5 text-circle-primary tracking-[0.25px]">
            {notes.length} notes
          </span>
        </div>

        {/* Note Cards Container - Scrollable with mouse drag */}
        <div 
          ref={notesContainerRef}
          className={`w-fit h-[540px] overflow-y-auto flex flex-col gap-[20px] cursor-grab select-none scrollbar-hide ${
            isDragging ? 'cursor-grabbing' : ''
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {notes.length > 0 ? (
            notes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))
          ) : (
            <div className="text-center text-gray-500 italic py-8">
              No notes available for this contact
            </div>
          )}
        </div>
      </div>

      {/* Tags Section */}
      <div className="w-fit h-[95px] flex flex-col gap-[5px] overflow-y-auto">
        {/* Relationships */}
        <div className="w-fit h-[20px] flex flex-row flex-wrap items-start content-start gap-[5px]">
          {relationships.map((relationship) => (
            <RelationshipTag
              key={relationship.id}
              relationship={relationship}
              contactId={contact.id}
              editable={false}
            />
          ))}
        </div>

        {/* Subjects */}
        <div className="w-fit h-[70px] flex flex-row flex-wrap items-start content-start gap-[5px]">
          {subjects.map((subject) => (
            <SubjectTag
              key={subject.id}
              subject={subject}
              contactId={contact.id}
              editable={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactCardDetail;
