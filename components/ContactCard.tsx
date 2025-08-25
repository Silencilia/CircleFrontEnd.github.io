import React, { useRef, useEffect, useState } from 'react';
import { Contact, Subject, useContacts } from '../contexts/ContactContext';

interface ContactCardProps {
  contact: Contact;
}

const ContactCard: React.FC<ContactCardProps> = ({ contact }) => {
  const { state } = useContacts();
  const subjectsRef = useRef<HTMLDivElement>(null);
  const [visibleSubjects, setVisibleSubjects] = useState<Subject[]>([]);
  const [showOverflow, setShowOverflow] = useState(false);
  const [hiddenCount, setHiddenCount] = useState(0);

  // Look up the actual data using IDs
  const occupation = contact.occupationId ? state.occupations.find(o => o.id === contact.occupationId) : null;
  const organization = contact.organizationId ? state.organizations.find(org => org.id === contact.organizationId) : null;
  const subjects = contact.subjectIds ? contact.subjectIds.map(id => state.subjects.find(s => s.id === id)).filter(Boolean) as Subject[] : [];
  const relationships = contact.relationshipIds ? contact.relationshipIds.map(id => state.relationships.find(r => r.id === id)).filter(Boolean) : [];

  // Format birth date from ISO format to "Month Date, Year" format
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

  // Get the first relationship for display (if any)
  const primaryRelationship = relationships?.[0];
  
  // Measure how many subjects actually fit in 2 rows
  useEffect(() => {
    if (!subjectsRef.current || subjects.length === 0) {
      setVisibleSubjects(subjects);
      setShowOverflow(false);
      setHiddenCount(0);
      return;
    }

    // First, render all subjects to see how they wrap
    const container = subjectsRef.current;
    const subjectElements = container.querySelectorAll('[data-subject-tag]');
    
    if (subjectElements.length === 0) {
      setVisibleSubjects(subjects);
      setShowOverflow(false);
      setHiddenCount(0);
      return;
    }

    // Find the first element that starts the third row
    let subjectsInTwoRows = 0;
    let currentRow = 1;
    let previousTop = 0;

    for (let i = 0; i < subjectElements.length; i++) {
      const element = subjectElements[i] as HTMLElement;
      const rect = element.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const relativeTop = rect.top - containerRect.top;

      if (i === 0) {
        previousTop = relativeTop;
        subjectsInTwoRows++;
      } else if (Math.abs(relativeTop - previousTop) < 5) {
        // Same row (within 5px tolerance)
        subjectsInTwoRows++;
      } else if (currentRow < 2) {
        // New row, but still within 2-row limit
        currentRow++;
        previousTop = relativeTop;
        subjectsInTwoRows++;
      } else {
        // Third row detected, stop counting
        break;
      }
    }

    // Apply the logic: if all subjects fit in 2 rows, show all; otherwise limit and add overflow
    if (subjectsInTwoRows >= subjects.length) {
      // All subjects fit in 2 rows - show all of them
      setVisibleSubjects(subjects);
      setShowOverflow(false);
      setHiddenCount(0);
    } else {
      // More subjects than fit in 2 rows - need overflow indicator
      // Reserve space for overflow indicator by showing 1 fewer subject
      const maxVisible = Math.max(0, subjectsInTwoRows - 1);
      setVisibleSubjects(subjects.slice(0, maxVisible));
      setShowOverflow(true);
      setHiddenCount(subjects.length - maxVisible);
    }
    
    // Debug logging
    console.log('ContactCard measurement:', {
      contactName: contact.name,
      totalSubjects: subjects.length,
      subjectsInTwoRows,
      maxVisible: subjectsInTwoRows >= subjects.length ? subjects.length : Math.max(0, subjectsInTwoRows - 1),
      showOverflow: subjects.length > subjectsInTwoRows
    });
  }, [subjects]);

  return (
    <div className="w-80 h-fit bg-circle-neutral-variant rounded-xl p-3 flex flex-col gap-[20px]">
              {/* Top Section - Contact Info and Menu */}
        <div className="flex flex-col gap-[10px] w-full">
        {/* Row with contact info and menu button */}
        <div className="flex flex-row justify-between items-start w-full">
          {/* Contact Info Column */}
          <div className="flex flex-col gap-0">
            <div className="font-inter font-medium text-base leading-6 text-circle-primary">
              {contact.name}
            </div>
            <div className="font-inter font-normal text-sm leading-5 text-circle-primary">
              {occupation?.title || 'No occupation'}
            </div>
            {organization && (
              <div className="font-inter font-normal text-sm leading-5 text-circle-primary">
                {organization.name}
              </div>
            )}
          </div>
          
          {/* Menu Button */}
          <div className="w-4 h-4 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 8H13M3 4H13M3 12H13" stroke="#1E1E1E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        
        {/* Birthdate and Notes Column */}
        <div className="flex flex-col gap-0">
          {contact.birthDate && (
            <div className="font-inter font-normal text-sm leading-5 text-circle-primary">
              {formatBirthDate(contact.birthDate)}
            </div>
          )}
          <div className="flex flex-row items-center gap-2 flex-shrink-0">
            {/* Edit Icon */}
            <div className="w-4 h-4 flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.25 1.875L13.125 3.75L4.6875 12.1875H2.8125V10.3125L11.25 1.875Z" stroke="#1E1E1E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {/* Notes Count */}
            <span className="font-inter font-normal text-sm leading-5 text-circle-primary">
              {contact.noteIds?.length || 0} notes
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Section - Relationship and Subjects */}
      <div className="flex flex-col gap-[5px] w-full">
        {/* Relationship Tag */}
        {primaryRelationship && (
          <div className="flex flex-row flex-wrap items-start content-start gap-0 w-full">
            <div 
              className="px-1 py-0.5 bg-circle-primary rounded-md flex items-center justify-center h-5 flex-shrink-0"
              style={{ minWidth: `${Math.max(primaryRelationship.label.length * 8, 34)}px` }}
            >
              <span className="font-inter font-medium text-[11px] leading-4 text-white text-center tracking-[0.5px]">
                {primaryRelationship.label}
              </span>
            </div>
          </div>
        )}

        {/* Hidden measurement container - renders all subjects to measure wrapping */}
        <div 
          ref={subjectsRef}
          className="absolute opacity-0 pointer-events-none w-full"
          style={{ left: '-9999px', width: '296px' }}
        >
          <div className="flex flex-row flex-wrap items-start content-start gap-1 w-full">
            {subjects.map((subject: Subject) => (
              <div
                key={`measure-${subject.id}`}
                data-subject-tag
                className="px-1 py-0.5 bg-circle-secondary rounded-md flex items-center justify-center h-5 flex-shrink-0"
                style={{ minWidth: `${Math.max(subject.label.length * 8, 34)}px` }}
              >
                <span className="font-inter font-medium text-[11px] leading-4 text-white text-center tracking-[0.5px]">
                  {subject.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Visible subjects container - limited to 2 rows with overflow indicator */}
        <div className="flex flex-row flex-wrap items-start content-start gap-[5px] w-full max-h-[45px] overflow-hidden">
          {subjects.length > 0 ? (
            <>
              {visibleSubjects.map((subject: Subject) => (
                <div
                  key={subject.id}
                  className="px-1 py-0.5 bg-circle-secondary rounded-md flex items-center justify-center h-5 flex-shrink-0"
                  style={{ minWidth: `${Math.max(subject.label.length * 8, 34)}px` }}
                >
                  <span className="font-inter font-medium text-[11px] leading-4 text-white text-center tracking-[0.5px]">
                    {subject.label}
                  </span>
                </div>
              ))}
              {showOverflow && (
                <div className="px-1 py-0.5 bg-circle-secondary rounded-md flex items-center justify-center h-5 flex-shrink-0">
                  <span className="font-inter font-medium text-[11px] leading-4 text-white text-center tracking-[0.5px]">
                    +{hiddenCount}
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="text-xs text-gray-400 italic">
              No subjects assigned
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactCard;
