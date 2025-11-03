
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
                        {step.label === 'Identify Tax Situations' && taxSituationsIdentified && allTaxSituations.length > 0 && (
                             <ul className="mt-3 pl-9 space-y-2 border-l border-slate-200 ml-3">
                                {allTaxSituations.map((situation) => {
                                    const isResearched = researchedSituations.has(situation.id);
                                    return (
                                        <li key={situation.id} className="flex items-start text-sm">
                                            {isResearched ? (
                                                <CheckCircleIcon className="h-4 w-4 mr-3 mt-0.5 text-teal-500 flex-shrink-0" />
                                            ) : (
                                                <CircleIcon className="h-4 w-4 mr-3 mt-0.5 text-slate-400 flex-shrink-0" />
                                            )}
                                            <span className={`transition-colors ${isResearched ? 'line-through text-slate-500' : 'text-slate-600'}`}>
                                                {situation.title}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ChecklistPanel;
