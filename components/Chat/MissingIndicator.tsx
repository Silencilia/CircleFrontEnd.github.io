'use client';

import React from 'react';

export type MissingDataType = 'commitment' | 'contact' | 'note';

interface MissingIndicatorProps {
  datatype: MissingDataType;
}

const MissingIndicator: React.FC<MissingIndicatorProps> = ({ datatype }) => {
  return (
    <div className="px-md py-md text-circle-primary font-circlebodymedium italic">
      Unable to locate {datatype}. It might have been deleted.
    </div>
  );
};

export default MissingIndicator;

