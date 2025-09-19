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
    <div className={`flex flex-col items-start gap-2.5 w-full min-w-[240px] h-[30px] ${className}`}>
      {/* Search Field */}
      <div className="flex flex-row justify-start items-center p-0 gap-[10px] box-border w-full h-[30px] bg-white border border-circle-neutral-variant rounded-[25px]">
        {/* Frame 34 */}
        
          <div className="flex flex-row justify-center items-center p-1.5 gap-2.5 w-[30px] h-[30px] rounded-[25px]">
            {/* Magnifier Icon */}
            <MagnifierIcon size={20} />
          </div>

        <div className="flex flex-row w-full items-center pr-[20px]">
          {/* Search Input */}
          <input
            type="text"
            placeholder={placeholder}
            value={searchValue}
            onChange={handleSearchChange}
            autoFocus={autoFocus}
            className="h-5 font-circlebodymedium text-left text-circle-primary/35 placeholder-circle-primary/35 focus:outline-none flex-1"
          />
         </div>
      </div>
    </div>
  );
};

export default Search;
