import React, { useState } from 'react';
import { TaxSituation } from '../types';
import { LightBulbIcon, BookOpenIcon, CheckIcon, PlusIcon, ArrowRightIcon } from './icons/Icons';

interface TaxSituationsWidgetProps {
    situations: TaxSituation[];
    onResearch: (situation: TaxSituation) => void;
    researchedSituations: Set<string>;
    onSuggestResearch: (topic: string) => void;
}

const TaxSituationsWidget: React.FC<TaxSituationsWidgetProps> = ({ situations, onResearch, researchedSituations, onSuggestResearch }) => {
    const [newTopic, setNewTopic] = useState('');
    
    if (!situations || situations.length === 0) {
        return null;
    }

    const handleSuggest = () => {
        if (newTopic.trim()) {
            onSuggestResearch(newTopic);
            setNewTopic('');
        }
    };

    // Find the index of the first situation that has not been researched yet.
    const firstUnresearchedIndex = situations.findIndex(s => !researchedSituations.has(s.id));

    return (
        <div className="border-t border-slate-200 mt-4 p-4 bg-indigo-50">
            <h3 className="flex items-center text-sm font-semibold text-indigo-800 mb-4">
                <LightBulbIcon className="h-5 w-5 mr-2 text-indigo-500" />
                Potential Tax Situations to Explore
            </h3>
            <div className="space-y-3">
                {situations.map((situation, index) => {
                    // A situation is researchable if it's the first unresearched one in the list.
                    // If all are researched, firstUnresearchedIndex will be -1, so nothing is researchable.
                    const isResearchable = firstUnresearchedIndex !== -1 && index === firstUnresearchedIndex;

                    return (
                        <div key={index} className="bg-white p-3 rounded-md border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-grow">
                                    <p className="font-semibold text-sm text-slate-800">{situation.title}</p>
                                    <p className="text-sm text-slate-600 mt-1">{situation.description}</p>
                                </div>
                                <button
                                    onClick={() => onResearch(situation)}
                                    disabled={!isResearchable}
                                    className="ml-4 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                                >
                                    <BookOpenIcon className="mr-1.5 h-4 w-4" />
                                    Research
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="mt-4">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSuggest();
                    }}
                    className="flex items-center gap-2 p-1 pl-3 bg-white rounded-full border border-slate-300 shadow-sm"
                >
                    <button type="button" className="p-1 rounded-full text-slate-500 hover:bg-slate-100 transition-colors flex-shrink-0">
                        <PlusIcon className="h-5 w-5"/>
                    </button>
                    <input 
                        type="text" 
                        value={newTopic}
                        onChange={(e) => setNewTopic(e.target.value)}
                        placeholder="Add another research topic..." 
                        className="flex-grow bg-transparent focus:outline-none text-sm text-slate-700 placeholder-slate-500"
                    />
                    <button 
                        type="submit" 
                        disabled={!newTopic.trim()}
                        aria-label="Suggest topic"
                        className="p-2 rounded-full bg-slate-700 text-white hover:bg-slate-800 disabled:bg-slate-300 transition-colors flex-shrink-0"
                    >
                        <ArrowRightIcon className="h-4 w-4" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TaxSituationsWidget;