import React from 'react';
import { TitleHeight } from './TitleHeight';

const TitleContacts: React.FC = () => {
  return (
    <div 
      className="w-full bg-circle-neutral flex items-center justify-center"
      style={{ height: TitleHeight }}
    >
      <div className="font-merriweather font-normal text-display-small text-center text-circle-primary">
        Contacts
      </div>
    </div>
  );
};

export default TitleContacts;
