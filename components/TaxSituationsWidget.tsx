
import React from 'react';
import { TaxSituation } from '../types';
import { LightBulbIcon, BookOpenIcon, CheckIcon } from './icons/Icons';

interface TaxSituationsWidgetProps {
    situations: TaxSituation[];
    onResearch: (situation: TaxSituation) => void;
    researchedSituations: Set<string>;
}

const TaxSituationsWidget: React.FC<TaxSituationsWidgetProps> = ({ situations, onResearch, researchedSituations }) => {
    if (!situations || situations.length === 0) {
        return null;
    }

    return (
        <div className="border-t border-slate-200 mt-4 p-4 bg-indigo-50">
            <h3 className="flex items-center text-sm font-semibold text-indigo-800 mb-4">
                <LightBulbIcon className="h-5 w-5 mr-2 text-indigo-500" />
                Potential Tax Situations to Explore
            </h3>
            <div className="space-y-3">
                {situations.map((situation, index) => {
                    const isResearched = researchedSituations.has(situation.id);
                    return (
                        <div key={index} className="bg-white p-3 rounded-md border border-slate-200">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-grow">
                                    <p className="font-semibold text-sm text-slate-800">{situation.title}</p>
                                    <p className="text-sm text-slate-600 mt-1">{situation.description}</p>
                                </div>
                                <button
                                    onClick={() => onResearch(situation)}
                                    disabled={isResearched}
                                    className="ml-4 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                                >
                                    {isResearched ? (
                                        <>
                                            <CheckIcon className="mr-1.5 h-4 w-4" />
                                            Researched
                                        </>
                                    ) : (
                                        <>
                                            <BookOpenIcon className="mr-1.5 h-4 w-4" />
                                            Research
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TaxSituationsWidget;
