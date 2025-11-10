import React from 'react';
import { CheckCircleIcon, XMarkIcon, DocumentDownloadIcon, LoadingSpinner, BookOpenIcon, DocumentDuplicateIcon, DocumentTextIcon, ChatBubbleLeftRightIcon } from './icons/Icons';
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
        researchAnalyses,
        cachedDocuments,
        currentAction,
        handleExportKeyFacts, 
        handleExportTaxSituations, 
        handleExportResearchAnalysis,
        handleExportGeneratedDocument,
        openExportModal,
        reAnalyzeKeyFacts,
        analyzeTaxSituations,
        researchSituationHandler,
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

    const nextSituationToResearch = allTaxSituations.find(s => !researchedSituations.has(s.id));

    return (
        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
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
            <div className="flex-grow overflow-y-auto">
                <ul className="space-y-2">
                    {steps.map((step, index) => (
                        <li key={index} className="flex items-center justify-between">
                            <div className="flex items-center text-sm">
                                <div className="relative w-5 h-5 mr-2 flex items-center justify-center">
                                    {currentAction === step.actionName && (
                                        <div className="absolute -inset-1">
                                            <LoadingSpinner className="h-7 w-7 text-orange-500 animate-spin" />
                                        </div>
                                    )}
                                    {step.completed ? (
                                        <button
                                            onClick={step.onReAnalyze}
                                            disabled={!!currentAction}
                                            aria-label={`Re-analyze ${step.label}`}
                                            className="text-emerald-500 disabled:opacity-50 disabled:cursor-wait"
                                        >
                                            <CheckCircleIcon className="h-5 w-5" /> 
                                        </button>
                                    ) : (
                                        <div className="h-5 w-5 rounded-full bg-zinc-200" />
                                    )}
                                </div>
                                <span className={`font-medium ${step.completed ? 'text-emerald-800' : 'text-zinc-700'}`}>
                                    {step.label}
                                </span>
                            </div>
                            {index === 0 && step.completed && (
                                <button
                                    onClick={handleExportKeyFacts}
                                    className="p-1 rounded-full text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700 transition-colors"
                                    aria-label="Export Key Facts"
                                    disabled={!!currentAction}
                                >
                                    <DocumentDownloadIcon className="h-4 w-4" />
                                </button>
                            )}
                            {index === 1 && step.completed && (
                                <button
                                    onClick={handleExportTaxSituations}
                                    className="p-1 rounded-full text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700 transition-colors"
                                    aria-label="Export Tax Situations"
                                    disabled={!!currentAction}
                                >
                                    <DocumentDownloadIcon className="h-4 w-4" />
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
                {taxSituationsIdentified && allTaxSituations.length > 0 && (
                     <div className="mt-4 pt-4 border-t border-zinc-200/60">
                        <h3 className="text-sm font-semibold text-zinc-800 mb-2">Research Topics</h3>
                        <ul className="space-y-1">
                            {allTaxSituations.map((situation) => {
                                const isResearched = researchedSituations.has(situation.id);
                                const isLoading = currentAction === `research-${situation.id}`;
                                const isNext = nextSituationToResearch?.id === situation.id;
                                const isClickable = ((isNext && !isResearched) || isResearched) && !isLoading;
                                const analysis = researchAnalyses[situation.id];
                                const cachedDoc = cachedDocuments[situation.id];
                                
                                return (
                                    <li key={situation.id} className="flex items-center justify-between group">
                                        <button
                                            onClick={isClickable ? () => researchSituationHandler(situation) : undefined}
                                            disabled={!!currentAction && !isLoading}
                                            aria-label={isClickable ? `Research ${situation.title}` : situation.title}
                                            className={`flex-grow flex items-start text-left text-sm p-1 rounded-lg transition-colors ${
                                                isClickable 
                                                    ? 'group-hover:bg-teal-50 cursor-pointer' 
                                                    : 'cursor-default'
                                            } ${
                                                (!!currentAction && !isLoading) ? 'opacity-60' : ''
                                            }`}
                                        >
                                            <div className="relative w-4 h-4 mr-2 mt-0.5 flex items-center justify-center flex-shrink-0">
                                                {isLoading ? (
                                                    <div className="absolute -inset-1 flex items-center justify-center">
                                                         <BookOpenIcon className="h-5 w-5 text-orange-500 animate-pulse" />
                                                    </div>
                                                ) : isResearched ? (
                                                    <BookOpenIcon className="h-4 w-4 text-emerald-500" />
                                                ) : (
                                                    <BookOpenIcon className="h-4 w-4 text-zinc-400" />
                                                )}
                                            </div>
                                            <span className={`flex-grow ${isResearched ? 'text-emerald-700' : 'text-zinc-600'}`}>
                                                {situation.title}
                                            </span>
                                        </button>
                                        {isResearched && (
                                            <div className="flex items-center space-x-0.5 ml-2 flex-shrink-0">
                                                {cachedDoc?.memo && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleExportGeneratedDocument(cachedDoc.memo!);
                                                        }}
                                                        className="p-1.5 rounded-full text-sky-600 hover:bg-sky-100 transition-colors"
                                                        aria-label={`Download cached memo for ${situation.title}`}
                                                        title="Download Cached Memo"
                                                        disabled={!!currentAction}
                                                    >
                                                        <DocumentTextIcon className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {cachedDoc?.letter && (
                                                     <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleExportGeneratedDocument(cachedDoc.letter!);
                                                        }}
                                                        className="p-1.5 rounded-full text-teal-600 hover:bg-teal-100 transition-colors"
                                                        aria-label={`Download cached letter for ${situation.title}`}
                                                        title="Download Cached Letter"
                                                        disabled={!!currentAction}
                                                    >
                                                        <ChatBubbleLeftRightIcon className="h-4 w-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (analysis) {
                                                            openExportModal(analysis, situation.id);
                                                        }
                                                    }}
                                                    className="p-1.5 rounded-full text-zinc-400 hover:bg-teal-100 hover:text-teal-600 transition-colors"
                                                    aria-label={`Advanced export for ${situation.title}`}
                                                    title="Advanced Export"
                                                    disabled={!!currentAction}
                                                >
                                                    <DocumentDuplicateIcon className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (analysis) {
                                                            handleExportResearchAnalysis(analysis);
                                                        }
                                                    }}
                                                    className="p-1.5 rounded-full text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 transition-colors"
                                                    aria-label={`Export analysis for ${situation.title}`}
                                                    title="Export Raw Analysis"
                                                    disabled={!!currentAction}
                                                >
                                                    <DocumentDownloadIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChecklistPanel;