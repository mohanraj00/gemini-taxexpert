
import React from 'react';
import { SparklesIcon, ClipboardListIcon } from './icons/Icons';
import { useAppContext } from '../contexts/AppContext';

const Header: React.FC = () => {
  const { toggleChecklist } = useAppContext();
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-zinc-200/80">
      <div className="px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
            <SparklesIcon className="h-7 w-7 text-indigo-500" />
            <h1 className="text-xl font-extrabold text-zinc-800 tracking-tight">
              Gemini TaxBro
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
