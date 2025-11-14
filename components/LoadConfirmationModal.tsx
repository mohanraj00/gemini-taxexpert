
import React from 'react';
import { ExclamationTriangleIcon } from './icons/Icons';

interface LoadConfirmationModalProps {
    isVisible: boolean;
    onSave: () => void;
    onDiscard: () => void;
    onCancel: () => void;
}

const LoadConfirmationModal: React.FC<LoadConfirmationModalProps> = ({ isVisible, onSave, onDiscard, onCancel }) => {
    if (!isVisible) return null;

    return (
        <div 
            className="fixed inset-0 bg-zinc-900 bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in" 
            aria-modal="true" 
            role="dialog"
            onClick={onCancel}
        >
            <div 
                className="bg-white rounded-2xl shadow-xl w-full max-w-md transform transition-all animate-scale-up" 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex items-start">
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 sm:mx-0 sm:h-10 sm:w-10">
                            <ExclamationTriangleIcon className="h-6 w-6 text-amber-600" aria-hidden="true" />
                        </div>
                        <div className="mt-1 text-center sm:mt-0 sm:ml-4 sm:text-left">
                             <h2 className="text-lg font-semibold text-zinc-900" id="modal-title">
                                Unsaved Project
                            </h2>
                            <div className="mt-2">
                                <p className="text-sm text-zinc-600">
                                    Do you want to save your current work before loading a new project?
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-zinc-50 px-6 py-4 sm:flex sm:flex-row-reverse rounded-b-2xl gap-3">
                     <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-lg border border-transparent bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 sm:w-auto"
                        onClick={onSave}
                    >
                        Save and Continue
                    </button>
                    <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-lg border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:w-auto"
                        onClick={onDiscard}
                    >
                        Discard Changes
                    </button>
                    <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 sm:w-auto"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoadConfirmationModal;
