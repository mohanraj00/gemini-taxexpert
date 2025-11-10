
import React from 'react';
import { ResearchAnalysis } from '../types';
import { XMarkIcon, DocumentTextIcon, ChatBubbleLeftRightIcon } from './icons/Icons';

interface ExportOptionsModalProps {
    analysis: ResearchAnalysis | null;
    onClose: () => void;
    onGenerateMemo: (analysis: ResearchAnalysis) => void;
    onGenerateLetter: (analysis: ResearchAnalysis) => void;
}

const ExportOptionsModal: React.FC<ExportOptionsModalProps> = ({ analysis, onClose, onGenerateMemo, onGenerateLetter }) => {
    if (!analysis) return null;

    const handleGenerateMemo = () => {
        onGenerateMemo(analysis);
        onClose();
    };

    const handleGenerateLetter = () => {
        onGenerateLetter(analysis);
        onClose();
    };

    return (
        <div 
            className="fixed inset-0 bg-zinc-900 bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in" 
            aria-modal="true" 
            role="dialog"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-xl w-full max-w-md transform transition-all animate-scale-up" 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-lg font-semibold text-zinc-900">Advanced Export Options</h2>
                            <p className="text-sm text-zinc-600 mt-1">
                                Generate a document for: <span className="font-medium text-zinc-800">{analysis.situationTitle}</span>
                            </p>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="p-1.5 rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors -mt-1 -mr-1"
                            aria-label="Close modal"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button 
                            onClick={handleGenerateMemo} 
                            className="flex flex-col items-center justify-center p-6 bg-zinc-50 rounded-lg border-2 border-zinc-200 hover:border-teal-400 hover:bg-white transition-all text-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                        >
                            <DocumentTextIcon className="h-6 w-6 text-teal-500 mb-2" />
                            <span className="font-semibold text-zinc-800">Prepare Tax Memo</span>
                            <span className="text-xs text-zinc-500 mt-1">For internal review & documentation.</span>
                        </button>
                         <button 
                            onClick={handleGenerateLetter} 
                            className="flex flex-col items-center justify-center p-6 bg-zinc-50 rounded-lg border-2 border-zinc-200 hover:border-teal-400 hover:bg-white transition-all text-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                        >
                            <ChatBubbleLeftRightIcon className="h-6 w-6 text-teal-500 mb-2" />
                            <span className="font-semibold text-zinc-800">Prepare Client Letter</span>
                            <span className="text-xs text-zinc-500 mt-1">A clear summary for your client.</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExportOptionsModal;