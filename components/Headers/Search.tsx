import React, { useState } from 'react';
import MagnifierIcon from '../icons/MagnifierIcon';

interface SearchProps {
  className?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  value?: string;
  autoFocus?: boolean;
}

const Search: React.FC<SearchProps> = ({
  className = '',
  placeholder = 'Search something',
  onChange,
  value = '',
  autoFocus = false
}) => {
  const [searchValue, setSearchValue] = useState(value);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
    onChange?.(newValue);
  };

  return (
    <div className={`flex flex-col items-start gap-sm w-full min-w-[150px] ${className}`}>
      {/* Search Field */}
      <div className="flex flex-row justify-start items-center gap-lg box-border w-full h-full bg-white border border-circle-neutral-variant rounded-lg ctn-srch">
        {/* Frame 34 */}

          <div className="flex flex-row justify-start items-center btn-sm rounded-lg">
            {/* Magnifier Icon */}
            <MagnifierIcon />
          </div>

        <div className="flex flex-row items-center pr-lg overflow-hidden">
          {/* Search Input */}
          <input
            type="text"
            placeholder={placeholder}
            value={searchValue}
            onChange={handleSearchChange}
            autoFocus={autoFocus}
            className="font-circlebodymedium text-left text-circle-primary/35 placeholder-circle-primary/35 focus:outline-none flex-1"
          />
         </div>
      </div>
    </div>
  );
};

export default Search;
