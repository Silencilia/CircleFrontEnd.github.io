import React from 'react';
import Link from 'next/link';

interface NavigationButtonProps {
  href?: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

const NavigationButton: React.FC<NavigationButtonProps> = ({
  href,
  icon,
  label,
  isActive = false,
  onClick,
  className = '',
}) => {
  const baseClasses = 'flex flex-col items-center justify-center gap-1 w-16 sm:w-18 h-14 sm:h-15 rounded-xl p-1 transition-colors';
  const activeClasses = isActive ? 'bg-circle-neutral-variant' : 'hover:bg-circle-neutral-variant';
  const combinedClasses = `${baseClasses} ${activeClasses} ${className}`;

  const content = (
    <>
      {icon}
      <span className="font-circlelabelsmall text-black text-center">
        {label}
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={combinedClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button className={combinedClasses} onClick={onClick}>
      {content}
    </button>
  );
};

export default NavigationButton;
