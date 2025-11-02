import React, { useMemo } from 'react';
import { Commitment, useContacts, Contact } from '../../contexts/ContactContext';
import { RecycleButton, MaximizeButton } from '../Button';
import { contactReference } from '../../data/referenceParsing';
import { CardIndex, createSourceRecord } from '../../data/sourceRecord';

interface CommitmentCardProps {
  commitment: Commitment;
  onMaximize?: () => void;
  onOpenContactDetail?: (contact: Contact, caller: CardIndex) => void;
}

const CommitmentCard: React.FC<CommitmentCardProps> = ({ commitment, onMaximize, onOpenContactDetail }) => {
  const { state } = useContacts();

  // Try to get live data from state, fall back to passed object
  const currentCommitment = state.commitments.find(c => c.id === commitment.id) || commitment;

  if (currentCommitment.is_trashed) {
    return null;
  }

  const { date, time } = useMemo(() => {
    // Use due_date and due_time directly from the commitment
    // due_date format: "Dec 20, 2024"
    // due_time format: "16:00"
    return {
      date: currentCommitment.due_date || '',
      time: currentCommitment.due_time || ''
    };
  }, [currentCommitment.due_date, currentCommitment.due_time]);

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
    () => checkTextOverflow(currentCommitment.text),
    [currentCommitment.text]
  );

  return (
    <div className="w-[240px] h-fit bg-circle-neutral-variant rounded-[12px] p-[10px] flex flex-col gap-[15px]">
      {/* Header row: timestamp and actions */}
      <div className="w-[220px] h-[40px] flex flex-row justify-between items-start gap-[10px]">
        {/* Timestamp */}
        <div className="w-[157px] h-[40px] flex flex-row justify-center items-start gap-[10px]">
          <div className="w-[32px] h-[40px] font-circlebodymedium text-circle-primary flex items-start">
            Due:
          </div>
          <div className="w-[115px] h-[40px] flex flex-col justify-start items-start">
            <div className="w-[115px] h-[20px] font-circlebodymedium text-circle-primary flex items-start">
              {date}
            </div>
            <div className="w-[46px] h-[20px] font-circlebodymedium text-circle-primary flex items-start">
              {time}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="w-fit h-fit flex flex-row items-center gap-[2px]">
          <RecycleButton
            onClick={() => {/* TODO: implement trashing commitment */}}
            ariaLabel="Delete commitment"
            hoverVariant="neutral"
          />

          <MaximizeButton
            onClick={onMaximize}
            ariaLabel="Maximize commitment"
          />
        </div>
      </div>

      {/* Description - fixed height */}
      <div
        className={
          'w-[220px] font-circlebodymedium text-circle-primary text-left h-[60px] overflow-hidden'
        }
      >
        {contactReference(
          truncatedText,
          state.contacts,
          contact => {
            if (!contact) return;
            if (onOpenContactDetail) {
              // Create a source record for navigation tracking
              const cardIndex = createSourceRecord('commitmentCardDetail', currentCommitment.id);
              onOpenContactDetail(contact, cardIndex);
            }
          }
        )}
      </div>
    </div>
  );
};

export default CommitmentCard;
