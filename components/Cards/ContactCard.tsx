import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Contact, Subject, useContacts, Relationship } from '../../contexts/ContactContext';
import { SubjectTag, RelationshipTag, OverflowTag } from '../Tag';
import { MenuButton } from '../Button';
import { formatYyyyMmDdToLong } from '../../data/strings';

interface ContactCardProps {
  contact: Contact;
  onMenuClick: () => void;
  relationshipFilterIds?: string[];
}

const ContactCard: React.FC<ContactCardProps> = ({ contact, onMenuClick, relationshipFilterIds = [] }) => {
  if (contact.is_trashed) {
    return null;
  }
  const { state } = useContacts();
  const subjectsRef = useRef<HTMLDivElement>(null);
  const [visibleSubjects, setVisibleSubjects] = useState<Subject[]>([]);
  const [showOverflow, setShowOverflow] = useState(false);
  const [hiddenCount, setHiddenCount] = useState(0);

  // Use useMemo to prevent recreating these arrays on every render
  const occupation = useMemo(() => 
    contact.occupation_id ? state.occupations.find(o => o.id === contact.occupation_id) : null, 
    [contact.occupation_id, state.occupations]
  );
  
  const organization = useMemo(() => 
    contact.organization_id ? state.organizations.find(org => org.id === contact.organization_id) : null, 
    [contact.organization_id, state.organizations]
  );
  
  const subjects = useMemo(() => 
    contact.subject_ids ? contact.subject_ids.map(id => state.subjects.find(s => s.id === id)).filter(Boolean) as Subject[] : [], 
    [contact.subject_ids, state.subjects]
  );
  
  const relationships = useMemo(() => 
    contact.relationship_ids ? contact.relationship_ids.map(id => state.relationships.find(r => r.id === id)).filter(Boolean) : [], 
    [contact.relationship_ids, state.relationships]
  );

  // Format birth date without timezone conversion
  const formatBirthDateFromFields = (birth?: Contact['birth_date']): string => {
    if (!birth || (!birth.year && !birth.month && !birth.day)) return 'no birth date';
    if (birth.year && !birth.month && !birth.day) return `${birth.year}`;
    if (birth.year && birth.month && !birth.day) {
      const months = [
        'January','February','March','April','May','June',
        'July','August','September','October','November','December'
      ];
      return `${months[birth.month - 1]}, ${birth.year}`;
    }
    if (birth.year && birth.month && birth.day) {
      const months = [
        'January','February','March','April','May','June',
        'July','August','September','October','November','December'
      ];
      return `${months[birth.month - 1]} ${birth.day}, ${birth.year}`;
    }
    return 'no birth date';
  };

  // Prefer showing a relationship that matches the active filter (if any)
  const primaryRelationship = useMemo(() => {
    if (!relationships || relationships.length === 0) return undefined;
    if (relationshipFilterIds && relationshipFilterIds.length > 0) {
      const matched = (relationships as Relationship[]).find(r => relationshipFilterIds.includes(r.id));
      if (matched) return matched;
    }
    return relationships[0] as Relationship | undefined;
  }, [relationships, relationshipFilterIds]);
  
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
          <div className="flex flex-col gap-0 h-fit ">
            <div className="font-inter font-medium text-base leading-6 text-circle-primary">
              {contact.name}
            </div>
            <div className={`font-inter text-sm leading-5 h-[20px] ${
              occupation?.title 
                ? 'font-normal text-circle-primary' 
                : 'font-normal text-circle-primary italic opacity-50'
            }`}>
              {occupation?.title || 'no occupation'}
            </div>
            <div className={`font-inter text-sm leading-5 h-[20px] ${
              organization?.name 
                ? 'font-normal text-circle-primary' 
                : 'font-normal text-circle-primary italic opacity-50'
            }`}>
              {organization?.name || 'no organization'}
            </div>
          </div>
          
          {/* Menu Button */}
          <MenuButton
            onClick={onMenuClick}
            ariaLabel="Open contact details"
            className="hover:!bg-circle-neutral"
          />
        </div>
        
        {/* Birthdate and Notes Column */}
        <div className="flex flex-col gap-0 h-fit">
          <div className={`font-inter text-sm leading-5 h-[20px] ${
            contact.birth_date && contact.birth_date.year 
              ? 'font-normal text-circle-primary' 
              : 'font-normal text-circle-primary italic opacity-50'
          }`}>
            {formatBirthDateFromFields(contact.birth_date)}
          </div>
          <div className="flex flex-row items-center gap-2 flex-shrink-0">
            {/* Edit Icon */}
            <div className="w-4 h-4 flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.25 1.875L13.125 3.75L4.6875 12.1875H2.8125V10.3125L11.25 1.875Z" stroke="#1E1E1E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {/* Notes Count */}
            <span className="font-inter font-normal text-sm leading-5 text-circle-primary">
              {contact.note_ids?.length || 0} notes
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Section - Relationship and Subjects */}
      <div className="flex flex-col gap-[5px] w-full">
        {/* Relationship Tag */}
        {primaryRelationship && (
          <div className="flex flex-row flex-wrap items-start content-start gap-0 w-full">
            <RelationshipTag 
              relationship={primaryRelationship} 
              contactId={contact.id}
              editable={true}
            />
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
              <div key={`measure-${subject.id}`} data-subject-tag>
                <SubjectTag subject={subject} contactId={contact.id} />
              </div>
            ))}
          </div>
        </div>

        {/* Visible subjects container - limited to 2 rows with overflow indicator */}
        <div className="flex flex-row flex-wrap items-start content-start gap-[5px] w-full max-h-[45px] overflow-hidden">
          {subjects.length > 0 ? (
            <>
              {visibleSubjects.map((subject: Subject) => (
                <SubjectTag 
                  key={subject.id} 
                  subject={subject} 
                  contactId={contact.id}
                  editable={true}
                />
              ))}
              {showOverflow && (
                <OverflowTag count={hiddenCount} />
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
