import React from 'react';

interface SpeakerIconProps {
  width?: number;
  height?: number;
  className?: string;
}

const SpeakerIcon: React.FC<SpeakerIconProps> = ({ width = 22, height = 22, className = '' }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M17.4166 9.16666V11C17.4166 12.7018 16.7405 14.3339 15.5372 15.5373C14.3338 16.7406 12.7017 17.4167 10.9999 17.4167M10.9999 17.4167C9.29811 17.4167 7.66601 16.7406 6.46265 15.5373C5.25929 14.3339 4.58325 12.7018 4.58325 11V9.16666M10.9999 17.4167V21.0833M7.33325 21.0833H14.6666M10.9999 0.916656C10.2706 0.916656 9.5711 1.20639 9.05537 1.72211C8.53965 2.23784 8.24992 2.93731 8.24992 3.66666V11C8.24992 11.7293 8.53965 12.4288 9.05537 12.9445C9.5711 13.4603 10.2706 13.75 10.9999 13.75C11.7293 13.75 12.4287 13.4603 12.9445 12.9445C13.4602 12.4288 13.7499 11.7293 13.7499 11V3.66666C13.7499 2.93731 13.4602 2.23784 12.9445 1.72211C12.4287 1.20639 11.7293 0.916656 10.9999 0.916656Z" stroke="#1E1E1E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

export default SpeakerIcon;


