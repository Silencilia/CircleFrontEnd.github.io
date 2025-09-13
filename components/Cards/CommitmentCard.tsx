import React, { useMemo } from 'react';
import { Commitment } from '../../contexts/ContactContext';
import { DeleteIcon, MaximizeIcon } from '../icons';

interface CommitmentCardProps {
  commitment: Commitment;
}

const CommitmentCard: React.FC<CommitmentCardProps> = ({ commitment }) => {

  if (commitment.isTrashed) {
    return null;
  }

  const { date, time } = useMemo(() => {
    try {
      const d = new Date(commitment.time);
      if (isNaN(d.getTime())) {
        // Fallback: try to split the time string like "Dec 16, 2024 09:00"
        const match = commitment.time.match(/(\w+ \d{1,2}, \d{4})\s+(\d{1,2}:\d{2})/);
        if (match) {
          return { date: match[1], time: match[2] };
        }
        return { date: commitment.time, time: '' };
      }

      const dateStr = d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      const timeStr = d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      return { date: dateStr, time: timeStr };
    } catch (e) {
      return { date: commitment.time, time: '' };
    }
  }, [commitment.time]);

  const checkTextOverflow = (text: string, maxHeight: number = 60) => {
    const lineHeight = 20; // matches text leading
    const maxLines = Math.floor(maxHeight / lineHeight); // 4 lines
    const charsPerLine = 46; // narrower card; conservative estimate
    const maxChars = maxLines * charsPerLine;
    const hasOverflow = text.length > maxChars;
    if (!hasOverflow) {
      return { text, hasOverflow: false };
    }
    const truncated = text.substring(0, maxChars);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 0) {
      return { text: truncated.substring(0, lastSpace) + '...', hasOverflow: true };
    }
    return { text: truncated + '...', hasOverflow: true };
  };

  const { text: truncatedText } = useMemo(
    () => checkTextOverflow(commitment.text),
    [commitment.text]
  );

  // Maximize button does not change card height; reserved for future detailed view

  return (
    <div className="w-[240px] h-fit bg-circle-neutral-variant rounded-[12px] p-[10px] flex flex-col gap-[15px]">
      {/* Header row: timestamp and actions */}
      <div className="w-[220px] h-[40px] flex flex-row justify-between items-start gap-[10px]">
        {/* Timestamp */}
        <div className="w-[157px] h-[40px] flex flex-row justify-center items-start gap-[10px]">
          <div className="w-[32px] h-[40px] font-inter font-normal text-[14px] leading-[20px] tracking-[0.25px] text-circle-primary flex items-start">
            Due:
          </div>
          <div className="w-[115px] h-[40px] flex flex-col justify-start items-start">
            <div className="w-[115px] h-[20px] font-inter font-normal text-[14px] leading-[20px] tracking-[0.25px] text-circle-primary flex items-start">
              {date}
            </div>
            <div className="w-[46px] h-[20px] font-inter font-normal text-[14px] leading-[20px] tracking-[0.25px] text-circle-primary flex items-start">
              {time}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="w-fit h-fit flex flex-row items-center gap-[5px]">
          <button
            onClick={() => {/* TODO: implement trashing commitment */}}
            className="p-1 hover:bg-circle-neutral rounded transition-colors duration-200"
            aria-label="Delete commitment"
          >
            <DeleteIcon width={16} height={16} className="text-circle-primary" />
          </button>

          <button
            className="p-1 hover:bg-circle-neutral rounded transition-colors duration-200"
            aria-label="Maximize commitment"
          >
            <MaximizeIcon width={16} height={16} className="text-circle-primary" />
          </button>
        </div>
      </div>

      {/* Description - fixed height */}
      <div
        className={
          'w-[220px] font-inter font-normal text-[14px] leading-[20px] text-circle-primary tracking-[0.25px] text-left h-[60px] overflow-hidden'
        }
      >
        {truncatedText}
      </div>
    </div>
  );
};

export default CommitmentCard;
