import React from 'react';
import { Subject } from '../contexts/ContactContext';

interface ContactCardSimpleProps {
  name: string;
  occupation: string;
  birthDate: string;
  subjects: Subject[];
}

const ContactCardSimple: React.FC<ContactCardSimpleProps> = ({
  name,
  occupation,
  birthDate,
  subjects = [] // Provide default empty array
}) => {
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
    <div className="w-56 h-40 bg-circle-neutral-variant rounded-xl p-3 flex flex-col gap-3">
      {/* Contact Info */}
      <div className="flex flex-col gap-1">
        <div className="font-inter font-medium text-base leading-6 text-circle-primary truncate">
          {name}
        </div>
        <div className="font-inter font-normal text-sm leading-5 text-circle-primary truncate">
          {occupation}
        </div>
        <div className="font-inter font-normal text-sm leading-5 text-circle-primary truncate">
          {formatBirthDate(birthDate)}
        </div>
      </div>
      
      {/* Subjects */}
      <div className="flex flex-row flex-wrap items-start content-start gap-1 w-54 h-11 overflow-hidden">
        {safeSubjects.length > 0 ? (
          <>
            {visibleSubjects.map((subject: Subject) => (
              <div
                key={subject.id}
                className="px-1 py-0.5 bg-[#E76835] rounded-md flex-shrink-0 flex items-center justify-center w-15 h-5"
              >
                <span className="font-inter font-medium text-[11px] leading-4 text-white text-center tracking-[0.5px]">
                  {subject.label}
                </span>
              </div>
            ))}
            {hiddenCount > 0 && (
              <div className="px-1 py-0.5 bg-[#E76835] rounded-md flex-shrink-0 flex items-center justify-center w-15 h-5">
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
  );
};

export default ContactCardSimple;
