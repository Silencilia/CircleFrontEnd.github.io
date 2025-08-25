import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CircleIcon, MemoIcon, ContactsIcon, UserIcon } from './icons';

interface NavigationBarProps {
  currentPage?: 'note' | 'memo' | 'contacts' | 'user';
}

/**
 * NavigationBar component with responsive height
 * 
 * The NavigationBarHeight CSS variable is automatically calculated and updated:
 * - Mobile (< 640px): calc(3.5rem + 1.5rem) = 80px total
 * - Desktop (≥ 640px): calc(3.75rem + 1.5rem) = 84px total
 * 
 * This variable can be accessed via CSS: var(--NavigationBarHeight)
 * or used in JavaScript: getComputedStyle(element).getPropertyValue('--NavigationBarHeight')
 */
const NavigationBar: React.FC<NavigationBarProps> = ({ currentPage = 'note' }) => {
  const [navigationBarHeight, setNavigationBarHeight] = useState<string>('calc(3.5rem + 1.5rem)'); // Default mobile height

  useEffect(() => {
    const updateHeight = () => {
      const isSmallScreen = window.innerWidth < 640; // Tailwind sm breakpoint
      const buttonHeight = isSmallScreen ? '3.5rem' : '3.75rem'; // h-14 vs h-15
      const padding = '1.5rem'; // py-3
      const newHeight = `calc(${buttonHeight} + ${padding})`;
      setNavigationBarHeight(newHeight);
      console.log('NavigationBarHeight:', newHeight); // Add this line
    };

    // Set initial height
    updateHeight();

    // Update height on window resize
    window.addEventListener('resize', updateHeight);
    
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 w-full bg-circle-neutral px-4 py-3 z-50 navigation-bar"
      style={{
        '--NavigationBarHeight': navigationBarHeight,
        height: 'var(--NavigationBarHeight)'
      } as React.CSSProperties}
    >
      {/* Use flexbox with justify-center to ensure perfect horizontal centering */}
      <div className="flex items-center justify-center h-full w-full navigation-bar-content">
        {/* Container for navigation buttons to ensure consistent spacing */}
        <div className="flex items-center justify-center gap-4 sm:gap-8 h-full max-w-none">
          {/* Circle Button */}
          <Link href="/" className="flex flex-col items-center justify-center gap-1 w-16 sm:w-18 h-14 sm:h-15 rounded-xl p-1 transition-colors hover:bg-circle-neutral-variant">
            <CircleIcon width={30} height={30} />
            <span className="font-inter font-medium text-xs leading-4 text-black text-center">
              Circle
            </span>
          </Link>
          
          {/* Memo Button */}
          <div className={`flex flex-col items-center justify-center gap-1 w-16 sm:w-18 h-14 sm:h-15 rounded-xl p-1 transition-colors ${
            currentPage === 'memo' ? 'bg-circle-neutral-variant' : 'hover:bg-circle-neutral-variant'
          }`}>
            <MemoIcon width={30} height={30} />
            <span className="font-inter font-medium text-xs leading-4 text-black text-center">
              Memo
            </span>
          </div>
          
          {/* Contacts Button */}
          <Link href="/contacts" className="flex flex-col items-center justify-center gap-1 w-16 sm:w-18 h-14 sm:h-15 rounded-xl p-1 transition-colors hover:bg-circle-neutral-variant">
            <ContactsIcon width={30} height={30} />
            <span className="font-inter font-medium text-xs leading-4 text-black text-center">
              Contacts
            </span>
          </Link>
          
          {/* User Button */}
          <div className={`flex flex-col items-center justify-center gap-1 w-16 sm:w-18 h-14 sm:h-15 rounded-xl p-1 transition-colors ${
            currentPage === 'user' ? 'bg-circle-neutral-variant' : 'hover:bg-circle-neutral-variant'
          }`}>
            <UserIcon width={30} height={30} />
            <span className="font-inter font-medium text-xs leading-4 text-black text-center">
              User
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationBar;
