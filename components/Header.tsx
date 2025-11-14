
import React, { useRef, useEffect } from 'react';
import { TaxInferenceIcon, ClipboardListIcon, ArrowDownTrayIcon, ArrowUpTrayIcon } from './icons/Icons';
import { useAppContext } from '../contexts/AppContext';

const Header: React.FC = () => {
  const { 
    toggleChecklist, 
    handleSaveProject, 
    handleLoadProject, 
    isLoading,
    requestLoadProject,
    shouldTriggerLoad,
    setShouldTriggerLoad
  } = useAppContext();
  const loadFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (shouldTriggerLoad) {
        loadFileInputRef.current?.click();
        setShouldTriggerLoad(false); // Reset trigger
    }
  }, [shouldTriggerLoad, setShouldTriggerLoad]);

  const onFileLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          handleLoadProject(file);
      }
      if(e.target) e.target.value = '';
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-zinc-200/80">
      <div className="px-4 md:px-6 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
            <TaxInferenceIcon className="h-6 w-6 text-teal-600" />
            <h1 className="text-lg font-bold text-zinc-800 tracking-tight">
              Tax Inference
            </h1>
        </div>
        <div className="flex items-center space-x-1">
            <input 
                type="file"
                ref={loadFileInputRef}
                className="hidden"
                accept=".taxproj"
                onChange={onFileLoad}
                disabled={isLoading}
            />
            <button
                onClick={requestLoadProject}
                disabled={isLoading}
                className="text-zinc-500 p-2 rounded-lg hover:bg-zinc-100 transition-colors disabled:opacity-50"
                aria-label="Load project"
                title="Load Project"
            >
                <ArrowUpTrayIcon className="h-6 w-6" />
            </button>
            <button 
                onClick={handleSaveProject} 
                disabled={isLoading}
                className="text-zinc-500 p-2 rounded-lg hover:bg-zinc-100 transition-colors disabled:opacity-50"
                aria-label="Save project"
                title="Save Project"
            >
                <ArrowDownTrayIcon className="h-6 w-6" />
            </button>
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
      </div>
    </header>
  );
};

export default Header;