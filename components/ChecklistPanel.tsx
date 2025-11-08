
import React from 'react';
import { CheckCircleIcon, CircleIcon, XMarkIcon, DocumentDownloadIcon, LoadingSpinner } from './icons/Icons';
import { useAppContext } from '../contexts/AppContext';

interface ChecklistPanelProps {
    onClose?: () => void;
}

const ChecklistPanel: React.FC<ChecklistPanelProps> = ({ onClose }) => {
    const { 
        keyFactsGenerated, 
        taxSituationsIdentified, 
        allTaxSituations, 
        researchedSituations,
        currentAction,
        handleExportKeyFacts, 
        handleExportTaxSituations, 
        reAnalyzeKeyFacts,
        analyzeTaxSituations,
    } = useAppContext();
    
    const steps = [
        {
            label: 'Pull Key Facts',
            completed: keyFactsGenerated,
            onReAnalyze: reAnalyzeKeyFacts,
            actionName: 'pull-facts',
        },
        {
            label: 'Identify Tax Situations',
            completed: taxSituationsIdentified,
            onReAnalyze: analyzeTaxSituations,
            actionName: 'identify-situations',
        }
    ];

    return (
        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 md:sticky md:top-4 h-full">
            <div className="flex justify-between items-center mb-4">
                <h2 id="checklist-heading" className="text-lg font-semibold text-zinc-900">Research Checklist</h2>
                {onClose && (
                    <button 
                        onClick={onClose} 
                        className="p-1 text-zinc-500 hover:text-zinc-800 rounded-full hover:bg-zinc-100 md:hidden transition-colors"
                        aria-label="Close checklist"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                )}
            </div>
            <ul className="space-y-3">
                {steps.map((step, index) => (
                    <li key={index} className="flex items-center justify-between">
                        <div className="flex items-center text-sm">
                            <div className="relative w-6 h-6 mr-3 flex items-center justify-center">
                                {currentAction === step.actionName && (
                                    <div className="absolute -inset-1">
                                        <LoadingSpinner className="h-8 w-8 text-orange-500 animate-spin" />
                                    </div>
                                )}
                                {step.completed ? (
                                    <button
                                        onClick={step.onReAnalyze}
                                        disabled={!!currentAction}
                                        aria-label={`Re-analyze ${step.label}`}
                                        className="text-emerald-500 disabled:opacity-50 disabled:cursor-wait"
                                    >
                                        <CheckCircleIcon className="h-6 w-6" /> 
                                    </button>
                                ) : (
                                    <CircleIcon className="h-6 w-6 text-zinc-300" />
                                )}
                            </div>
                            <span className={`font-medium ${step.completed ? 'text-emerald-800' : 'text-zinc-700'}`}>
                                {step.label}
                            </span>
                        </div>
                        {index === 0 && step.completed && (
                            <button
                                onClick={handleExportKeyFacts}
                                className="p-1.5 rounded-full text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700 transition-colors"
                                aria-label="Export Key Facts"
                                disabled={!!currentAction}
                            >
                                <DocumentDownloadIcon className="h-5 w-5" />
                            </button>
                        )}
                        {index === 1 && step.completed && (
                            <button
                                onClick={handleExportTaxSituations}
                                className="p-1.5 rounded-full text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700 transition-colors"
                                aria-label="Export Tax Situations"
                                disabled={!!currentAction}
                            >
                                <DocumentDownloadIcon className="h-5 w-5" />
                            </button>
                        )}
                    </li>
                ))}
            </ul>
            {taxSituationsIdentified && allTaxSituations.length > 0 && (
                 <div className="mt-4 pt-4 border-t border-zinc-200/60">
                    <h3 className="text-sm font-semibold text-zinc-800 mb-3 ml-1">Research Topics</h3>
                    <ul className="space-y-2">
                        {allTaxSituations.map((situation) => {
                            const isResearched = researchedSituations.has(situation.id);
                            const isLoading = currentAction === `research-${situation.id}`;
                            return (
                                <li key={situation.id} className="flex items-start text-sm">
                                    <div className="relative w-5 h-5 mr-3 mt-0.5 flex items-center justify-center flex-shrink-0">
                                        {isLoading && (
                                            <div className="absolute -inset-1">
                                                <LoadingSpinner className="h-7 w-7 text-orange-500 animate-spin" />
                                            </div>
                                        )}
                                        {isResearched ? (
                                            <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
                                        ) : (
                                            <CircleIcon className="h-5 w-5 text-zinc-300" />
                                        )}
                                    </div>
                                    <span className={isResearched ? 'text-emerald-700' : 'text-zinc-600'}>
                                        {situation.title}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ChecklistPanel;
