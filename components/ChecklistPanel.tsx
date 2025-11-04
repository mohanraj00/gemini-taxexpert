import React from 'react';
import { TaxSituation } from '../types';
import { CheckCircleIcon, CircleIcon, XMarkIcon } from './icons/Icons';

interface ChecklistPanelProps {
    keyFactsGenerated: boolean;
    taxSituationsIdentified: boolean;
    allTaxSituations: TaxSituation[];
    researchedSituations: Set<string>;
    onClose?: () => void;
}

const ChecklistPanel: React.FC<ChecklistPanelProps> = ({ keyFactsGenerated, taxSituationsIdentified, allTaxSituations, researchedSituations, onClose }) => {
    
    const steps = [
        {
            label: 'Pull Key Facts',
            completed: keyFactsGenerated,
        },
        {
            label: 'Identify Tax Situations',
            completed: taxSituationsIdentified,
        }
    ];

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 md:sticky md:top-8">
            <div className="flex justify-between items-center mb-4">
                <h2 id="checklist-heading" className="text-base font-semibold text-slate-800">Research Checklist</h2>
                {onClose && (
                    <button 
                        onClick={onClose} 
                        className="p-1 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 md:hidden transition-colors"
                        aria-label="Close checklist"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                )}
            </div>
            <ul className="space-y-4">
                {steps.map((step, index) => (
                    <li key={index}>
                        <div className="flex items-center text-sm">
                            {step.completed ? (
                                <CheckCircleIcon className="h-6 w-6 mr-3 text-teal-500 flex-shrink-0" /> 
                            ) : (
                                <CircleIcon className="h-6 w-6 mr-3 text-slate-400 flex-shrink-0" />
                            )}
                            <span className={`transition-colors ${step.completed ? 'line-through text-slate-500' : 'text-slate-700 font-medium'}`}>
                                {step.label}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
            {taxSituationsIdentified && allTaxSituations.length > 0 && (
                 <div className="mt-4 pt-4 border-t border-slate-200/60">
                    <h3 className="text-xs font-semibold uppercase text-slate-500 mb-3 tracking-wider ml-1">Research</h3>
                    <ul className="space-y-3">
                        {allTaxSituations.map((situation) => {
                            const isResearched = researchedSituations.has(situation.id);
                            return (
                                <li key={situation.id} className="flex items-start text-sm">
                                    {isResearched ? (
                                        <CheckCircleIcon className="h-5 w-5 mr-3 mt-px text-teal-500 flex-shrink-0" />
                                    ) : (
                                        <CircleIcon className="h-5 w-5 mr-3 mt-px text-slate-400 flex-shrink-0" />
                                    )}
                                    <span className={`transition-colors ${isResearched ? 'line-through text-slate-500' : 'text-slate-600'}`}>
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