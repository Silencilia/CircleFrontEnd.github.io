import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useContacts } from '../../contexts/ContactContext';
import { loadDemoData } from '../../data/demo/sampleData';
import { SESSION_KEYS } from '../../data/localStorageKeys';

interface WelcomeDialogProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const WelcomeDialog: React.FC<WelcomeDialogProps> = ({ isOpen = true, onClose }) => {
  const { loadData } = useContacts();

  if (typeof window === 'undefined') return null;
  if (!isOpen) return null;

  const setVisitedAndClose = () => {
    try { sessionStorage.setItem(SESSION_KEYS.IS_INITIAL_VISIT, 'false'); } catch {}
    if (onClose) onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) setVisitedAndClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setVisitedAndClose();
  };

  const handleLoadDemo = async () => {
    try {
      loadDemoData();
      await loadData();
    } catch (e) {
      // no-op; demo only
    } finally {
      setVisitedAndClose();
    }
  };

  const handleExploreOwn = () => {
    setVisitedAndClose();
  };

  return createPortal(
    <div 
      className="fixed inset-0 bg-circle-primary/50 flex items-center justify-center z-[9999]"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
    >
      <div className="bg-circle-white border border-circle-neutral-variant rounded-md p-lg max-w-[640px] w-[92%] mx-md shadow-lg">
        <h3 id="welcome-title" className="font-circletitlemedium text-circle-primary mb-md">
          Welcome to Circle
        </h3>
        <div className="space-y-md">
          <p className="font-circlebodymedium text-circle-primary leading-relaxed">
            I am Circle, your personal social manager. I help you capture moments, keep track of people, and generate social insights.
          </p>
          <p className="font-circlebodymedium text-circle-primary leading-relaxed">
            You can ask me anything about your social life. Search conversations, get advice on social decisions, and record your encounters all by simply talking to me.
          </p>
          <p className="font-circlebodymedium text-circle-primary leading-relaxed">
            You are currently signed out. Anything you create will stay only in this browser and may be lost. Sign up or sign in to securely store your information.
          </p>
          <p className="font-circlebodymedium text-circle-primary leading-relaxed">
            Would you like to load some demo data to quickly explore the app's features?
          </p>
        </div>

        <div className="mt-lg flex flex-col gap-sm">
          <button
            type="button"
            onClick={handleLoadDemo}
            className="text-left w-full px-md py-sm rounded-sm transition-colors duration-150 hover:bg-circle-neutral-variant font-circlebodymedium italic text-circle-primary"
          >
            Sure! Load your sample data and let me play with it.
          </button>
          <button
            type="button"
            onClick={handleExploreOwn}
            className="text-left w-full px-md py-sm rounded-sm transition-colors duration-150 hover:bg-circle-neutral-variant font-circlebodymedium italic text-circle-primary"
          >
            I'd like to explore on my own.
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default WelcomeDialog;


