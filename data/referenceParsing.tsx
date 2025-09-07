import React from 'react';
import { Contact } from '../contexts/ContactContext';

// Turn text with tokens like {{contact:ID}} into JSX with clickable spans.
// The clickable span should look like body-medium-highlight and be focusable.
export function contactReference(
  text: string,
  contacts: Contact[],
  onClick?: (contact: Contact | undefined, id: number) => void
): (string | JSX.Element)[] {
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  const regex = /\{\{\s*contact\s*:(\d+)\s*\}\}/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const beforeText = text.slice(lastIndex, match.index);
      // Wrap plain text in an editable span so container clicks can target only these chunks
      parts.push(
        <span key={`text-${lastIndex}`} data-editable="true">
          {beforeText}
        </span>
      );
    }

    const contactId = parseInt(match[1], 10);
    const contact = contacts.find(c => c.id === contactId);

    parts.push(
      <span
        key={`contact-${contactId}-${match.index}`}
        className="Circlebodymediumhighlight text-circle-primary cursor-pointer focus:outline-none focus:ring-2 focus:ring-circle-primary/50 rounded-sm"
        data-contact-ref="true"
        role="button"
        tabIndex={0}
        title={contact ? `Open ${contact.name}` : `Contact ${contactId} not found`}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(contact, contactId);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            onClick?.(contact, contactId);
          }
        }}
      >
        {contact ? contact.name : `{{contact:${contactId}}}`}
      </span>
    );

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    const tailText = text.slice(lastIndex);
    parts.push(
      <span key={`text-${lastIndex}-end`} data-editable="true">
        {tailText}
      </span>
    );
  }

  return parts;
}

export default contactReference;


