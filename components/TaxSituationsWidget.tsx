
import React, { useState } from 'react';
import { TaxSituation } from '../types';
import { LightBulbIcon, BookOpenIcon, CheckIcon, PlusIcon, ArrowRightIcon } from './icons/Icons';
import { useAppContext } from '../contexts/AppContext';

interface TaxSituationsWidgetProps {
    situations: TaxSituation[];
}

const TaxSituationsWidget: React.FC<TaxSituationsWidgetProps> = ({ situations }) => {
    const { researchSituationHandler, researchedSituations, sendMessage } = useAppContext();
    const [newTopic, setNewTopic] = useState('');
    
    if (!situations || situations.length === 0) {
        return null;
    }

    const onSuggestResearch = (topic: string) => {
        sendMessage(`I'd like to research another topic: "${topic}"`);
    };

    const handleSuggest = () => {
        if (newTopic.trim()) {
            onSuggestResearch(newTopic);
            setNewTopic('');
        }
    };

    // Find the index of the first situation that has not been researched yet.
    const firstUnresearchedIndex = situations.findIndex(s => !researchedSituations.has(s.id));

    return (
        <div className="border-t-4 border-indigo-400 mt-4 p-4 bg-zinc-50/50">
            <div className="flex justify-between items-center mb-4">
                <h3 className="flex items-center text-sm font-semibold text-indigo-800">
                    <LightBulbIcon className="h-5 w-5 mr-2 text-indigo-500" />
                    Potential Tax Situations to Explore
                </h3>
            </div>
            <div className="space-y-3">
                {situations.map((situation, index) => {
                    const isResearchable = firstUnresearchedIndex !== -1 && index === firstUnresearchedIndex;
                    const isResearched = researchedSituations.has(situation.id);

                    return (
                        <div key={index} className="bg-white p-3 rounded-lg border border-zinc-200 shadow-sm">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-grow">
                                    <p className="font-semibold text-sm text-zinc-800">{situation.title}</p>
                                    <p className="text-sm text-zinc-600 mt-1">{situation.description}</p>
                                </div>
                                {isResearched ? (
                                    <div className="ml-4 inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full text-emerald-700 bg-emerald-100 flex-shrink-0">
                                       <CheckIcon className="mr-1.5 h-4 w-4" />
                                       Researched
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => researchSituationHandler(situation)}
                                        disabled={!isResearchable}
                                        className="ml-4 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-zinc-200 disabled:text-zinc-500 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                                    >
                                        <BookOpenIcon className="mr-1.5 h-4 w-4" />
                                        Research
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="mt-5">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSuggest();
                    }}
                    className="relative flex items-center"
                >
                    <PlusIcon className="absolute left-3 h-5 w-5 text-zinc-400 pointer-events-none"/>
                    <input 
                        type="text" 
                        value={newTopic}
                        onChange={(e) => setNewTopic(e.target.value)}
                        placeholder="Add another research topic..." 
                        className="w-full pl-10 pr-20 py-2 bg-white rounded-full border border-zinc-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm text-zinc-700 placeholder-zinc-500"
                    />
                    <button 
                        type="submit" 
                        disabled={!newTopic.trim()}
                        aria-label="Suggest topic"
                        className="absolute right-1.5 p-1.5 rounded-full bg-zinc-700 text-white hover:bg-zinc-800 disabled:bg-zinc-300 transition-colors flex-shrink-0"
                    >
                        <ArrowRightIcon className="h-4 w-4" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TaxSituationsWidget;
