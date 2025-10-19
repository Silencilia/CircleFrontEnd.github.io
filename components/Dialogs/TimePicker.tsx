'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TextButton, ConfirmButton, CancelButton } from '../Button';
import { TimeValue, parseTimeToTimeValue } from '../../contexts/ContactContext';

interface TimePickerProps {
  value: TimeValue;
  onChange: (value: TimeValue) => void;
  label?: string;
  subtitle?: string;
  className?: string;
  disabled?: boolean;
  hourCycle?: 12 | 24; // UI presentation only; value remains 24h
  onConfirm?: (value: TimeValue) => void;
  onCancel?: () => void;
}

const ITEM_HEIGHT = 36; // px
const VISIBLE_COUNT = 5; // number of visible rows in the wheel
const REPEAT_BLOCKS = 50; // how many times to repeat items to simulate infinite

function useSnapScrolling(
  ref: React.RefObject<HTMLDivElement>,
  onIndexChange: (index: number) => void,
  itemsLength: number,
  pad: number,
  centerOffset: number,
  infinite: boolean
) {
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (infinite) {
      const middleStartIndex = pad + Math.floor(REPEAT_BLOCKS / 2) * itemsLength;
      if (el.scrollTop === 0) {
        el.scrollTop = middleStartIndex * ITEM_HEIGHT - centerOffset;
      }
    }

    const onScroll = () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => {
        const rawIndex = Math.round((el.scrollTop + centerOffset) / ITEM_HEIGHT);
        if (infinite) {
          // Normalize to [0, itemsLength)
          const normalized = ((rawIndex - pad) % itemsLength + itemsLength) % itemsLength;
          // If near the edges of the repeated blocks, recenter to the middle block
          const minEdge = pad + itemsLength; // a full block from the top
          const maxEdge = pad + (REPEAT_BLOCKS - 2) * itemsLength; // keep one block as buffer at bottom
          if (rawIndex <= minEdge || rawIndex >= maxEdge) {
            // Recenter to an equivalent index within the middle band while preserving direction
            const currentBand = Math.round((rawIndex - pad - normalized) / itemsLength);
            const centeredBand = Math.floor(REPEAT_BLOCKS / 2);
            const bandOffset = rawIndex <= minEdge ? 1 : -1; // nudge in scroll direction
            const newBand = centeredBand + bandOffset;
            const newIndex = pad + normalized + newBand * itemsLength;
            el.scrollTo({ top: newIndex * ITEM_HEIGHT - centerOffset, behavior: 'auto' });
          } else {
            // Snap to nearest item within the same neighborhood (no animation)
            el.scrollTo({ top: rawIndex * ITEM_HEIGHT - centerOffset, behavior: 'auto' });
          }
          onIndexChange(normalized);
        } else {
          // Non-infinite: clamp
          const clamped = Math.max(pad, Math.min(pad + itemsLength - 1, rawIndex));
          el.scrollTo({ top: clamped * ITEM_HEIGHT - centerOffset, behavior: 'auto' });
          onIndexChange(Math.max(0, Math.min(itemsLength - 1, clamped - pad)));
        }
      }, 80);
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [ref, onIndexChange, itemsLength, pad, centerOffset, infinite]);
}

