import React from 'react';
import Link from 'next/link';
import CircleLoadingAnimation from '../animation/circleloading/CircleLoadingAnimation';

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
  const baseClasses = 'btn-nav transition-colors';
  const activeClasses = isActive ? 'bg-circle-neutral-variant' : 'hover:bg-circle-neutral-variant';
  const combinedClasses = `${baseClasses} ${activeClasses} ${className}`;

  const content = (
    <div className="flex flex-col items-center gap-xs">
      {label === 'Circle' && isActive ? (
        <CircleLoadingAnimation width={24} height={24} />
      ) : (
        icon
      )}
      <span className="font-circlelabelnav text-circle-primary text-center flex items-center">
        {label}
      </span>
    </div>
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
