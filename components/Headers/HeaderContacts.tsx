import React from 'react';
import TitleContacts from './TitleContacts';
import FilterContacts from './FilterContacts';

const HeaderContacts: React.FC = () => {
  return (
    <div className="w-full bg-circle-neutral flex flex-col gap-0">
      {/* TitleContacts - Above */}
      <TitleContacts />
      
      {/* FilterContacts - Below */}
      <FilterContacts />
    </div>
  );
};

export default HeaderContacts;
