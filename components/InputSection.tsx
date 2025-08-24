import React from 'react';
import { Plus, Mic } from 'lucide-react';

const InputSection: React.FC = () => {
  return (
    <div className="w-full px-8 py-2.5">
      <div className="max-w-[1000px] mx-auto">
        <div className="bg-circle-white border border-circle-neutral-variant rounded-[25px] p-0 flex items-center justify-between gap-[380px] w-full h-12">
          <div className="flex items-center justify-center gap-4 w-[174px] h-12">
            {/* File Upload Button */}
            <div className="flex items-center justify-center p-1.5 w-12 h-12 rounded-[25px] hover:bg-circle-neutral-variant transition-colors">
              <Plus className="w-[22px] h-[22px] text-circle-primary" />
            </div>
            <span className="font-inter font-medium text-sm leading-5 text-center text-circle-primary/35 w-[111px] h-5">
              Say anything
            </span>
          </div>
          
          {/* Voice Input Button */}
          <div className="flex items-center justify-center p-1.5 w-12 h-12 rounded-[25px] hover:bg-circle-neutral-variant transition-colors">
            <Mic className="w-[22px] h-[22px] text-[#1E1E1E]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputSection;
