
import React from 'react';
import { SparklesIcon, BeakerIcon, BookOpenIcon } from './icons/Icons';
import { useAppContext } from '../contexts/AppContext';

interface ActionButtonsProps {
    hasInput: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ hasInput }) => {
    const {
        isLoading,
        keyFactsGenerated,
        taxSituationsIdentified,
        allTaxSituations,
        researchedSituations,
        analyzeTaxSituations,
        researchSituationHandler,
    } = useAppContext();

    const showPullKeyFactsAction = hasInput && !keyFactsGenerated;
    const showAnalyzeSituationsAction = keyFactsGenerated && !taxSituationsIdentified;
    const nextSituationToResearch = allTaxSituations.find(s => !researchedSituations.has(s.id));
    
    if (isLoading) {
        return null;
    }

    const shouldRender = showPullKeyFactsAction || showAnalyzeSituationsAction || (taxSituationsIdentified && nextSituationToResearch);

    if (!shouldRender) {
        return null;
    }

    const buttonBaseClasses = "inline-flex items-center px-4 py-2 border border-zinc-200/80 text-sm font-medium rounded-full text-zinc-800 bg-white hover:bg-indigo-50 hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-zinc-100 disabled:text-zinc-500 transition-colors";
    const iconBaseClasses = "mr-2 h-5 w-5 text-zinc-500";

    return (
        <div className="flex flex-wrap gap-2 mb-3 animate-fade-in-up">
            {showPullKeyFactsAction && (
                <button
                    type="submit"
                    form="chat-form"
                    disabled={isLoading}
                    className={buttonBaseClasses}
                >
                    <SparklesIcon className={iconBaseClasses} />
                    Pull Key Facts
                </button>
            )}
            {showAnalyzeSituationsAction && (
                <button
                    type="button"
                    onClick={analyzeTaxSituations}
                    disabled={isLoading}
                    className={buttonBaseClasses}
                >
                    <BeakerIcon className={iconBaseClasses} />
                    Identify Tax Situations
                </button>
            )}
            {taxSituationsIdentified && nextSituationToResearch && (
                <button
                    type="button"
                    onClick={() => researchSituationHandler(nextSituationToResearch)}
                    disabled={isLoading}
                    className={buttonBaseClasses}
                >
                    <BookOpenIcon className={iconBaseClasses} />
                    Research: {nextSituationToResearch.title}
                </button>
            )}
        </div>
    );
};

export default ActionButtons;
