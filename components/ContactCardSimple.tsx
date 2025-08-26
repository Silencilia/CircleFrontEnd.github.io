import React from 'react';
import { Contact, Subject, useContacts } from '../contexts/ContactContext';
import { SubjectTag, OverflowTag } from './Tag';

interface ContactCardSimpleProps {
  contact: Contact;
}

const ContactCardSimple: React.FC<ContactCardSimpleProps> = ({ contact }) => {
  const { state } = useContacts();
  
  // Look up the actual data using IDs
  const occupation = contact.occupationId ? state.occupations.find(o => o.id === contact.occupationId) : null;
  const subjects = contact.subjectIds ? contact.subjectIds.map(id => state.subjects.find(s => s.id === id)).filter(Boolean) as Subject[] : [];

  // Ensure subjects is always an array
  const safeSubjects = Array.isArray(subjects) ? subjects : [];

  // Calculate how many subjects can fit in the container
  // Container width: w-54 (216px), subject width: w-15 (60px), gap: 4px
  // Container height: h-11 (44px), subject height: h-5 (20px), gap: 4px
  // First row: (216 - 60) / (60 + 4) + 1 = 3 subjects
  // Second row: (216 - 60) / (60 + 4) + 1 = 3 subjects
  // Total: 6 subjects can fit comfortably
  const maxVisibleSubjects = 6;
  const visibleSubjects = safeSubjects.slice(0, maxVisibleSubjects);
  const hiddenCount = safeSubjects.length - maxVisibleSubjects;

  // Format birth date from ISO format to "Month Date, Year" format
  const formatBirthDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // Return original if parsing fails
      }
      
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      return dateString; // Return original if any error occurs
    }
  };

  return (
    <div className="w-56 h-fit bg-circle-neutral-variant rounded-xl p-3 flex flex-col gap-3">
      {/* Contact Info */}
      <div className="flex flex-col h-fit gap-1">
        <div className="font-inter font-medium text-base leading-6 text-circle-primary truncate">
          {contact.name}
        </div>
        <div className="font-inter font-normal text-sm leading-5 text-circle-primary truncate h-[20px]">
          {occupation?.title || ''}
        </div>
        <div className="font-inter font-normal text-sm leading-5 text-circle-primary truncate h-[20px]">
          {contact.birthDate ? formatBirthDate(contact.birthDate) : ''}
        </div>
      </div>
      
      {/* Subjects */}
      <div className="flex flex-row flex-wrap items-start content-start gap-[5px] w-54 h-[45px] overflow-hidden">
        {safeSubjects.length > 0 ? (
          <>
            {visibleSubjects.map((subject: Subject) => (
              <SubjectTag 
                key={subject.id} 
                subject={subject} 
                contactId={contact.id}
                fillColor="bg-[#E76835]"
                className="w-15"
                editable={true}
                deletable={true}
              />
            ))}
            {hiddenCount > 0 && (
              <OverflowTag 
                count={hiddenCount} 
                fillColor="bg-[#E76835]"
                className="w-15"
              />
            )}
          </>
        ) : (
          <div className="text-xs text-gray-400 italic">
            No subjects assigned
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactCardSimple;
