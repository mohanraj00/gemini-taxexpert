
import React from 'react';
import { TaxImplication, ResearchResult } from '../types';
import { CheckCircleIcon } from './icons/Icons';

interface ImplicationsListProps {
  implications: TaxImplication[];
  researchResults: Record<number, ResearchResult>;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}

const ImplicationsList: React.FC<ImplicationsListProps> = ({ implications, researchResults, selectedIndex, onSelect }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 h-full">
      <h3 className="font-semibold text-slate-700 mb-3 border-b pb-2">Tax Implications to Research</h3>
      <ul className="space-y-2">
        {implications.map((item, index) => {
          const isResearched = !!researchResults[index];
          const isSelected = selectedIndex === index;
          return (
            <li key={index}>
              <button
                onClick={() => onSelect(index)}
                className={`w-full text-left p-3 rounded-md transition-colors duration-150 flex items-start justify-between ${
                  isSelected
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <span className="flex-1 pr-2">{item.issue}</span>
                {isResearched && (
                  <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ImplicationsList;