function Wheel({
  items,
  selectedIndex,
  onChange,
  disabled,
  infinite = true,
}: {
  items: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  disabled?: boolean;
  infinite?: boolean;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const pad = Math.floor(VISIBLE_COUNT / 2);
  const centerOffset = (ITEM_HEIGHT * VISIBLE_COUNT) / 2 - ITEM_HEIGHT / 2;
  useSnapScrolling(listRef, onChange, items.length, pad, centerOffset, infinite);
  const [grabbing, setGrabbing] = useState(false);
  const dragStartYRef = useRef(0);
  const dragStartScrollTopRef = useRef(0);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const normalized = ((selectedIndex % items.length) + items.length) % items.length;
    const currentIndex = Math.round((el.scrollTop + centerOffset) / ITEM_HEIGHT);
    let targetTop: number;
    if (infinite) {
      // Choose the nearest repeated instance of the normalized index to avoid reverse jumps
      let k = Math.round((currentIndex - pad - normalized) / items.length);
      if (k < 0) k = 0;
      if (k > REPEAT_BLOCKS - 1) k = REPEAT_BLOCKS - 1;
      const nearestIndex = pad + normalized + k * items.length;
      targetTop = nearestIndex * ITEM_HEIGHT - centerOffset;
    } else {
      const nearestIndex = pad + normalized;
      targetTop = nearestIndex * ITEM_HEIGHT - centerOffset;
    }
    if (Math.abs(el.scrollTop - targetTop) > 1) {
      el.scrollTo({ top: targetTop, behavior: 'auto' });
    }
  }, [selectedIndex, items.length, pad, centerOffset, infinite]);

  const paddedItems = useMemo(() => {
    const blocks = infinite ? REPEAT_BLOCKS : 1;
    const repeated: string[] = [];
    for (let i = 0; i < blocks; i += 1) {
      for (let j = 0; j < items.length; j += 1) {
        repeated.push(items[j]);
      }
    }
    return [
      ...Array.from({ length: pad }, () => ''),
      ...repeated,
      ...Array.from({ length: pad }, () => ''),
    ];
  }, [items, pad, infinite]);

  // Pointer drag to scroll
  useEffect(() => {
    const el = listRef.current;
    if (!el || disabled) return;

    const onPointerDown = (e: PointerEvent) => {
      if (disabled) return;
      isDraggingRef.current = true;
      setGrabbing(true);
      dragStartYRef.current = e.clientY;
      dragStartScrollTopRef.current = el.scrollTop;
      try { el.setPointerCapture(e.pointerId); } catch {}
      e.preventDefault();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const delta = e.clientY - dragStartYRef.current;
      el.scrollTop = dragStartScrollTopRef.current - delta;
      e.preventDefault();
    };

    const endDrag = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      setGrabbing(false);
      try { el.releasePointerCapture(e.pointerId); } catch {}
    };

    el.addEventListener('pointerdown', onPointerDown as any, { passive: false });
    el.addEventListener('pointermove', onPointerMove as any, { passive: false });
    el.addEventListener('pointerup', endDrag as any, { passive: true });
    el.addEventListener('pointercancel', endDrag as any, { passive: true });

    return () => {
      el.removeEventListener('pointerdown', onPointerDown as any);
      el.removeEventListener('pointermove', onPointerMove as any);
      el.removeEventListener('pointerup', endDrag as any);
      el.removeEventListener('pointercancel', endDrag as any);
    };
  }, [disabled]);

  // Reduce mouse wheel scroll speed to 50%
  useEffect(() => {
    const el = listRef.current;
    if (!el || disabled) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      el.scrollTop += e.deltaY * 0.5;
    };
    el.addEventListener('wheel', onWheel as any, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel as any);
    };
  }, [disabled]);

  const wheelHeight = ITEM_HEIGHT * VISIBLE_COUNT;
  return (
    <div className={`relative w-[90px]`} style={{ height: wheelHeight }}>
      <div
        ref={listRef}
        className={`relative w-full h-full overflow-y-auto overflow-x-hidden select-none ${
          disabled ? 'pointer-events-none opacity-50' : grabbing ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{
          scrollbarWidth: 'none',
        }}
      >
        <div className="flex flex-col">
          {paddedItems.map((label, i) => (
            <div
              key={i}
              className={`flex items-center justify-center font-circlebodylarge text-circle-primary`}
              style={{ height: ITEM_HEIGHT }}
              aria-hidden={label === ''}
            >
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Selection indicator lines */}
      <div className="pointer-events-none absolute left-2 right-2 top-1/2 -translate-y-1/2">
        <div className="border-t-2 border-circle-secondary" />
        <div style={{ height: ITEM_HEIGHT - 4 }} />
        <div className="border-b-2 border-circle-secondary" />
      </div>
    </div>
  );
}

export const TimePicker: React.FC<TimePickerProps> = ({
  value = { hour: null, minute: null },
  onChange = () => {},
  label = 'Pick time',
  subtitle = 'When did this happen?',
  className = '',
  disabled = false,
  hourCycle = 24,
  onConfirm,
  onCancel,
}) => {
  const [is24h, setIs24h] = useState<boolean>(hourCycle === 24);
  const hours12 = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const hours24 = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);

  const systemNow = useMemo(() => parseTimeToTimeValue(new Date()), []);
  const effectiveHour = value.hour;
  const effectiveMinute = value.minute;

  // Debug logs
  console.log('TimePicker render - value.hour:', value.hour, 'value.minute:', value.minute);
  console.log('TimePicker render - effectiveHour:', effectiveHour, 'effectiveMinute:', effectiveMinute);

  // Ensure parent state initializes to system time so all views (current value, wheels, inputs) stay in sync
  // Only auto-initialize on first mount, not when user explicitly clears values
  const hasInitializedRef = useRef(false);
  useEffect(() => {
    if (!hasInitializedRef.current && value.hour == null && value.minute == null) {
      hasInitializedRef.current = true;
      onChange({ hour: systemNow.hour!, minute: systemNow.minute! });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toDisplay = () => {
    const hour = effectiveHour ?? 0; // Fall back to 00:00 (midnight)
    if (is24h) return { hourLabel: String(hour).padStart(2, '0'), ampm: 'AM' as 'AM' | 'PM' };
    const isPM = hour >= 12;
    let h = hour % 12;
    if (h === 0) h = 12;
    return { hourLabel: String(h), ampm: isPM ? 'PM' : 'AM' };
  };

  const { hourLabel, ampm } = toDisplay();
  const selectedHourIndex = useMemo(() => {
    const hour = effectiveHour ?? 0; // Fall back to 00:00 (midnight)
    if (is24h) return hour; // 0-23
    const h = hour % 12;
    return (h === 0 ? 12 : h) - 1; // 0-11 index
  }, [effectiveHour, is24h]);

  const selectedMinuteIndex = useMemo(() => {
    return effectiveMinute ?? 0; // Fall back to 00:00 (midnight)
  }, [effectiveMinute]);

  const selectedAmPmIndex = ampm === 'PM' ? 1 : 0;

  const setHourFromIndex = (index: number) => {
    if (is24h) {
      onChange({ hour: Math.max(0, Math.min(23, index)), minute: effectiveMinute ?? 0 });
    } else {
      const displayHour = hours12[Math.max(0, Math.min(11, index))]; // 1..12
      const base = displayHour % 12; // 0..11
      const newHour = (selectedAmPmIndex === 1 ? 12 : 0) + base; // 0..23 (12 handled below)
      onChange({ hour: newHour === 24 ? 12 : newHour === 12 && selectedAmPmIndex === 0 ? 0 : newHour, minute: effectiveMinute ?? 0 });
    }
  };

  const setMinuteFromIndex = (index: number) => {
    onChange({ hour: effectiveHour ?? 0, minute: Math.max(0, Math.min(59, index)) });
  };

  const setAmPmFromIndex = (index: number) => {
    if (is24h) return;
    const isPM = index === 1;
    const hour = effectiveHour ?? 0;
    let h = hour % 12; // 0..11
    if (isPM) h += 12;
    onChange({ hour: h, minute: effectiveMinute ?? 0 });
  };

  const handleHourTyped = (val: string) => {
    const num = val === '' ? NaN : parseInt(val, 10);
    if (Number.isNaN(num)) return;
    if (is24h) {
      const clamped = Math.max(0, Math.min(23, num));
      onChange({ hour: clamped, minute: effectiveMinute ?? 0 });
    } else {
      const clamped = Math.max(1, Math.min(12, num));
      const base = clamped % 12;
      const h = (selectedAmPmIndex === 1 ? 12 : 0) + base;
      onChange({ hour: h === 24 ? 12 : h === 12 && selectedAmPmIndex === 0 ? 0 : h, minute: effectiveMinute ?? 0 });
    }
  };

  const handleMinuteTyped = (val: string) => {
    const num = val === '' ? NaN : parseInt(val, 10);
    if (Number.isNaN(num)) return;
    const clamped = Math.max(0, Math.min(59, num));
    onChange({ hour: effectiveHour ?? 0, minute: clamped });
  };

  
  
  return (
    <div className="dlg">
    <div
      className={`flex flex-col items-center p-md gap-4xl w-full max-w-[450px] h-fit bg-circle-white rounded-md ${
        disabled ? 'opacity-50 pointer-events-none' : ''
      } ${className}`}
      style={{
        boxShadow: '2px 2px 10px rgba(0,0,0,0.25)',
        marginTop: 'auto',
        marginBottom: 'auto',
      }}
    >
      <div className="flex flex-col items-center p-0 gap-4xl w-full">
        <div className="flex flex-col items-start p-0 gap-3xl w-full self-stretch">
          <div className="w-full h-6 font-circletitlemedium text-circle-primary flex items-center">
            {label}
          </div>
          <div className="w-full h-5 font-circlebodymedium text-circle-primary flex items-center">
            {subtitle}
          </div>
        </div>

        <div className="flex flex-col items-start p-0 gap-3xl w-full self-stretch">
          <div className="flex flex-row items-center p-0 gap-2xl w-full self-stretch">
            <div className="flex flex-row items-center p-0 gap-sm">
              <TextButton
                minWidth={0}
                toggled={false}
                inactiveClass="bg-circle-neutral-variant text-circle-primary"
                activeClass="bg-circle-primary text-circle-neutral"
                onClick={() => {
                  console.log('Clear button clicked - setting hour and minute to null');
                  onChange({ hour: null, minute: null });
                }}
              >
                Clear
              </TextButton>
              <TextButton
                minWidth={0}
                toggled={!is24h}
                inactiveClass="bg-circle-neutral-variant text-circle-primary"
                activeClass="bg-circle-primary text-circle-neutral"
                onClick={() => setIs24h(false)}
              >
                12-hour
              </TextButton>
              <TextButton
                minWidth={0}
                toggled={is24h}
                inactiveClass="bg-circle-neutral-variant text-circle-primary"
                activeClass="bg-circle-primary text-circle-neutral"
                onClick={() => setIs24h(true)}
              >
                24-hour
              </TextButton>
            </div>
          </div>

          {/* Wheels + Typed inputs column */}
          <div className="flex flex-col items-center gap-3xl w-full self-stretch">
            {/* Wheels */}
            <div
              className="grid items-center justify-center gap-lg w-full self-stretch"
              style={{ gridTemplateColumns: is24h ? '90px 16px 90px' : '90px 16px 90px 90px' }}
            >
              <div className="w-[90px]">
                <Wheel
                  items={(is24h ? hours24 : hours12).map((h) =>
                    is24h ? String(h).padStart(2, '0') : String(h)
                  )}
                  selectedIndex={selectedHourIndex}
                  onChange={setHourFromIndex}
                  disabled={disabled}
                  infinite={true}
                />
              </div>
              <div className="w-[16px] flex items-center justify-center font-circlebodylarge text-circle-primary">:</div>
              <div className="w-[90px]">
                <Wheel
                  items={minutes.map((m) => String(m).padStart(2, '0'))}
                  selectedIndex={selectedMinuteIndex}
                  onChange={setMinuteFromIndex}
                  disabled={disabled}
                />
              </div>
              {!is24h && (
                <div className="w-[90px]">
                  <Wheel
                    items={['AM', 'PM']}
                    selectedIndex={selectedAmPmIndex}
                    onChange={setAmPmFromIndex}
                    disabled={disabled}
                    infinite={false}
                  />
                </div>
              )}
            </div>

            {/* Typed input row */}
            <div
              className="grid items-center justify-center gap-lg w-full self-stretch"
              style={{ gridTemplateColumns: is24h ? '90px 16px 90px' : '90px 16px 90px 90px' }}
            >
              <div className="w-[90px] flex justify-center">
                <input
                  type="number"
                  min={is24h ? 0 : 1}
                  max={is24h ? 23 : 12}
                  value={is24h ? String(effectiveHour ?? 0).padStart(2, '0') : String(((effectiveHour ?? 0) % 12) || 12).padStart(2, '0')}
                  onChange={(e) => handleHourTyped(e.target.value)}
                  className="appearance-none w-[74px] h-[25px] rounded-md bg-circle-neutral border border-circle-neutral-variant px-2 font-circlebodymedium text-circle-primary text-center"
                />
              </div>
              <div className="w-[16px] flex items-center justify-center font-circlebodylarge text-circle-primary">:</div>
              <div className="w-[90px] flex justify-center">
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={String(effectiveMinute ?? 0).padStart(2, '0')}
                  onChange={(e) => handleMinuteTyped(e.target.value)}
                  className="appearance-none w-[74px] h-[25px] rounded-md bg-circle-neutral border border-circle-neutral-variant px-2 font-circlebodymedium text-circle-primary text-center"
                />
              </div>
              {!is24h && (
                <div className="w-[90px] flex justify-center">
                  <div className="appearance-none w-[74px] h-[25px] rounded-md bg-circle-neutral border border-circle-neutral-variant px-2 font-circlebodymedium text-circle-primary text-center flex items-center justify-center select-none">
                    {ampm}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-row justify-between items-center w-full self-stretch">
            <div className="font-circlelabelsmall text-circle-primary">
              Current value: {(() => {
                const isNull = effectiveHour === null && effectiveMinute === null;
                console.log('Current value check - effectiveHour:', effectiveHour, 'effectiveMinute:', effectiveMinute, 'isNull:', isNull);
                return isNull
                  ? 'Not set'
                  : is24h
                    ? `${String(effectiveHour ?? 0).padStart(2, '0')}:${String(effectiveMinute ?? 0).padStart(2, '0')}`
                    : `${String(((effectiveHour ?? 0) % 12) || 12).padStart(2, '0')}:${String(effectiveMinute ?? 0).padStart(2, '0')} ${(effectiveHour ?? 0) >= 12 ? 'PM' : 'AM'}`;
              })()}
            </div>
            {(onConfirm || onCancel) && (
              <div className="flex flex-row justify-end items-center gap-xs w-fit">
                {onCancel && (
                  <CancelButton
                    onClick={() => onCancel?.()}
                    ariaLabel="Cancel"
                  />
                )}
                {onConfirm && (
                  <ConfirmButton
                    onClick={() => onConfirm?.({ hour: effectiveHour, minute: effectiveMinute })}
                    ariaLabel="Confirm"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default TimePicker;


