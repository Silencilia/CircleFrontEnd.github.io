import React, { useEffect, useState } from 'react';
import { CircleIcon, DraftIcon, MemoIcon, ContactsIcon, DevIcon } from './icons';
import { NavigationButton } from './Button';

interface NavigationBarProps {
  currentPage?: 'note' | 'draft' | 'memo' | 'contacts' | 'user' | 'developer';
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
      // Expose height globally so pages can offset content and avoid overlap
      document.documentElement.style.setProperty('--NavigationBarHeight', newHeight);
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
          <NavigationButton
            href="/"
            icon={<CircleIcon width={30} height={30} />}
            label="Circle"
            isActive={currentPage === 'note'}
          />
          
          {/* Draft Button */}
          <NavigationButton
            href="/draft"
            icon={<DraftIcon width={30} height={30} />}
            label="Draft"
            isActive={currentPage === 'draft'}
          />
          
          {/* Memo Button */}
          <NavigationButton
            href="/memo"
            icon={<MemoIcon width={30} height={30} />}
            label="Memo"
            isActive={currentPage === 'memo'}
          />
          
          {/* Contacts Button */}
          <NavigationButton
            href="/contacts"
            icon={<ContactsIcon width={30} height={30} />}
            label="Contacts"
            isActive={currentPage === 'contacts'}
          />
          
          {/* Dev Button */}
          <NavigationButton
            href="/developer"
            icon={<DevIcon width={30} height={30} />}
            label="Dev"
          />
        </div>
      </div>
    </div>
  );
};

export default NavigationBar;
