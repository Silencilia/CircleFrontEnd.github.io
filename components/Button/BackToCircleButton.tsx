import React from 'react';
import Link from 'next/link';
import { RightIcon } from '../icons';

interface BackToCircleButtonProps {
  className?: string;
}

const BackToCircleButton: React.FC<BackToCircleButtonProps> = ({ className = '' }) => {
  const baseButtonClasses = 'group btn-nav-rd outline-none focus:outline-none focus:ring-0 focus-visible:outline-none active:outline-none';
  const bgClasses = 'bg-circle-white hover:bg-circle-secondary';
  const iconClasses = 'text-circle-primary group-hover:text-circle-white group-active:text-circle-white';

  const content = (
    <button
      aria-label={'Back to Circle'}
      className={`${baseButtonClasses} ${bgClasses} ${className}`}
      style={{ borderRadius: '50%' }}
    >
      <RightIcon
        width={22}
        height={22}
        strokeColor="currentColor"
        className={iconClasses}
      />
    </button>
  );

  return (
    <Link href="/" aria-label={'Back to Circle'}>
      {content}
    </Link>
  );
};

export default BackToCircleButton;


