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
  const [currentPage, setCurrentPage] = React.useState<1 | 2 | 3>(1);

  if (typeof window === 'undefined') return null;
  if (!isOpen) return null;

  const setVisitedAndClose = () => {
    try {
      sessionStorage.setItem(SESSION_KEYS.IS_INITIAL_VISIT, 'false');
      sessionStorage.removeItem(SESSION_KEYS.WELCOME_DIALOG_PAGE);
    } catch {}
    if (onClose) onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) setVisitedAndClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setVisitedAndClose();
  };

  const handleGotIt = () => {
    setCurrentPage(2);
    try { sessionStorage.setItem(SESSION_KEYS.WELCOME_DIALOG_PAGE, '2'); } catch {}
  };

  const handleLoadDemo = async () => {
    // Show page 3 immediately and persist it so re-mounts keep the page
    setCurrentPage(3);
    try { sessionStorage.setItem(SESSION_KEYS.WELCOME_DIALOG_PAGE, '3'); } catch {}
    try {
      loadDemoData();
      await loadData();
    } catch (e) {
      // no-op; demo only
    }
  };

  const handleExploreOwn = () => {
    setVisitedAndClose();
  };

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEYS.WELCOME_DIALOG_PAGE);
      if (saved === '1' || saved === '2' || saved === '3') {
        setCurrentPage(Number(saved) as 1 | 2 | 3);
      }
    } catch {}
  }, []);

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

        {currentPage === 1 && (
          <>
            <div className="space-y-md">
              <p className="font-circlebodymedium text-circle-primary leading-relaxed">
                I am Circle, your personal social manager. I help you capture moments, keep track of people, and generate social insights.
              </p>
              <p className="font-circlebodymedium text-circle-primary leading-relaxed">
                You can ask me anything about your social life. Search conversations, get advice on social decisions, and record your encounters all by simply talking to me.
              </p>
            </div>

            <div className="mt-lg flex flex-col gap-sm">
              <button
                type="button"
                onClick={handleGotIt}
                className="text-left w-full px-md py-sm rounded-sm bg-circle-neutral transition-colors duration-150 hover:bg-circle-neutral-variant font-circlebodymedium italic text-circle-primary"
              >
                Got it.
              </button>
            </div>
          </>
        )}

        {currentPage === 2 && (
          <>
            <div className="space-y-md">
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
                className="text-left w-full px-md py-sm rounded-sm bg-circle-neutral transition-colors duration-150 hover:bg-circle-neutral-variant font-circlebodymedium italic text-circle-primary"
              >
                Sure! Load your sample data and let me play with it.
              </button>
              <button
                type="button"
                onClick={handleExploreOwn}
                className="text-left w-full px-md py-sm rounded-sm bg-circle-neutral transition-colors duration-150 hover:bg-circle-neutral-variant font-circlebodymedium italic text-circle-primary"
              >
                I'd like to explore on my own.
              </button>
            </div>
          </>
        )}

        {currentPage === 3 && (
          <>
            <div className="space-y-md">
              <p className="font-circlebodymedium text-circle-primary leading-relaxed">
                Here you go. Check the Contacts and Memo tabs for the loaded data. Also click on the menu icon on the upper left of this page to see a chat I pulled for you. Try asking questions or recording random things in the chat box and see what happens.
              </p>
              <p className="font-circlebodymedium text-circle-primary leading-relaxed">
                Have fun!
              </p>
            </div>

            <div className="mt-lg flex flex-col gap-sm">
              <button
                type="button"
                onClick={setVisitedAndClose}
                className="text-left w-full px-md py-sm rounded-sm bg-circle-neutral transition-colors duration-150 hover:bg-circle-neutral-variant font-circlebodymedium italic text-circle-primary"
              >
                Alright. Thanks.
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};

export default WelcomeDialog;
