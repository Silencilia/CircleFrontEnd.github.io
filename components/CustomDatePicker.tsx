import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface CustomDatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  placeholderText?: string;
  className?: string;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  selected,
  onChange,
  placeholderText = "Select date",
  className = ""
}) => {
  return (
    <DatePicker
      selected={selected}
      onChange={onChange}
      placeholderText={placeholderText}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-circle-primary focus:border-transparent ${className}`}
      dateFormat="MMM dd, yyyy"
      showYearDropdown
      showMonthDropdown
      dropdownMode="select"
      isClearable
      maxDate={new Date()}
    />
  );
};

export default CustomDatePicker;
