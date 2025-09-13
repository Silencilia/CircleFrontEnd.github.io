'use client';

import React, { useMemo, useState } from 'react';
import { TextButton } from '../Button';
import { ConfirmIcon, CancelIcon, DownIcon } from '../icons';

export type DatePrecision = 'none' | 'year' | 'month' | 'day';

export interface DynamicPrecisionDateValue {
  precision: DatePrecision;
  year: number | null;
  month: number | null; // 1-12
  day: number | null; // 1-31
}

interface NoteDatePickerProps {
  value: DynamicPrecisionDateValue;
  onChange: (value: DynamicPrecisionDateValue) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
  subtitle?: string;
  onConfirm?: (value: DynamicPrecisionDateValue) => void;
  onCancel?: () => void;
}

const monthOptions = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const getDaysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();

export const NoteDatePicker: React.FC<NoteDatePickerProps> = ({
  value = { precision: 'none', year: null, month: null, day: null },
  onChange = () => {},
  label = 'Note date',
  className = '',
  disabled = false,
  subtitle = 'When did this happen?',
  onConfirm,
  onCancel,
}) => {
  const [datePicked, setDatePicked] = useState<DynamicPrecisionDateValue | null>(null);
  const currentYear = new Date().getFullYear();
  const years = useMemo(() => Array.from({ length: 100 }, (_, i) => currentYear - 50 + i), [currentYear]);

  const handlePrecisionChange = (newPrecision: DatePrecision) => {
    const updated: DynamicPrecisionDateValue = { ...value, precision: newPrecision };
    if (newPrecision === 'year') {
      updated.month = null;
      updated.day = null;
    } else if (newPrecision === 'month') {
      updated.day = null;
    } else if (newPrecision === 'none') {
      updated.year = null;
      updated.month = null;
      updated.day = null;
    }
    onChange(updated);
  };

  const handleFieldChange = (field: keyof DynamicPrecisionDateValue, newValue: string) => {
    const parsed = newValue ? parseInt(newValue, 10) : null;
    onChange({ ...value, [field]: parsed } as DynamicPrecisionDateValue);
  };

  const monthName = (m: number) => monthOptions.find((mo) => mo.value === m)?.label || '';

  const formatDate = (dateObj: DynamicPrecisionDateValue) => {
    if (!dateObj || dateObj.precision === 'none' || !dateObj.year) return 'Not set';
    switch (dateObj.precision) {
      case 'year':
        return `${dateObj.year}`;
      case 'month':
        if (!dateObj.month) return `${dateObj.year} (incomplete)`;
        return `${monthName(dateObj.month)} ${dateObj.year}`;
      case 'day':
        if (!dateObj.month || !dateObj.day) return `${dateObj.year} (incomplete)`;
        return `${monthName(dateObj.month)} ${dateObj.day}, ${dateObj.year}`;
      default:
        return 'Invalid format';
    }
  };

  return (
    <div
      className={`flex flex-col items-start p-[10px] gap-[40px] w-[450px] bg-circle-white rounded-[6px] ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}
      style={{ boxShadow: '2px 2px 10px rgba(0,0,0,0.25)' }}
    >
      <div className="flex flex-col items-center p-0 gap-[40px] w-[430px]">
        <div className="flex flex-col items-start p-0 gap-[25px] w-[430px] self-stretch">
          <div className="w-[430px] h-6 font-inter font-medium text-[16px] leading-6 tracking-[0.15px] text-circle-primary flex items-center">
            {label}
          </div>
          <div className="w-[430px] h-5 font-inter font-normal text-[14px] leading-5 tracking-[0.25px] text-circle-primary flex items-center">
            {subtitle}
          </div>
        </div>

        <div className="flex flex-col items-start p-0 gap-[40px] w-[430px] self-stretch">
          <div className="flex flex-row items-center p-0 gap-[20px] w-[430px] self-stretch">
            <div className="flex flex-row items-center p-0 gap-[5px]">
              <TextButton
                minWidth={0}
                toggled={value.precision === 'none'}
                onClick={() => { setDatePicked(null); handlePrecisionChange('none'); }}
              >
                Clear
              </TextButton>
              <TextButton
                minWidth={0}
                toggled={value.precision === 'year' || value.precision === 'month' || value.precision === 'day'}
                onClick={() => handlePrecisionChange('year')}
              >
                Year
              </TextButton>
              <TextButton
                minWidth={0}
                toggled={value.precision === 'month' || value.precision === 'day'}
                onClick={() => handlePrecisionChange('month')}
              >
                Month
              </TextButton>
              <TextButton
                minWidth={0}
                toggled={value.precision === 'day'}
                onClick={() => handlePrecisionChange('day')}
              >
                Day
              </TextButton>
            </div>
          </div>

          <div className="flex flex-col items-start p-0 gap-[15px] w-[430px] self-stretch">
            {/* Year pill */}
            <div className="relative w-[430px] h-[25px]">
              <select
                value={value.year ?? ''}
                onChange={(e) => handleFieldChange('year', e.target.value)}
                disabled={disabled}
                className="appearance-none w-full h-[25px] rounded-[15px] bg-circle-neutral border border-circle-neutral-variant pl-[12.5px] pr-8 font-inter font-medium text-[11px] leading-4 tracking-[0.5px] text-circle-primary disabled:cursor-not-allowed"
              >
                <option value="">Select year</option>
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <div className="absolute right-0 top-0 w-[25px] h-[25px] flex items-center justify-center">
                <DownIcon width={16} height={16} />
              </div>
            </div>

            {/* Month pill */}
            {['month', 'day'].includes(value.precision) && (
              <div className="relative w-[430px] h-[25px]">
                <select
                  value={value.month ?? ''}
                  onChange={(e) => handleFieldChange('month', e.target.value)}
                  disabled={disabled || !value.year}
                  className="appearance-none w-full h-[25px] rounded-[15px] bg-circle-neutral border border-circle-neutral-variant pl-[12.5px] pr-8 font-inter font-medium text-[11px] leading-4 tracking-[0.5px] text-circle-primary disabled:cursor-not-allowed"
                >
                  <option value="">Select month</option>
                  {monthOptions.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
                <div className="absolute right-0 top-0 w-[25px] h-[25px] flex items-center justify-center">
                  <DownIcon width={16} height={16} />
                </div>
              </div>
            )}

            {/* Day pill */}
            {value.precision === 'day' && (
              <div className="relative w-[430px] h-[25px]">
                <select
                  value={value.day ?? ''}
                  onChange={(e) => handleFieldChange('day', e.target.value)}
                  disabled={disabled || !value.year || !value.month}
                  className="appearance-none w-full h-[25px] rounded-[15px] bg-circle-neutral border border-circle-neutral-variant pl-[12.5px] pr-8 font-inter font-medium text-[11px] leading-4 tracking-[0.5px] text-circle-primary disabled:cursor-not-allowed"
                >
                  <option value="">Select day</option>
                  {value.year && value.month && Array.from({ length: getDaysInMonth(value.year, value.month) }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <div className="absolute right-0 top-0 w-[25px] h-[25px] flex items-center justify-center">
                  <DownIcon width={16} height={16} />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-row justify-between items-start p-0 gap-[40px] w-[430px] self-stretch">
            <div className="font-inter font-normal text-[12px] leading-4 tracking-[0.4px] text-circle-primary">Current value: {formatDate(value)}</div>
            <div className="flex flex-row justify-end items-center p-0 gap-[5px] w-[37px]">
              <button type="button" onClick={() => { setDatePicked(value); onConfirm?.(value); }} aria-label="Confirm" className="cursor-pointer">
                <ConfirmIcon width={16} height={16} />
              </button>
              <button type="button" onClick={() => onCancel?.()} aria-label="Cancel" className="cursor-pointer">
                <CancelIcon width={16} height={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteDatePicker;



