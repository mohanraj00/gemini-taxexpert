
import React from 'react';
import { TaxImplication, ResearchResult, ResearchContent } from '../types';
import { LoadingSpinner, BookOpenIcon, ScaleIcon, BeakerIcon, LightBulbIcon } from './icons/Icons';

interface ResearchPanelProps {
  implication: TaxImplication | null;
  researchResult: ResearchResult | null;
  isLoading: boolean;
}

const ResearchCard: React.FC<{ item: ResearchContent; icon: React.ReactNode }> = ({ item, icon }) => (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <div className="flex items-center mb-2">
            {icon}
            <h4 className="text-md font-semibold text-slate-700 ml-2">{item.title}</h4>
        </div>
        <p className="text-sm text-slate-600 whitespace-pre-wrap">{item.content}</p>
    </div>
);

const ResearchPanel: React.FC<ResearchPanelProps> = ({ implication, researchResult, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 h-full flex items-center justify-center">
        <div className="text-center">
            <LoadingSpinner className="animate-spin h-8 w-8 text-indigo-600 mx-auto" />
            <p className="mt-2 text-slate-500">Researching implication...</p>
        </div>
      </div>
    );
  }

  if (!implication) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 h-full flex items-center justify-center">
        <div className="text-center text-slate-500">
          <p>Select a tax implication from the list to view the research details here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
      <h3 className="text-xl font-bold text-slate-800 mb-4">{implication.issue}</h3>
      {researchResult ? (
        <div className="space-y-4 animate-fade-in">
          <ResearchCard item={researchResult.primaryLaw} icon={<BookOpenIcon className="h-5 w-5 text-blue-600" />} />
          <ResearchCard item={researchResult.administrativeGuidance} icon={<ScaleIcon className="h-5 w-5 text-purple-600" />} />
          <ResearchCard item={researchResult.judicialPrecedent} icon={<BeakerIcon className="h-5 w-5 text-red-600" />} />
          <ResearchCard item={researchResult.application} icon={<LightBulbIcon className="h-5 w-5 text-yellow-500" />} />
        </div>
      ) : (
        <div className="text-center text-slate-500 py-8">
          <p>Click "Research" on an implication to begin.</p>
        </div>
      )}
    </div>
  );
};

export default ResearchPanel;
