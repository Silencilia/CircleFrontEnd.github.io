'use client';

import React from 'react';
import { useContacts } from '../../contexts/ContactContext';
import { contactReference } from '../../data/referenceParsing';

type SystemMessageCardProps = {
  text?: string;
};

const SystemMessageCard: React.FC<SystemMessageCardProps> = ({ text }) => {
  const { state } = useContacts();
  const content = text ? contactReference(text, state.contacts) : [''];
  return (
    <div className="px-md py-md text-circle-primary whitespace-pre-wrap break-words">
      {content}
    </div>
  );
};

export default SystemMessageCard;



