import React, { useEffect } from 'react';
import { ExtractButton, RecycleButton, MenuButton, PlayButton } from '../Button';
import useAudioPlayer from '../../hooks/useAudioPlayer';
import { useIsMobile } from '../../hooks/useIsMobile';
import { requestPersistentStorage, cleanUpStaleDrafts } from '../../utils/audioStorage';

interface DateLike {
  year?: number | null;
  month?: number | null; // 1-12
  day?: number | null;
}

interface TimeLike {
  hour: number | null; // 0-23
  minute: number | null; // 0-59
}

interface AudioCardProps {
  id: string;
  date: DateLike;
  time: TimeLike;
  durationSeconds: number | null;
  onExtract?: () => void;
  onDelete?: () => void;
  onMenu?: () => void;
  className?: string;
}

const formatDate = (date: DateLike): string => {
  if (!date || !date.year) return 'no date';
  const { year, month, day } = date;
  if (year && month && day) {
    const dt = new Date(year, month - 1, day);
    return dt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
  if (year && month) {
    const monthName = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][month - 1] || '';
    return `${monthName} ${year}`;
  }
  if (year) return String(year);
  return 'no date';
};

const formatTime = (time: TimeLike): string => {
  if (!time) return '--:--';
  const { hour, minute } = time;
  if (hour !== null && minute !== null) {
    const hh = String(hour).padStart(2, '0');
    const mm = String(minute).padStart(2, '0');
    return `${hh}:${mm}`;
  }
  return '--:--';
};

const formatDuration = (totalSeconds: number | null): string => {
  if (totalSeconds === null || totalSeconds === undefined || isNaN(totalSeconds)) return '0 sec';
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} hr`);
  if (minutes > 0) parts.push(`${minutes} min`);
  parts.push(`${secs} sec`);
  return parts.join(' ');
};

const AudioCard: React.FC<AudioCardProps> = ({
  id,
  date,
  time,
  durationSeconds,
  onExtract,
  onDelete,
  onMenu,
  className = '',
}) => {
  const isMobile = useIsMobile();
  const dateStr = formatDate(date);
  const timeStr = formatTime(time);
  const durationStr = formatDuration(durationSeconds);

  useEffect(() => {
    // Best-effort: request persistent storage (Chromium) and clean stale drafts (> 7 days)
    requestPersistentStorage();
    cleanUpStaleDrafts(7 * 24 * 60 * 60 * 1000).catch(() => {});
  }, []);

  const player = useAudioPlayer();

  const isActive = player.currentId === id && player.isPlaying;

  const handlePlayClick = async () => {
    if (isActive) {
      player.stop();
    } else {
      await player.play(id);
    }
  };

  return (
    <div className={`${isMobile ? 'w-[300px]' : 'w-[360px]'} h-fit bg-white rounded-sm p-md flex flex-col gap-md ${className}`}>
      {/* Header */}
      <div className="w-full h-fit flex flex-col justify-center items-start">
        {/* Note info */}
        <div className="w-full h-fit flex flex-row justify-between items-center gap-md">
          {/* Date and Time */}
          <div className="flex flex-row items-center pr-sm gap-md w-fit h-fit">
            <div className={`w-fit h-fit font-circlebodymedium-draft text-circle-primary flex items-center ${dateStr === 'no date' ? 'italic opacity-50' : 'opacity-50'}`}>
              {dateStr}
            </div>
            <div className={`w-fit h-fit font-circlebodymedium-draft text-circle-primary flex items-center ${timeStr === '--:--' ? 'italic opacity-50' : 'opacity-50'}`}>
              {timeStr}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-row justify-end items-center gap-md w-fit h-fit">
            <ExtractButton onClick={onExtract} ariaLabel="Extract from audio" />
            <div className="flex flex-row items-center gap-xs w-fit h-fit">
              <RecycleButton onClick={onDelete} ariaLabel="Delete audio" />
              <MenuButton onClick={onMenu} ariaLabel="Audio menu" />
            </div>
          </div>
        </div>
      </div>

      {/* Frame 128 - Duration */}
      <div className="w-full h-fit max-h-fit flex flex-row items-start gap-md">
        <div className="flex-1 h-fit font-circlebodymedium-draft text-circle-primary opacity-50 flex items-center italic">
          {durationStr}
        </div>
        <PlayButton onClick={handlePlayClick} isActive={isActive} ariaLabel={isActive ? 'Stop audio' : 'Play audio'} />
      </div>
    </div>
  );
};

export default AudioCard;


