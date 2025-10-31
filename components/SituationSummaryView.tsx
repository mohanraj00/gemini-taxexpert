
import React from 'react';
import { SituationSummary } from '../types';
import { BookOpenIcon, DocumentTextIcon, LightBulbIcon } from './icons/Icons';

interface SituationSummaryViewProps {
  data: SituationSummary;
}

const SituationSummaryView: React.FC<SituationSummaryViewProps> = ({ data }) => {
  return (
    <div className="bg-slate-100/70 border border-slate-200/80 rounded-lg p-5 prose prose-slate prose-sm max-w-none">
        <h3 className="!text-base !font-semibold !text-slate-800 !mt-0 !mb-3 !border-b !border-slate-300 !pb-2 flex items-center">
            <BookOpenIcon className="h-5 w-5 mr-2 text-slate-600" />
            Executive Summary
        </h3>
        <p className="!my-0 text-slate-700">{data.executiveSummary}</p>

        <h3 className="!text-base !font-semibold !text-slate-800 !mt-6 !mb-3 !border-b !border-slate-300 !pb-2 flex items-center">
            <DocumentTextIcon className="h-5 w-5 mr-2 text-slate-600"/>
            Key Facts
        </h3>
        <div className="space-y-4">
            {data.keyFacts.map((categoryItem, index) => (
                <div key={index}>
                    <h4 className="!text-sm !font-semibold !text-slate-700 !mt-0 !mb-2">{categoryItem.category}</h4>
                    <ul className="!my-0 !pl-5 !list-disc !space-y-1">
                        {categoryItem.details.map((detail, detailIndex) => (
                            <li key={detailIndex} className="text-slate-600">{detail}</li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>

        <h3 className="!text-base !font-semibold !text-slate-800 !mt-6 !mb-3 !border-b !border-slate-300 !pb-2 flex items-center">
            <LightBulbIcon className="h-5 w-5 mr-2 text-slate-600" />
            Identified Issues for Research
        </h3>
        <ul className="!my-0 !pl-5 !list-disc !space-y-1">
            {data.identifiedIssues.map((issue, index) => (
                <li key={index} className="text-slate-600">{issue}</li>
            ))}
        </ul>
    </div>
  );
};

export default SituationSummaryView;