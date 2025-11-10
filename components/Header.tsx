
import React from 'react';
import { TaxInferenceIcon, ClipboardListIcon } from './icons/Icons';
import { useAppContext } from '../contexts/AppContext';

const Header: React.FC = () => {
  const { toggleChecklist } = useAppContext();
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-zinc-200/80">
      <div className="px-4 md:px-6 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
            <TaxInferenceIcon className="h-6 w-6 text-teal-600" />
            <h1 className="text-lg font-bold text-zinc-800 tracking-tight">
              Tax Inference
            </h1>
        </div>
        <div className="md:hidden">
            <button 
                onClick={toggleChecklist} 
                className="text-zinc-500 p-2 rounded-lg hover:bg-zinc-100 transition-colors"
                aria-label="Toggle research checklist"
            >
                <ClipboardListIcon className="h-6 w-6" />
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;