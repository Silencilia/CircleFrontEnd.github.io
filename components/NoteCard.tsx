import React, { useState } from 'react';
import { Note } from '../contexts/ContactContext';
import MenuIcon from './icons/MenuIcon';

interface NoteCardProps {
  note: Note;
}

const NoteCard: React.FC<NoteCardProps> = ({ note }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Format the date and time from the note's time field
  const formatDateTime = (dateTimeString: string) => {
    try {
      const date = new Date(dateTimeString);
      if (isNaN(date.getTime())) {
        // If parsing fails, try to extract from the time field format
        const timeMatch = dateTimeString.match(/(\w+ \d{1,2}, \d{4}) (\d{1,2}:\d{2} [AP]M)/);
        if (timeMatch) {
          return {
            date: timeMatch[1],
            time: timeMatch[2]
          };
        }
        return {
          date: 'Invalid Date',
          time: 'Invalid Time'
        };
      }
      
      const dateOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      };
      
      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false // Use 24h format
      };
      
      return {
        date: date.toLocaleDateString('en-US', dateOptions),
        time: date.toLocaleTimeString('en-US', timeOptions)
      };
    } catch (error) {
      return {
        date: 'Invalid Date',
        time: 'Invalid Time'
      };
    }
  };

  // Truncate text to fit within exactly 2 rows (40px height)
  const truncateText = (text: string, maxHeight: number = 40) => {
    const lineHeight = 20; // 20px line height as per design
    const maxLines = Math.floor(maxHeight / lineHeight); // Should be 2 lines
    
    // If text is short enough, return as is
    if (text.length <= 100) { // Conservative estimate for 2 lines
      return text;
    }
    
    // Calculate approximate characters that can fit in 2 lines
    // Assuming average word length of 5 characters + 1 space = 6 chars per word
    // And approximately 15-20 words per line depending on text content
    const charsPerLine = 80; // Conservative estimate for the card width
    const maxChars = maxLines * charsPerLine;
    
    if (text.length <= maxChars) {
      return text;
    }
    
    // Find the last complete word that fits within the limit
    const truncated = text.substring(0, maxChars);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    
    if (lastSpaceIndex > 0) {
      // Cut at the last complete word
      return truncated.substring(0, lastSpaceIndex) + '...';
    } else {
      // If no space found, just cut at the character limit
      return truncated + '...';
    }
  };

  const { date, time } = formatDateTime(note.time);
  const truncatedText = truncateText(note.text);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="w-[600px] h-fit bg-circle-neutral-variant rounded-[5px] p-[10px] flex flex-col gap-1">
      {/* Note info - timestamp and sentiment */}
      <div className="w-[580px] flex flex-row justify-between items-start gap-[10px]">
        {/* Timestamp */}
        <div className="flex flex-col justify-start items-start">
          <div className="font-inter font-normal text-[14px] leading-[20px] text-circle-primary tracking-[0.25px] flex items-center">
            {date}
          </div>
          <div className="font-inter font-normal text-[14px] leading-[20px] text-circle-primary tracking-[0.25px] flex items-center">
            {time}
          </div>
        </div>

        {/* Sentiment tags and menu icon row */}
        <div className="flex flex-row justify-end items-center gap-[5px] w-fit">
          {/* Sentiment tags */}
          <div className="flex flex-row justify-end items-start gap-[5px]">
            {/* Primary sentiment tag */}
            <div className="bg-circle-neutral rounded-[6px] p-[2px_5px] flex flex-row justify-center items-center">
              <div className="font-inter font-medium text-[11px] leading-[16px] text-circle-primary tracking-[0.5px] flex items-center justify-center text-center">
                {note.sentiment}
              </div>
            </div>

            {/* Additional sentiment tag (if needed) */}
            <div className="bg-circle-neutral rounded-[6px] p-[2px_5px] flex flex-row justify-center items-center">
              <div className="font-inter font-medium text-[11px] leading-[16px] text-circle-primary tracking-[0.5px] flex items-center justify-center text-center">
                {note.event ? note.event.toLowerCase() : 'event'}
              </div>
            </div>

            {/* Third sentiment tag (if needed) */}
            <div className="bg-circle-neutral rounded-[6px] p-[2px_5px] flex flex-row justify-center items-center">
              <div className="font-inter font-medium text-[11px] leading-[16px] text-circle-primary tracking-[0.5px] flex items-center justify-center text-center">
                {note.location ? note.location.split(' ')[0].toLowerCase() : 'location'}
              </div>
            </div>
          </div>

          {/* Menu icon button */}
          <button
            onClick={toggleExpanded}
            className="p-1 hover:bg-circle-neutral rounded transition-colors duration-200"
            aria-label={isExpanded ? "Collapse note content" : "Expand note content"}
          >
            <MenuIcon width={16} height={16} className="text-circle-primary" />
          </button>
        </div>
      </div>

      {/* Note description */}
      <div 
        className={`w-[580px] font-inter font-normal text-[14px] leading-[20px] text-circle-primary tracking-[0.25px] text-left ${
          isExpanded ? 'h-fit' : 'h-[40px] overflow-hidden'
        }`}
      >
        {isExpanded ? note.text : truncatedText}
      </div>
    </div>
  );
};

export default NoteCard;
