'use client';

import React from 'react';

type SystemMessageCardProps = {
  text?: string;
};

const SystemMessageCard: React.FC<SystemMessageCardProps> = ({ text }) => {
  return (
    <div className="px-md py-md text-circle-primary whitespace-pre-wrap break-words">
      {text ?? ''}
    </div>
  );
};

export default SystemMessageCard;



