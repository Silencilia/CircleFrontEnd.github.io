import React from 'react';
import { Contact } from '../contexts/ContactContext';
import { CONTACT_REFERENCE_REGEX, CONTACT_REFERENCE_STYLES } from '../utils/contactReference';

// Force Tailwind to include contact reference highlight classes
const _tailwindContactClasses = 'font-circlebodymedium-highlight font-circlebodysmall-highlight';

// Turn text with tokens like {{contact:ID}} into JSX with clickable spans.
// The clickable span should look like body-medium-highlight and be focusable.
export function contactReference(
  text: string,
  contacts: Contact[],
  onClick?: (contact: Contact | undefined, id: string) => void,
  isMobile?: boolean
): (string | JSX.Element)[] {
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  // Reset regex lastIndex to ensure consistent results
  CONTACT_REFERENCE_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = CONTACT_REFERENCE_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const beforeText = text.slice(lastIndex, match.index);
      // Wrap plain text in an editable span so container clicks can target only these chunks
      parts.push(
        <span key={`text-${lastIndex}`} data-editable="true">
          {beforeText}
        </span>
      );
    }

    const contactId = match[1].trim();
    const contact = contacts.find(c => c.id === contactId);

    parts.push(
      <span
        key={`contact-${contactId}-${match.index}`}
        className={isMobile ? CONTACT_REFERENCE_STYLES.mobile : CONTACT_REFERENCE_STYLES.base}
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

    lastIndex = CONTACT_REFERENCE_REGEX.lastIndex;
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


