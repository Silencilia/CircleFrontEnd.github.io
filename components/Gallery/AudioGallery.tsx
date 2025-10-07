import React, { useEffect, useMemo, useState } from 'react';
import ScrollContainer from 'react-indiana-drag-scroll';
import AudioCard from '../Cards/AudioCard';
import { listAudioDrafts, getAudioDraft, deleteAudioDraft, StoredAudioDraftMeta } from '../../utils/audioStorage';

const AudioGallery: React.FC = () => {
  const [items, setItems] = useState<StoredAudioDraftMeta[]>([]);

  const refresh = async () => {
    const rows = await listAudioDrafts();
    // Newest first
    rows.sort((a, b) => b.createdAt - a.createdAt);
    setItems(rows);
  };

  useEffect(() => {
    refresh();
  }, []);

  const row = useMemo(() => items, [items]);

  return (
    <div className="w-full h-fit flex flex-col gap-lg px-xl">
        <span className="text-circle-primary font-circleheadlinexsmall">Recent recordings</span>
      <ScrollContainer
        className="w-full h-fit flex flex-row items-start gap-md overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing p-0"
        vertical={false}
      >
        {row.length > 0 ? (
          row.map((m) => {
            const d = new Date(m.createdAt);
            return (
              <div key={m.id} className="flex-shrink-0">
                <AudioCard
                  id={m.id}
                  date={{ year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() }}
                  time={{ hour: d.getHours(), minute: d.getMinutes() }}
                  durationSeconds={m.durationSeconds}
                  onExtract={async () => {
                    const rec = await getAudioDraft(m.id);
                    if (!rec) return;
                    const url = URL.createObjectURL(rec.blob);
                    // Consumer can pick this up via a global player pattern; for now, open new tab
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `audio-${m.id}.webm`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  onDelete={async () => {
                    await deleteAudioDraft(m.id);
                    await refresh();
                  }}
                  onMenu={() => { /* Hook up menu if needed */ }}
                />
              </div>
            );
          })
        ) : (
          <div className="text-circle-primary/60 font-circlebodymedium">No audio recordings yet</div>
        )}
      </ScrollContainer>
    </div>
  );
};

export default AudioGallery;


