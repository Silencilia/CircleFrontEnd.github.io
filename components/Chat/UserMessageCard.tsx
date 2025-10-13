'use client';

import React from 'react';

type UserMessageCardProps = {
  text?: string;
};

const UserMessageCard: React.FC<UserMessageCardProps> = ({ text }) => {
  return (
    <div className="rounded-md  px-md py-md bg-circle-primary text-white whitespace-pre-wrap break-words">
      {text ?? ''}
    </div>
  );
};

export default UserMessageCard;


