
import React from 'react';
import { SparklesIcon, ClipboardListIcon } from './icons/Icons';

interface HeaderProps {
    onToggleChecklist: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleChecklist }) => {
  return (
    <header className="bg-gradient-to-r from-indigo-500 to-cyan-500 shadow-md">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center">
            <SparklesIcon className="h-8 w-8 text-white mr-3" />
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Gemini TaxBro
            </h1>
        </div>
        <div className="md:hidden">
            <button 
                onClick={onToggleChecklist} 
                className="text-white p-2 rounded-md hover:bg-white/20 transition-colors"
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
