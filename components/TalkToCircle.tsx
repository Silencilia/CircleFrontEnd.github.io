import React, { useRef, useEffect } from 'react';
import { Plus, Mic } from 'lucide-react';
import { GREETINGS } from '../data/strings';
import { IconButton } from './Button';

const TalkToCircle: React.FC = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Get a random greeting
  const randomGreeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];

  // Auto-resize textarea based on content
  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 80)}px`;
    }
  };

  // Adjust height on input change
  useEffect(() => {
    adjustHeight();
  }, []);

  return (
    <div className="w-full px-8 py-2.5">
      <div className="max-w-[1000px] mx-auto">
        <div className="flex flex-col gap-[40px] items-center">
                    {/* Random Greeting Text */}
                    <div className="text-center">
            <h2 className="font-merriweather font-normal text-headline-medium text-circle-primary">
              {randomGreeting}
            </h2>
          </div>
          
          {/* Input Section */}
          <div className="bg-circle-white border border-circle-neutral-variant rounded-[25px] p-0 flex items-center justify-between gap-[20px] w-full min-h-[48px] py-1">
            <div className="flex items-center gap-4 flex-1 px-1.5">
              {/* File Upload Button */}
              <IconButton 
                icon={Plus} 
                aria-label="Add file"
                onClick={() => {/* TODO: Implement file upload */}}
              />
              {/* Textarea Input Field */}
              <textarea
                ref={textareaRef}
                placeholder="Say anything"
                className="font-inter font-medium text-sm leading-5 text-left text-circle-primary placeholder-circle-primary/35 focus:outline-none flex-1 resize-none overflow-y-auto bg-transparent"
                style={{ minHeight: '20px', maxHeight: '80px', paddingTop: '5px', paddingBottom: '5px' }}
                onInput={adjustHeight}
                rows={1}
              />
            </div>
            
            {/* Voice Input Button */}
            <div className="pr-[5px]">
              <IconButton 
                icon={Mic} 
                aria-label="Voice input"
                onClick={() => {/* TODO: Implement voice input */}}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TalkToCircle;
