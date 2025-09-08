import React from 'react';
import Link from 'next/link';
import { UserIcon } from '../icons';

interface AccountButtonProps {
  onClick?: () => void;
  className?: string;
  'aria-label'?: string;
  href?: string;
  active?: boolean;
  disabled?: boolean;
}

const AccountButton: React.FC<AccountButtonProps> = ({ onClick, className = '', 'aria-label': ariaLabel, href = '/account', active = false, disabled = false }) => {
  const baseButtonClasses = 'group w-[54px] h-[54px] rounded-[30px] flex flex-col items-center justify-center p-0 gap-[2px] outline-none focus:outline-none focus:ring-0 focus-visible:outline-none active:outline-none';
  const bgClasses = active ? 'bg-circle-secondary' : 'bg-circle-white hover:bg-circle-secondary';
  const iconClasses = active ? 'text-circle-neutral' : 'text-circle-primary group-hover:text-circle-neutral';

  const content = (
    <button
      onClick={disabled ? undefined : onClick}
      aria-label={ariaLabel ?? 'Account'}
      disabled={disabled}
      className={`${baseButtonClasses} ${bgClasses} ${disabled ? 'pointer-events-none' : ''} ${className}`}
    >
      <UserIcon
        width={30}
        height={30}
        className={`stroke-current stroke-2 ${iconClasses}`}
      />
    </button>
  );

  // If no onClick provided, default to client-side navigation to the href
  if (!disabled && !onClick && href) {
    return (
      <Link href={href} aria-label={ariaLabel ?? 'Account'}>
        {content}
      </Link>
    );
  }

  return content;
};

export default AccountButton;


