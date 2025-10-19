import React from 'react';
import CircleLoadingAnimation from './Animation/CircleLoading/CircleLoadingAnimation';

interface LoadingOverlayProps {
  isVisible: boolean;
  title?: string;
  message?: string;
  isOverlay?: boolean; // true = overlay mode, false = full-screen replacement
  zIndex?: number;
  className?: string;
}

export default function LoadingOverlay({
  isVisible,
  title = 'Circle',
  message = 'Loading...',
  isOverlay = true,
  zIndex = 200,
  className = ''
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  const baseClasses = "flex items-center justify-center";
  const overlayClasses = isOverlay
    ? `fixed inset-0 bg-circle-neutral bg-opacity-90 z-[${zIndex}]`
    : "min-h-screen bg-circle-neutral";

  return (
    <div className={`${baseClasses} ${overlayClasses} ${className}`}>
      <div className="text-center">
        <CircleLoadingAnimation width={60} height={60} className="mx-auto  mb-md" />
        <p className="font-circleheadlinexsmall text-circle-primary">{message}</p>
      </div>
    </div>
  );
}
