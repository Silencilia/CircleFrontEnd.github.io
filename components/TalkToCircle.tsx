'use client';
import React, { useRef, useEffect, useState } from 'react';
import { GREETINGS, STRINGS } from '../data/strings';
import { UploadButton, VoiceButton, SendButton } from './Button';

interface TalkToCircleProps {
  // For demos/testing: force a specific layout. If undefined, auto-detect.
  forceWrapped?: boolean;
}

const TalkToCircle: React.FC<TalkToCircleProps> = ({ forceWrapped }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState('');
  const [isWrapped, setIsWrapped] = useState<boolean>(false);

  // Deterministic initial greeting for SSR; randomize after mount on client only
  const [greeting, setGreeting] = useState<string>(GREETINGS[0]);

  // Calculate height based on current layout constraints
  const calculateHeight = () => {
    const el = textareaRef.current;
    if (!el) return;

    // Determine available vertical space from the textarea's top to the bottom of the viewport minus navbar
    const navEl = document.querySelector('.navigation-bar') as HTMLElement | null;
    const navHeight = navEl?.getBoundingClientRect().height ?? 80; // fallback
    const rect = el.getBoundingClientRect();
    const bottomGap = 8; // px
    const available = Math.max(20, Math.floor(window.innerHeight - navHeight - rect.top - bottomGap));

    // Apply max height dynamically and size to content up to that max
    el.style.maxHeight = `${available}px`;
    el.style.height = 'auto';

    const wrapped = (forceWrapped ?? isWrapped) === true;
    if (wrapped) {
      // In layout 2 (wrapped), reserve space for button row (38px height + 10px gap)
      const buttonRowHeight = 48; // 38px button height + 10px gap
      const textareaMaxHeight = Math.max(20, available - buttonRowHeight);
      const contentHeight = Math.min(el.scrollHeight, textareaMaxHeight);
      el.style.height = `${contentHeight}px`;
      el.style.maxHeight = `${textareaMaxHeight}px`;
      el.style.overflowY = el.scrollHeight > textareaMaxHeight ? 'auto' : 'hidden';
    } else {
      // In single-line layout, keep a minimum one-line height and allow mild growth
      const baseLineHeight = 20;
      const next = Math.max(baseLineHeight, Math.min(el.scrollHeight, available));
      el.style.height = `${next}px`;
      el.style.maxHeight = `${available}px`;
      el.style.overflowY = el.scrollHeight > available ? 'auto' : 'hidden';
    }
  };

  // Auto-resize textarea and detect layout changes
  const adjustHeight = () => {
    const el = textareaRef.current;
    if (!el) return;

    // First, calculate height with current layout
    calculateHeight();

    if (forceWrapped === undefined) {
      // Hysteresis solution: prevent oscillation at switching boundary
      // Use requestAnimationFrame to ensure DOM has updated after height calculation
      requestAnimationFrame(() => {
        if (!el) return;

        let wrappedNow = isWrapped; // Start with current state to prevent unnecessary changes

        if (value.trim() === '') {
          // Only switch back to single-line when completely empty
          wrappedNow = false;
        } else {
          // Always switch to wrapped layout if explicit line breaks exist
          if (value.includes('\n')) {
            wrappedNow = true;
          } else if (!isWrapped) {
            // Only check for height-based wrapping when currently in single-line mode
            // This prevents oscillation when near the boundary
            const computedStyle = window.getComputedStyle(el);
            const lineHeight = parseFloat(computedStyle.lineHeight) || 20;
            const paddingTop = parseFloat(computedStyle.paddingTop) || 5;
            const paddingBottom = parseFloat(computedStyle.paddingBottom) || 5;
            const singleLineHeight = lineHeight + paddingTop + paddingBottom;

            // Use scrollHeight for more reliable detection, with larger tolerance to prevent oscillation
            const contentHeight = el.scrollHeight;
            if (contentHeight > singleLineHeight + 5) { // Increased tolerance
              wrappedNow = true;
            }
          }
          // If already wrapped, stay wrapped until text is completely empty
        }

        if (wrappedNow !== isWrapped) {
          setIsWrapped(wrappedNow);
          // After layout change, recalculate height with new layout constraints
          requestAnimationFrame(() => calculateHeight());
        }
      });
    }
  };

  // Adjust on mount and on resize
  useEffect(() => {
    adjustHeight();
    // Randomize greeting after hydration to avoid SSR/client mismatch
    setGreeting(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
    
    // Focus the textarea when component mounts (when user enters circle page)
    const el = textareaRef.current;
    if (el) {
      // Small delay to ensure component is fully rendered
      setTimeout(() => {
        el.focus();
      }, 100);
    }
    
    const onResize = () => adjustHeight();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Adjust when value changes (ensures shrink/grow as user types/erases)
  useEffect(() => {
    adjustHeight();
  }, [value]);

  // Respect forced layout if provided
  useEffect(() => {
    if (forceWrapped !== undefined) setIsWrapped(forceWrapped);
  }, [forceWrapped]);

  // Recalculate height whenever layout changes (including forced layout changes)
  useEffect(() => {
    requestAnimationFrame(() => calculateHeight());
  }, [isWrapped, forceWrapped]);

  return (
    <div className="flex flex-col gap-[30px] items-center max-w-[1000px] mx-auto">
                    {/* Random Greeting Text */}
                    <div className="text-center">
            <h2 className="font-merriweather font-normal text-headline-medium text-circle-primary">
              {greeting}
            </h2>
          </div>
          
          {/* Container that switches layout via CSS Grid */}
          <div className="w-full flex justify-center h-fit">
            <div
              className="bg-circle-white border border-circle-neutral-variant rounded-[25px] self-start w-[1000px] max-w-[1000px] px-[5px] py-[5px]"
              style={
                (forceWrapped ?? isWrapped)
                  ? { display: 'grid', gridTemplateRows: 'auto 38px', gridTemplateColumns: '1fr', rowGap: 10, alignItems: 'start' }
                  : { display: 'grid', gridTemplateColumns: '38px 1fr 38px', alignItems: 'end', columnGap: 15 }
              }
            >
              {/* Upload button: bottom row when wrapped; left column when single-line */}
              <div style={{ gridRow: (forceWrapped ?? isWrapped) ? '2' : '1', gridColumn: '1' }}>
                <UploadButton />
              </div>

              {/* Textarea region */}
              <div
                className={(forceWrapped ?? isWrapped) ? undefined : 'flex items-center h-[38px]'}
                style={{ gridRow: '1', gridColumn: (forceWrapped ?? isWrapped) ? '1' : '2', height: (forceWrapped ?? isWrapped) ? 'fit-content' : undefined, alignSelf: (forceWrapped ?? isWrapped) ? 'start' : undefined }}
              >
                <textarea
                  ref={textareaRef}
                  value={value}
                  onChange={(e) => { setValue(e.target.value); adjustHeight(); }}
                  placeholder={STRINGS.PLACEHOLDERS.TALK_TO_CIRCLE}
                  rows={1}
                  className="font-inter font-medium text-sm w-full resize-none overflow-hidden bg-transparent focus:outline-none text-circle-primary placeholder-circle-primary/35"
                  style={{
                    minHeight: 20,
                    paddingTop: 5,
                    paddingBottom: 5,
                    paddingLeft: (forceWrapped ?? isWrapped) ? 15 : 0,
                    paddingRight: (forceWrapped ?? isWrapped) ? 15 : 0,
                    height: (forceWrapped ?? isWrapped) ? 'fit-content' as unknown as undefined : undefined,
                    maxHeight: (forceWrapped ?? isWrapped) ? 120 : undefined,
                  }}
                />
              </div>

              {/* Right button: bottom-right when wrapped; right column when single-line */}
              <div style={{ gridRow: (forceWrapped ?? isWrapped) ? '2' : '1', gridColumn: (forceWrapped ?? isWrapped) ? '1' : '3', justifySelf: (forceWrapped ?? isWrapped) ? 'end' : undefined }}>
                {value.trim() ? <SendButton /> : <VoiceButton />}
              </div>
            </div>
          </div>
    </div>
  );
};
export default TalkToCircle;
