import React, { useEffect, useState } from 'react';
import Link from 'next/link';

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
          {/* Note Button */}
          <Link href="/" className="flex flex-col items-center justify-center gap-1 w-16 sm:w-18 h-14 sm:h-15 rounded-xl p-1 transition-colors hover:bg-circle-neutral-variant">
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.25 3.75001C21.5783 3.42171 21.9681 3.16128 22.397 2.9836C22.826 2.80593 23.2857 2.71448 23.75 2.71448C24.2143 2.71448 24.674 2.80593 25.103 2.9836C25.5319 3.16128 25.9217 3.42171 26.25 3.75001C26.5783 4.07832 26.8387 4.46807 27.0164 4.89702C27.1941 5.32597 27.2855 5.78572 27.2855 6.25001C27.2855 6.7143 27.1941 7.17405 27.0164 7.603C26.8387 8.03195 26.5783 8.42171 26.25 8.75001L9.375 25.625L2.5 27.5L4.375 20.625L21.25 3.75001Z" stroke="#262B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="font-inter font-medium text-xs leading-4 text-black text-center">
              Note
            </span>
          </Link>
          
          {/* Memo Button */}
          <div className={`flex flex-col items-center justify-center gap-1 w-16 sm:w-18 h-14 sm:h-15 rounded-xl p-1 transition-colors ${
            currentPage === 'memo' ? 'bg-circle-neutral-variant' : 'hover:bg-circle-neutral-variant'
          }`}>
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.5 3.75V2.75C1.94772 2.75 1.5 3.19772 1.5 3.75H2.5ZM15 8.75H16H15ZM11.25 22.5V21.5V22.5ZM2.5 22.5H1.5C1.5 23.0523 1.94772 23.5 2.5 23.5V22.5ZM27.5 3.75H28.5C28.5 3.19772 28.0523 2.75 27.5 2.75V3.75ZM20 3.75V2.75V3.75ZM18.75 22.5V21.5V22.5ZM27.5 22.5V23.5C28.0523 23.5 28.5 23.0523 28.5 22.5H27.5ZM2.5 3.75V4.75H10V3.75V2.75H2.5V3.75ZM10 3.75V4.75C11.0609 4.75 12.0783 5.17143 12.8284 5.92157L13.5355 5.21447L14.2426 4.50736C13.1174 3.38214 11.5913 2.75 10 2.75V3.75ZM13.5355 5.21447L12.8284 5.92157C13.5786 6.67172 14 7.68913 14 8.75H15H16C16 7.1587 15.3679 5.63258 14.2426 4.50736L13.5355 5.21447ZM15 8.75H14V26.25H15H16V8.75H15ZM15 26.25H16C16 24.9902 15.4996 23.782 14.6088 22.8912L13.9017 23.5983L13.1945 24.3055C13.7103 24.8212 14 25.5207 14 26.25H15ZM13.9017 23.5983L14.6088 22.8912C13.718 22.0004 12.5098 21.5 11.25 21.5V22.5V23.5C11.9793 23.5 12.6788 23.7897 13.1945 24.3055L13.9017 23.5983ZM11.25 22.5V21.5H2.5V22.5V23.5H11.25V22.5ZM2.5 22.5H3.5V3.75H2.5H1.5V22.5H2.5ZM27.5 3.75V2.75H20V3.75V4.75H27.5V3.75ZM20 3.75V2.75C18.4087 2.75 16.8826 3.38214 15.7574 4.50736L16.4645 5.21447L17.1716 5.92157C17.9217 5.17143 18.9391 4.75 20 4.75V3.75ZM16.4645 5.21447L15.7574 4.50736C14.6321 5.63258 14 7.1587 14 8.75H15H16C16 7.68913 16.4214 6.67172 17.1716 5.92157L16.4645 5.21447ZM15 26.25H16C16 25.5207 16.2897 24.8212 16.8055 24.3055L16.0983 23.5983L15.3912 22.8912C14.5004 23.782 14 24.9902 14 26.25H15ZM16.0983 23.5983L16.8055 24.3055C17.3212 23.7897 18.0207 23.5 18.75 23.5V22.5V21.5C17.4902 21.5 16.282 22.0004 15.3912 22.8912L16.0983 23.5983ZM18.75 22.5V23.5H27.5V22.5V21.5H18.75V22.5ZM27.5 22.5H28.5V3.75H27.5H26.5V22.5H27.5Z" fill="#262B35"/>
            </svg>
            <span className="font-inter font-medium text-xs leading-4 text-black text-center">
              Memo
            </span>
          </div>
          
          {/* Contacts Button */}
          <Link href="/contacts" className="flex flex-col items-center justify-center gap-1 w-16 sm:w-18 h-14 sm:h-15 rounded-xl p-1 transition-colors hover:bg-circle-neutral-variant">
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.25 26.25V23.75C21.25 22.4239 20.7232 21.1521 19.7855 20.2145C18.8479 19.2768 17.5761 18.75 16.25 18.75H6.25C4.92392 18.75 3.65215 19.2768 2.71447 20.2145C1.77678 21.1521 1.25 22.4239 1.25 23.75V26.25M28.75 26.25V23.75C28.7492 22.6422 28.3804 21.566 27.7017 20.6904C27.023 19.8148 26.0727 19.1895 25 18.9125M20 3.9125C21.0755 4.18788 22.0288 4.81338 22.7095 5.69039C23.3903 6.5674 23.7598 7.64604 23.7598 8.75625C23.7598 9.86646 23.3903 10.9451 22.7095 11.8221C22.0288 12.6991 21.0755 13.3246 20 13.6M16.25 8.75C16.25 11.5114 14.0114 13.75 11.25 13.75C8.48858 13.75 6.25 11.5114 6.25 8.75C6.25 5.98858 8.48858 3.75 11.25 3.75C14.0114 3.75 16.25 5.98858 16.25 8.75Z" stroke="#262B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="font-inter font-medium text-xs leading-4 text-black text-center">
              Contacts
            </span>
          </Link>
          
          {/* User Button */}
          <div className={`flex flex-col items-center justify-center gap-1 w-16 sm:w-18 h-14 sm:h-15 rounded-xl p-1 transition-colors ${
            currentPage === 'user' ? 'bg-circle-neutral-variant' : 'hover:bg-circle-neutral-variant'
          }`}>
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M25 26.25V23.75C25 22.4239 24.4732 21.1521 23.5355 20.2145C22.5979 19.2768 21.3261 18.75 20 18.75H10C8.67392 18.75 7.40215 19.2768 6.46447 20.2145C5.52678 21.1521 5 22.4239 5 23.75V26.25M20 8.75C20 11.5114 17.7614 13.75 15 13.75C12.2386 13.75 10 11.5114 10 8.75C10 5.98858 12.2386 3.75 15 3.75C17.7614 3.75 20 5.98858 20 8.75Z" stroke="#262B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
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
