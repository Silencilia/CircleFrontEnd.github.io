import React from 'react';

export interface NameConfirmProps {
  names: string[];
  onClose: () => void;
}

// Placeholder dialog: lists names and asks for confirmation
// Styling uses existing Tailwind utility classes defined in the project
const NameConfirm: React.FC<NameConfirmProps> = ({ names, onClose }) => {
  const [checked, setChecked] = React.useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    names.forEach((n) => { init[n] = true; });
    return init;
  });

  const toggle = (name: string) => {
    setChecked((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleConfirm = () => {
    const confirmed = names.filter((n) => checked[n]);
    // TODO: Integration point - process confirmed names here
    // For now, just close the dialog
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-[1000]">
      <div className="bg-circle-white border border-circle-neutral-variant rounded-[16px] w-[90vw] max-w-[560px] max-h-[80vh] overflow-auto p-md">
        <div className="font-circlebodymedium text-circle-primary mb-sm">
          Please confirm the people detected in your message:
        </div>

        <div className="flex flex-col gap-xs mb-md">
          {names.length === 0 ? (
            <div className="font-circlebodymedium text-circle-primary/60">No names detected</div>
          ) : (
            names.map((name) => (
              <label key={name} className="flex items-center gap-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="accent-circle-primary"
                  checked={!!checked[name]}
                  onChange={() => toggle(name)}
                />
                <span className="font-circlebodymedium-highlight text-circle-primary">{name}</span>
              </label>
            ))
          )}
        </div>

        <div className="flex items-center justify-end gap-sm">
          <button
            type="button"
            className="btn-md bg-circle-neutral hover:bg-circle-neutral-variant text-circle-primary"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-md bg-circle-primary hover:bg-circle-neutral-variant text-circle-neutral"
            onClick={handleConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default NameConfirm;


