import React from 'react';
import { Draft } from '../../contexts/ContactContext';
import { ExtractButton, RecycleButton, MenuButton } from '../Button';

interface DraftCardProps {
  draft: Draft;
  onDelete?: () => void;
  onExtract?: () => void;
  onMenu?: () => void;
}

const DraftCard: React.FC<DraftCardProps> = ({
  draft,
  onDelete,
  onExtract,
  onMenu
}) => {
  // Format the date
  const formatDate = (date: Draft['date']) => {
    if (!date.year) return 'no date';
    
    if (date.year && date.month && date.day) {
      const dt = new Date(date.year, date.month - 1, date.day);
      return dt.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } else if (date.year && date.month) {
      const monthName = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][date.month - 1] || '';
      return `${monthName} ${date.year}`;
    } else if (date.year) {
      return String(date.year);
    }
    
    return 'no date';
  };

  // Format the time
  const formatTime = (time: Draft['time']) => {
    if (time.hour !== null && time.minute !== null) {
      const hh = String(time.hour).padStart(2, '0');
      const mm = String(time.minute).padStart(2, '0');
      return `${hh}:${mm}`;
    }
    return '--:--';
  };

  const dateStr = formatDate(draft.date);
  const timeStr = formatTime(draft.time);

  return (
    <div className="w-[600px] h-[140px] bg-white rounded-[12px] p-[15px] flex flex-col gap-[10px]">
      {/* Frame 126 - Header */}
      <div className="w-full h-[20px] flex flex-col justify-center items-start p-0">
        {/* Note info */}
        <div className="w-full h-[24px] flex flex-row justify-between items-start p-0 gap-[10px]">
          {/* Date and Time */}
          <div className="flex flex-row items-center p-0 pr-[10px] gap-[10px] w-fit h-[20px] justify-start">
            {/* Month DD, YYYY */}
            <div className="w-fit h-[20px] font-circlebodymedium-draft text-circle-primary opacity-50 flex items-center">
              {dateStr}
            </div>
            {/* hh:mm */}
            <div className="w-fit h-[20px] font-circlebodymedium-draft text-circle-primary opacity-50 flex items-center">
              {timeStr}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-row justify-end items-center p-0 gap-[10px] w-fit h-[24px]">
            {/* Extract Button */}
            <ExtractButton 
              onClick={onExtract}
              ariaLabel="Extract draft"
            />
            
            {/* Frame 130 */}
            <div className="flex flex-row items-center p-0 gap-[2px] w-fit h-[24px]">
              <RecycleButton 
                onClick={onDelete}
                ariaLabel="Delete draft"
              />
              
              <MenuButton 
                onClick={onMenu}
                ariaLabel="Draft menu"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Frame 128 - Description */}
      <div className="w-full h-[80px] max-h-[80px] flex flex-row items-start p-0">
        <div className="w-full h-[80px] font-circlebodymedium-draft text-circle-primary opacity-50 flex items-start justify-start flex-1 overflow-hidden text-left">
          <div 
            className="overflow-hidden text-ellipsis text-left"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
              lineHeight: '20px',
              maxHeight: '80px'
            }}
          >
            {draft.text}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraftCard;
